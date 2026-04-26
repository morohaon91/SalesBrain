# AI Cost & Performance Audit Report

**Audit topic:** Anthropic Claude usage, cost drivers, latency, and waste in the SalesBrain Next.js SaaS codebase.  
**Date:** 2026-04-26  
**Methodology:** Static analysis of all `createChatCompletion` / `@anthropic-ai/sdk` call paths, `max_tokens` budgets, prompt construction, parallelism, and cross-reference with `errors.md` runtime traces. No production traffic logs were available; cost figures use representative token assumptions and official Sonnet 4 list pricing from `task.md`.

---

## Executive Summary (project audit format)

| Field | Value |
|--------|--------|
| **Overall score (1–10)** | **5.5** — workable architecture with one central client, but blocking multi-call chains on the hottest path, weak cost observability, and config drift. |
| **Maturity** | **Early production** — extraction and simulations track tokens; lead widget path does not; usage logging is stubbed. |
| **Category scores** | Cost control: 4 · Latency / UX: 5 · Reliability (JSON parsing): 6 · Observability: 4 · Maintainability (dead code / config): 6 |
| **Severity distribution** | Critical: 2 · High: 4 · Medium: 5 · Low: 3 · **Total: 14** |

**Top 3 cost drivers (by architecture, not live metering):**

1. **Pattern extraction** — single call with `maxTokens: 6000`, very large fixed `EXTRACTION_SYSTEM_PROMPT` plus full simulation transcript (`lib/extraction/extraction-engine.ts`).
2. **Lead chat replies (`generateCloserResponse`)** — **three sequential Sonnet calls per user message** (state → reply → phase detection), each resending a large system prompt built from full profile JSON (`lib/ai/closer-conversation.ts`).
3. **Simulation turns** — full scenario/persona system prompt on **every** message (`app/api/v1/simulations/[id]/message/route.ts`).

**Top 3 performance issues:**

1. **Triple sequential AI round-trip on public lead `/message`** — worst-case wall time is sum of three network + inference latencies; no client-visible streaming.
2. **`scoreConversation` sequential internal calls** — `extractLeadInfo` then `analyzeEngagementAndAlignment` could be parallelized after a small refactor (rules scoring only needs extraction result; engagement analysis does not).
3. **No request-level timeouts** on `createChatCompletion` — hung API calls block route handlers until platform limits.

**Potential savings (directional):**

- Consolidating lead reply to **1–2** calls and/or using **Haiku** for structured JSON subtasks: often **40–70%** reduction on lead-message path (output is small; savings dominated by fewer round-trips and cheaper model for classifiers).
- **Prompt caching** (Anthropic) on static system strings (extraction layers, simulation persona templates): **~50–90%** discount on repeated long prefix (official cache pricing applies to cache reads).
- Parallelizing hybrid scorer’s two analysis calls: **~30–50%** wall-clock reduction on `/end` (not full token savings).

---

## Audit Scope and Methodology

- **In scope:** All TypeScript paths invoking `createChatCompletion` in `lib/` and `app/api/`, `lib/ai/client.ts`, `lib/ai/usage.ts`, `lib/ai/prompts/config.ts`, `errors.md` correlation.
- **Out of scope:** Third-party docs under `Docs/_archive`, runtime A/B of model behavior, exact tenant-level usage (DB aggregation not implemented).

**Pricing reference (from `task.md`, Sonnet 4):** $3 / 1M input tokens, $15 / 1M output tokens. Haiku / Opus figures in `task.md` reserved for future model mix recommendations.

---

## Findings

### Critical

| ID | Description | Location | Impact | Remediation |
|----|-------------|----------|--------|-------------|
| C-1 | **Three sequential `createChatCompletion` calls** per lead assistant turn (conversation state, main reply, phase completion). | `lib/ai/closer-conversation.ts` — `analyzeConversationState` (~148), `generateCloserResponse` (~68), `detectPhaseCompletion` (~395); invoked from `app/api/v1/public/lead-chat/[widgetApiKey]/message/route.ts` (~130) | Lead waits for 3× RTT + inference; cost scales linearly with turns; worst UX path. | Merge state + reply in one call with structured output, or run state+phase with **Haiku** and a single Sonnet reply; add streaming if product requires. |
| C-2 | **Lead widget stores `tokensUsed: 0` and `latencyMs: 0`** despite real AI work. | `app/api/v1/public/lead-chat/[widgetApiKey]/message/route.ts` (~136–139) | No per-tenant cost attribution; breaks analytics and falsifies `ConversationMessage` records. | Plumb through `generateCloserResponse` aggregate usage from nested `createChatCompletion` results (sum input/output/latency) or refactor to single call returning metrics. |

