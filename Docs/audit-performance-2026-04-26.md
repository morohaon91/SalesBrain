# Performance Audit Report

## Executive Summary

| Field | Value |
|-------|--------|
| **Audit topic/scope** | Performance: resource lifecycle, database/query patterns, caching, frontend bundling, latency-sensitive API paths (Next.js 14 App Router + Prisma + PostgreSQL + Anthropic) |
| **Date of audit** | 2026-04-26 |
| **Overall score (1–10)** | **6** |
| **Performance maturity level** | **Early Production** |
| **Severity distribution** | Critical: 2, High: 4, Medium: 3, Low: 4 |
| **Total number of findings** | **13** |

**Category scores (1–10):** Database & query patterns **5** (several unbounded or scale-unfriendly reads); external AI calls **8** (timeouts and retries are implemented in `lib/ai/client.ts`); caching & redundancy **4** (no application-level cache layer in use); frontend delivery **7** (root layout loads global providers; no route-level `dynamic`/`next` lazy splits observed); observability **5** (Prisma logs errors only in production).

The codebase shows solid patterns in places—paginated list endpoints for conversations, leads, and simulations; selective `include`/`select` on several routes; and explicit AI request timeouts with bounded retries. The main gaps are **unbounded reads** of message history and completed simulations on hot or admin paths, **admin-wide unbounded tenant listing**, and **analytics average score** loading every scored row into memory. Connection handling via a shared `PrismaClient` is acceptable for a long-lived Node process but is not tuned for pool size, and production does not pin the client on `globalThis` (relevant for serverless-style scaling).

**Rules referenced:** `.cursor/rules/09-performance.mdc` (resource release, query optimization); `.cursor/rules/10-audit.mdc` (report structure, severity, remediation).

---

## Audit Scope and Methodology

- **Scope:** Application code under `app/` (API routes and layouts), `lib/` (Prisma singleton, AI client, auth middleware), `prisma/schema.prisma` (indexes), and `package.json` / `next.config.js` for bundling and dependencies. No runtime profiling or load tests were executed.
- **Method:** Static codebase review mapped to the performance skill checklist (resource lifecycle, DB patterns, caching, frontend assets, latency-sensitive paths). Every finding below references a concrete file and behavior.
- **Out of scope:** Infrastructure provisioning (CPU, Postgres instance class), CDN configuration, and third-party network SLOs.

---

## Findings

### Critical

| # | Description | Location (file path, line/function) | Impact | Recommendation |
|---|-------------|--------------------------------------|--------|----------------|
| C1 | **Unbounded load of all messages** for a single conversation: `findFirst` includes `messages` with `orderBy` but **no `take`/cursor**, so a long-lived or high-volume thread loads every row into the API process and returns them in one JSON payload. | `app/api/v1/conversations/[id]/route.ts` — `prisma.conversation.findFirst` (approx. lines 32–41), `include.messages` | **Combined:** Very large responses risk high latency, memory pressure on the server, and poor UX in the dashboard; worst case approaches OOM or timeouts. | Paginate messages (cursor or `skip`/`take`), cap with a documented max, or load recent window plus “load more.” Use `_count` or a separate aggregate for `messageCount` if only a count is needed for list views. |
| C2 | **Unbounded load of all completed simulations with full message history** for re-extraction: one `findMany` returns every completed simulation and **all** related messages for the tenant. | `app/api/v1/profile/re-extract/route.ts` — `prisma.simulation.findMany` (approx. lines 55–58), `include: { messages: { orderBy: { createdAt: 'asc' } } }` | **Technical / Business:** Memory and CPU spike; request may exceed serverless or reverse-proxy timeouts; blocks until all extractions finish (later code caps concurrency per simulation but not dataset size). | Batch by simulation `id` with `take`, or process in a background job/queue; never load all completed simulations + messages in one query for arbitrary tenants. |

### High

