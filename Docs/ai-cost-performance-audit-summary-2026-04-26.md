# Executive Summary — AI Cost & Performance Investigation

**Date:** 2026-04-26  
**Source prompt:** `task.md` (AI Cost & Performance Audit)  
**Full report:** `Docs/audit-ai-cost-performance-2026-04-26.md`

---

## Bottom line

The app routes **all** Claude calls through **`createChatCompletion`** in `lib/ai/client.ts`, using **`ANTHROPIC_MODEL`** (default **Sonnet**). The **highest cost and worst latency** are concentrated on **two product flows**: (1) **public lead chat**, which runs **three sequential Sonnet calls per message** and **does not save token or latency data**; (2) **pattern extraction**, which allows up to **6000 output tokens** and sends a **very long fixed system prompt** every time.

---

## Numbers that matter

| Metric | Value |
|--------|--------|
| **Active `createChatCompletion` call sites (runtime)** | **14** across 8 logical features (excluding dead modules) |
| **Dead call sites** | **3** (`early-exit-detector`, `objection-tracker` — not imported by `app/`) |
| **Largest `max_tokens`** | **6000** — extraction only (`lib/extraction/extraction-engine.ts`) |
| **Worst blocking chain** | **3×** API round-trips per lead message (`lib/ai/closer-conversation.ts`) |
| **`/end` with profile** | **3×** API calls minimum (2 inside `scoreConversation` + 1 for name/email) |
| **Audit overall score** | **5.5 / 10** (early production: works, but expensive and hard to measure) |

---

## Top cost drivers

1. **Extraction** — one big call per simulation / re-extract batch.  
2. **Lead assistant (CLOSER)** — triple call + huge system prompts built from profile JSON.  
3. **Simulation turns** — full system prompt every message.

---

## Top performance issues

1. **Sequential Sonnet calls** on the public widget (user-perceived delay adds up).  
2. **No HTTP-level timeout** around `messages.create` (risk of long hangs).  
3. **Hybrid scorer** runs two analysis calls **one after the other** though they could run **in parallel**.

---

## Fastest wins

| Action | Expected effect |
|--------|-----------------|
| **Merge or drop** the extra name/email call on `/end`** | −1 Sonnet call per closed conversation |
| **`Promise.all`** for `extractLeadInfo` + `analyzeEngagementAndAlignment` | materially faster `/end` |
| **Use `parseAiJson` everywhere** (replace remaining `JSON.parse`) | fewer silent failures / less rework |
| **Plumb real `tokensUsed` / `latencyMs`** from closer calls into `ConversationMessage` | unlocks real cost dashboards |
| **Call `logAIUsage` from the client wrapper** (or equivalent) | stop flying blind on spend |

---

## Severity snapshot

- **Critical ×2** — triple blocking lead pipeline; zero usage on lead messages.  
- **High ×4** — fragile JSON parsing in closer + dead modules pattern, unused usage logger, extraction burst, re-extract fan-out.  
- **Medium ×5** — config not wired, duplicate `/end` call, sequential hybrid, no retry/backoff.  
- **Low ×3** — unused import, single-model pricing map, unused helper.

---

## What was *not* found

- No second AI vendor in `app/` or `lib/`.  
- No unbounded **retry loops** on AI failures.  
- No **`createChatCompletion` inside a tight loop** in request handlers (re-extract uses bounded concurrency).

---

For tables, file:line references, phased remediation, and the full inventory, open the **full audit** linked at the top.