### High

| ID | Description | Location | Impact | Remediation |
|----|-------------|----------|--------|-------------|
| H-1 | **`JSON.parse` on raw model text** without `parseAiJson` — fails when the model wraps JSON in markdown fences (matches `errors.md` class of failures on other routes historically). | `lib/scoring/early-exit-detector.ts` (~58); `lib/ai/objection-tracker.ts` (~71); `lib/ai/closer-conversation.ts` (~159, ~406) | Intermittent logic errors or swallowed errors; wasted tokens on retry/repair paths. | Standardize on `parseAiJson` from `lib/ai/client.ts` (already used in hybrid scorer and several routes). |
| H-2 | **`logAIUsage` never called** — usage module is dead weight. | `lib/ai/usage.ts` (`logAIUsage`); grep shows **no** importers outside self. | No centralized cost or latency telemetry. | Call from `createChatCompletion` success path (with tenant/simulation/conversation IDs passed through options) or emit to metrics backend. |
| H-3 | **Extraction `maxTokens: 6000`** — largest budget in codebase; justified for huge JSON but drives peak cost. | `lib/extraction/extraction-engine.ts` (~87, ~152) | One completion can approach **~$0.09+** output-only at cap (6000 × $15/1M) plus large input from prompt + transcript. | Schema splitting (layered extractions), response compression, or lower cap with repair loop; enable prompt caching on `EXTRACTION_SYSTEM_PROMPT`. |
| H-4 | **Re-extract route** fires **one extraction per completed simulation**, batches of 3 concurrent, each up to **90s** timeout. | `app/api/v1/profile/re-extract/route.ts` | Tenant-triggered **N × (extraction cost)** burst; can exhaust rate limits and budget. | Queue-based worker, stronger caps, or incremental diff extraction. |

### Medium

| ID | Description | Location | Impact | Remediation |
|----|-------------|----------|--------|-------------|
| M-1 | **`PROMPT_CONFIGS` / `AI_MODELS` not wired** into `createChatCompletion` — model always `AI_CONFIG.model` / env. | `lib/ai/prompts/config.ts` vs `lib/ai/client.ts` (~50) | Documentation/config drift; cannot route Haiku for cheap tasks without code change. | Pass `model` into `createChatCompletion` or read `getPromptConfig(taskType)`. |
| M-2 | **Duplicate AI on conversation end (profile path):** `scoreConversation` already reads transcript twice internally, then **additional** `basicResponse` call for name/email only. | `app/api/v1/public/lead-chat/[widgetApiKey]/end/route.ts` (~91–109) | Extra Sonnet call per ended conversation. | Extend hybrid JSON to include `leadName` / `leadEmail` or merge prompts. |
| M-3 | **`scoreConversation` runs two AI calls sequentially** where second does not depend on output of first for *prompt construction* (only final arithmetic needs both — could `Promise.all` the two AI calls and combine in memory). | `lib/scoring/hybrid-scorer.ts` — `extractLeadInfo` (~335) then `analyzeEngagementAndAlignment` (~408) | Higher `/end` latency. | Parallelize AI calls; keep rules merge after both resolve. |
| M-4 | **Dead code modules** — never imported by app routes. | `lib/scoring/early-exit-detector.ts`, `lib/ai/objection-tracker.ts` | Confusion and future accidental wiring without tests. | Remove or integrate behind feature flag with tests. |
| M-5 | **No retry with backoff** in `createChatCompletion`; rate limit throws immediately. | `lib/ai/client.ts` (~85–88) | Transient failures become user-visible 500s; encourages aggressive client retries (cost multiplier). | Bounded retry for 429/5xx with jitter. |

### Low

| ID | Description | Location | Impact | Remediation |
|----|-------------|----------|--------|-------------|
| L-1 | **Unused import** `createChatCompletion` in lead message route (only `generateCloserResponse` used). | `app/api/v1/public/lead-chat/[widgetApiKey]/message/route.ts` (~5) | Lint noise. | Remove import. |
| L-2 | **`estimateTokens` unused** in production paths (exported but no references in app). | `lib/ai/client.ts` (~106) | — | Use for dev warnings or remove. |
| L-3 | **`pricing` in `usage.ts` only keys one model id** — mismatches if `ANTHROPIC_MODEL` changes. | `lib/ai/usage.ts` (~24–28) | Wrong cost display if model env changes. | Map all used model IDs or read from config. |