| # | Description | Location | Impact | Recommendation |
|---|-------------|----------|--------|----------------|
| H1 | **Unbounded platform-admin tenant list:** `findMany` on `tenant` with `include.users` and `_count`, **no pagination or limit**. | `app/api/v1/platform-admin/tenants/route.ts` — `prisma.tenant.findMany` (approx. lines 10–24) | **Technical:** Admin UI/API slows linearly with tenant count; large JSON payloads. | Add `skip`/`take` (or cursor), cap `pageSize`, return totals via `count`. |
| H2 | **Analytics average score loads all scored conversations into memory:** `findMany` where `leadScore > 0` with only `leadScore` selected—still **one row per conversation**, no aggregation in the database. | `app/api/v1/analytics/overview/route.ts` (approx. lines 75–86) | **Technical:** CPU and memory scale with conversation count per tenant; redundant with separate `count` queries above. | Use `aggregate({ _avg: { leadScore: true }, ... })` or SQL `AVG` with `WHERE leadScore > 0` in a single query. |
| H3 | **Public lead-chat message path loads full conversation history** on every POST before generating a reply. | `app/api/v1/public/lead-chat/[widgetApiKey]/message/route.ts` — `prisma.conversation.findFirst` with `include.messages` (approx. lines 59–67) | **Combined:** Latency grows with thread length; repeated full history reads under chatty leads. | Window recent messages for model context; optionally denormalize last-N message IDs; keep DB read bounded. |
| H4 | **Simulation message POST loads full ascending message list plus `tenant.profiles` every turn.** | `app/api/v1/simulations/[id]/message/route.ts` — `prisma.simulation.findUnique` with `include.messages` and `tenant.include.profiles` (approx. lines 96–108) | **Technical:** Same pattern as H3—latency and payload size grow with session length; profiles re-fetched every message. | Cache static profile context per request or use a slimmer select; truncate or summarize old messages for the model. |

### Medium

| # | Description | Location | Impact | Recommendation |
|---|-------------|----------|--------|----------------|
| M1 | **List endpoints accept unbounded `pageSize`:** `parseInt(searchParams.get('pageSize') || '20')` with no upper clamp (unlike `app/api/v1/simulations/route.ts`, which uses `Math.min(100, ...)`). | `app/api/v1/conversations/route.ts` (approx. lines 48–49); `app/api/v1/leads/route.ts` (approx. lines 47–48); `app/api/v1/simulations/list/route.ts` (approx. lines 45–46) | **Technical:** A client can request extremely large pages, increasing DB load and response size. | Mirror the simulations route: `Math.min(MAX_PAGE_SIZE, parseInt(...))` with a sane default. |
| M2 | **Prisma client singleton only in non-production:** `global.prisma` is assigned when `NODE_ENV !== "production"`. In production each isolated runtime gets `baseClient` from module scope (often one per process, but not guaranteed across all deployment models). | `lib/prisma.ts` (approx. lines 16–19) | **Technical:** Under high concurrency or certain serverless patterns, connection pool usage can be harder to reason about; no explicit `datasources` pool tuning in code. | Follow Prisma guidance for the host (e.g. pin `globalThis.prisma` in production for Next.js serverless, or use Prisma Accelerate / PgBouncer as appropriate); document `DATABASE_URL` pooler settings. |
| M3 | **Analytics overview issues multiple round-trips** (several `count` calls plus `findMany`) where aggregated SQL could reduce latency. | `app/api/v1/analytics/overview/route.ts` (approx. lines 53–78) | **Technical:** Extra DB round-trips per dashboard load. | Combine into fewer queries or one raw/typed SQL with conditional aggregates (where safe and tenant-scoped). |

### Low

| # | Description | Location | Impact | Recommendation |
|---|-------------|----------|--------|----------------|
| L1 | **Production Prisma logging** is limited to `["error"]`—no query timing or slow-query visibility in app logs. | `lib/prisma.ts` (approx. lines 9–14) | **Technical:** Harder to diagnose regressions and slow paths in production. | Add sampled query logging, APM integration, or Postgres `log_min_duration_statement` at infra level. |
| L2 | **`ioredis` is declared** in `package.json` but **no imports** were found in application `*.ts`/`*.tsx` sources—no Redis-backed caching in the app code path reviewed. | `package.json` dependencies; repo-wide app/lib grep | **Technical:** Missed opportunity for caching; slightly heavier installs. | Remove if unused, or implement caching with clear TTL/invalidation for read-heavy endpoints. |
| L3 | **`recharts` is declared** in `package.json` but **no source imports** were found—charting appears hand-built (e.g. analytics page uses custom bars). | `package.json`; `app/(dashboard)/analytics/page.tsx` | **Technical:** Unused dependency (install and audit surface). | Remove from dependencies if confirmed unused, or adopt consistently with lazy import. |
| L4 | **No `next/dynamic` usage** was found under `app/` for lazy-loading heavy client islands—everything under the dashboard tree may ship in the same client graph unless Next splits by route automatically. | Grep: `dynamic\(|next/dynamic` in `app/` — no matches | **Technical:** Incremental bundle-size wins may be left on the table for rarely visited routes. | Introduce dynamic imports for large, route-specific client modules when bundle analysis shows benefit. |

---

## Task Consolidation Opportunities

| Group | Findings | Consolidated remediation |
|--------|----------|---------------------------|
| **Bounded message reads** | C1, H3, H4 (and related patterns in `reanalyze` loading full transcript) | Introduce a shared helper: “load conversation/simulation context with max N messages / token budget,” reused by dashboard GET, public widget POST, simulation POST, and reanalyze. |
| **Bulk tenant / analytics data** | C2, H1, H2, M3 | Prefer DB-side aggregation and batch jobs: pagination for admin lists; `aggregate`/`groupBy`/SQL for analytics; background job for re-extract over large datasets. |
| **API hardening** | M1 | Single utility `parsePagination(searchParams, { defaultPageSize, maxPageSize })` used by all list routes. |
| **Dependencies & observability** | L1–L4 | One chore PR: remove unused deps, add performance logging strategy doc + minimal instrumentation. |

---

## Recommendations

1. **Treat message history as a bounded resource** everywhere it touches the DB and the model context window; unbounded `include.messages` is the dominant performance risk in this codebase.
2. **Move long-running re-extraction** off the synchronous HTTP request path when tenants can have many completed simulations (queue + worker, or chunked HTTP with continuation tokens).
3. **Add pagination** to platform-admin tenant listing before tenant count grows.
4. **Align list routes** on a maximum `pageSize` (already done for `GET /api/v1/simulations`).
5. **Validate Prisma + deployment pairing** (connection limits, pooler URL, optional `globalThis` singleton) against the actual host (VPS vs serverless).

---

## Phased Fix Plan

| Phase | Focus | Finding IDs | Notes |
|-------|--------|-------------|-------|
| Phase 1 | Critical fixes | C1, C2 | Prevents OOM/timeouts on worst-case tenants; highest user-visible and stability impact. |
| Phase 2 | High-impact improvements | H1, H2, H3, H4 | Admin scalability, analytics efficiency, chat/simulation latency under long threads. |
| Phase 3 | Optimization & consistency | M1, M2, M3, L1–L4 | Hardening, pool clarity, dependency hygiene, optional lazy loading and logging. |

---

## Positive Findings

- **Paginated tenant-scoped lists** with `skip`/`take` and metadata: `app/api/v1/conversations/route.ts`, `app/api/v1/leads/route.ts`, `app/api/v1/simulations/route.ts`, `app/api/v1/simulations/list/route.ts`.
- **AI resilience:** `lib/ai/client.ts` implements `Promise.race` with configurable `timeoutMs` (default 30s), retry with backoff for 429/5xx, and usage logging hooks.
- **Prisma tenant context** is cleared in `catch` paths on several routes (e.g. `app/api/v1/conversations/route.ts` after errors), reducing risk of leaking tenant id between requests on the same isolate when used correctly.
- **Schema indexes** on hot dimensions such as `tenantId`, `conversationId`, `createdAt` on key models (`prisma/schema.prisma` `@@index` directives).

---

## Score Justification

Base **8** (solid pagination on core lists, AI timeouts, selective includes) minus **2** for multiple unbounded or effectively unbounded reads (conversation messages, re-extract dataset, admin tenant list, analytics average) yields **6** — appropriate for **Early Production**: functional at moderate scale but missing guardrails expected before high traffic or large tenants.