---

## Task Consolidation

- **JSON robustness:** Replace raw `JSON.parse` in closer, early-exit, objection-tracker with `parseAiJson` (single utility, single test matrix).
- **Observability:** Implement `logAIUsage` + fix lead message token/latency in one pass through the closer pipeline.
- **Config:** Unify model selection (`PROMPT_CONFIGS` or env) with `createChatCompletion` options.

---

## Recommendations (prioritized)

**Phase 1 — Critical / revenue protection**

1. Reduce lead `/message` to ≤2 round-trips; aggregate and persist real `tokensUsed` / `latencyMs`.
2. Add optional `AbortSignal` / timeout to `client.messages.create`.

**Phase 2 — Cost and reliability**

3. Enable Anthropic **prompt caching** on static system content (extraction system prompt, simulation base persona).
4. Parallelize hybrid scorer’s two AI calls; fold name/email extraction into hybrid output to drop third call on `/end`.
5. Bounded retries for rate limits.

**Phase 3 — Model mix and cleanup**

6. Route structured classifiers (intent, phase, early-exit) to **Haiku** via `model` parameter; keep Sonnet for owner-voice reply and extraction if quality requires.
7. Delete or wire up `early-exit-detector` and `objection-tracker`.

---

## Detailed Findings — Task.md Checklist

### Part 1: Inventory — All AI usage

**SDK entry:** `lib/ai/client.ts` — `import Anthropic from "@anthropic-ai/sdk"` (~1), `client.messages.create` (~49).

| File | Function / context | Purpose | Model | Max tokens | Blocking? |
|------|-------------------|---------|-------|------------|-----------|
| `lib/ai/client.ts` | `createChatCompletion` | Shared wrapper | `AI_CONFIG.model` / `ANTHROPIC_MODEL` default `claude-sonnet-4-20250514` | caller | — |
| `lib/scoring/hybrid-scorer.ts` | `extractLeadInfo` | JSON: budget/timeline/project | Sonnet (default) | 200 | Yes (part of `/end`) |
| `lib/scoring/hybrid-scorer.ts` | `analyzeEngagementAndAlignment` | JSON: engagement + alignment | Sonnet | 600 | Yes |
| `app/api/v1/public/lead-chat/.../end/route.ts` | `basicResponse` (with profile) | Name/email JSON | Sonnet | 100 | Yes |
| `app/api/v1/public/lead-chat/.../end/route.ts` | `aiResponse` (no profile fallback) | Full analysis JSON | Sonnet | 400 | Yes |
| `lib/ai/closer-conversation.ts` | `analyzeConversationState` | CLOSER phase JSON | Sonnet | 300 | **Yes (lead chat)** |
| `lib/ai/closer-conversation.ts` | `generateCloserResponse` body | Owner-voice reply | Sonnet | 500 | **Yes** |
| `lib/ai/closer-conversation.ts` | `detectPhaseCompletion` | Phase complete JSON | Sonnet | 100 | **Yes** |
| `app/api/v1/public/lead-chat/.../message/route.ts` | via `generateCloserResponse` | Same 3 calls | Sonnet | composite | **Yes** |
| `app/api/v1/simulations/start/route.ts` | universal + legacy branches | Opening client line | Sonnet | 300 | Yes |
| `app/api/v1/simulations/[id]/message/route.ts` | per message | Client reply | Sonnet | 300 | Yes |
| `lib/extraction/extraction-engine.ts` | `extractPatternsFromSimulation` / `extractRawFromMessages` | Large profile JSON | Sonnet | **6000** | Async / admin |
| `app/api/v1/conversations/[id]/reanalyze/route.ts` | handler | Re-run summary JSON | Sonnet | 400 | Yes |
| `lib/scoring/early-exit-detector.ts` | `checkForEarlyExit` + `generatePoliteExit` | **Unused in repo** | Sonnet | 300 + 200 | — |
| `lib/ai/objection-tracker.ts` | `trackObjections` | **Unused in repo** | Sonnet | 400 | — |

**Multi-call chains**

- **Lead message:** 3× `createChatCompletion` (closer pipeline).
- **Lead end (with profile):** `scoreConversation` (2×) + `basicResponse` (1×) = **3×** minimum.
- **Simulation:** 1× per message; +1× on start; +1× async extraction on complete (via `triggerAsyncExtraction`).

### Part 2: Cost analysis (illustrative math)

Assume **Sonnet 4** $3/M input, $15/M output.

**A. One lead chat user message (closer pipeline)** — rough token guesses:

| Step | Est. input | Est. output | Est. $ |
|------|------------|-------------|--------|
| State analysis | 1.2k–4k | ≤200 | ~0.004–0.02 |
| Main reply (large system: profile + CLOSER) | 4k–12k | ≤500 | ~0.02–0.05 |
| Phase detection | 0.5k–2k | ≤80 | ~0.002–0.01 |
| **Total per message** | — | — | **~$0.03–0.09** |

10-message lead thread → **~$0.30–0.90** AI only (excluding `/end`).

**B. Conversation end (with business profile)**

| Step | Max out | Role |
|------|---------|------|
| `extractLeadInfo` | 200 | small JSON |
| `analyzeEngagementAndAlignment` | 600 | medium JSON |
| `basicResponse` | 100 | tiny JSON |
| **Plus** large transcript in each prompt → input-heavy.

Order-of-magnitude **$0.02–0.08** per end depending on transcript length.

**C. Extraction (per simulation)**

- Input: long `EXTRACTION_SYSTEM_PROMPT` + transcript (often **5k–25k+** tokens).
- Output cap 6000 → worst-case output cost **6000 × 15/1M ≈ $0.09** + input **25k × 3/1M ≈ $0.075** → **~$0.15+** per heavy extraction.

**Monthly projection (formula):**

\[
\text{USD/month} \approx C_{\text{msg}} \cdot N_{\text{lead msgs}} + C_{\text{end}} \cdot N_{\text{ends}} + C_{\text{sim}} \cdot N_{\text{sim msgs}} + C_{\text{ext}} \cdot N_{\text{extractions}}
\]

Plug in empirically measured averages once `logAIUsage` or DB aggregates exist.

### Part 3: Performance bottlenecks

- **Longest operations:** Extraction (large I/O), then main closer reply (large system prompt).
- **Sequential vs parallel:** Hybrid scorer and closer pipeline are sequential; `re-extract` already parallelizes batches of 3.
- **Timeouts:** None in `createChatCompletion`.
- **Caching:** No Anthropic prompt cache markers in codebase.

### Part 4: Waste detection

- Redundant **name/email** call on `/end` when hybrid scorer already processes transcript.
- **PROMPT_CONFIGS** duplicates knowledge of budgets without enforcement.
- **Unused modules** (early exit, objections) — no runtime waste today, maintenance cost only.
- **Lead message route** discards accurate usage from inner calls.

### Part 5: Patterns from `task.md`

| Pattern | Present? | Notes |
|---------|----------|--------|
| `maxTokens > 4000` | **Yes** | `6000` in extraction only. |
| Sequential completions parallelizable? | **Yes** | Hybrid scorer; closer sub-calls (with quality tradeoffs). |
| AI in loops | **Indirect** | Re-extract loops sims (bounded concurrency 3). |
| Repeated system prompt | **Yes** | Extraction + simulations + closer — cache candidate. |
| `tokensUsed: 0` | **Yes** | Lead message path. |
| Retry without limits | **No** | No retry; immediate throw on rate limit. |

---

## Appendix: Runtime evidence (`errors.md`)

`errors.md` shows `JSON.parse` failures on markdown-wrapped ` ```json ` output on lead `/end` and `reanalyze` in an older stack layout. Current `hybrid-scorer.ts` and `reanalyze/route.ts` use **`parseAiJson`**, which mitigates leading-fence cases. **`closer-conversation.ts`**, **`early-exit-detector.ts`**, and **`objection-tracker.ts`** still use raw **`JSON.parse`** with manual fence strip in some places — inconsistent and fragile.

---

## Phased fix plan (summary)

| Phase | Focus | Effort |
|-------|--------|--------|
| 1 | Lead path latency + real usage fields + timeouts | Medium |
| 2 | Telemetry (`logAIUsage`), prompt caching, parallel hybrid | Medium |
| 3 | Model routing (Haiku/Sonnet), dead code removal, re-extract throttling | Medium–High |

---

## Positive findings

- **Single Anthropic client** and **`parseAiJson`** helper reduce duplication for newer code paths.
- **Simulations** persist `tokensUsed` and `latencyMs` on messages (`app/api/v1/simulations/[id]/message/route.ts`).
- **Extraction** includes **truncated JSON repair** (`repairTruncatedJson` in `lib/extraction/extraction-engine.ts`) — thoughtful hardening.
- **Re-extract** uses **bounded concurrency** and per-simulation timeout — good operational pattern.

---

*End of report.*
