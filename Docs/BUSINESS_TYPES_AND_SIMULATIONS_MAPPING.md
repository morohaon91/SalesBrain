# Business Types (Industries) & Simulation Templates — Codebase Audit

**Audit scope:** Map supported “business types” and simulation templates per `task.md`.  
**Date:** 2026-04-13  
**Codebase:** SalesBrain (Next.js + Prisma/PostgreSQL)

---

## Terminology (important)

The product and schema use **industry** (`Tenant.industry`, `BusinessProfile.industry`), not a Prisma `BusinessType` enum. The canonical list of selectable values is the string keys of `INDUSTRY_SCENARIOS` in `lib/templates/industry-scenarios.ts` (exported as `INDUSTRY_LIST`).

---

## Section 1: Business Types (Industries) Summary

### Supported industries (10 total)

| # | Industry (exact string stored in DB) |
|---|--------------------------------------|
| 1 | Legal Services |
| 2 | Construction & Contracting |
| 3 | Real Estate Services |
| 4 | Financial Advisory |
| 5 | Business Consulting |
| 6 | Marketing & Creative Agencies |
| 7 | Home Services |
| 8 | Health & Wellness Coaching |
| 9 | IT & Technology Services |
| 10 | Interior Design |

### Where defined

| Artifact | Location | Lines (approx.) |
|----------|----------|-----------------|
| Canonical list + scenarios map | `lib/templates/industry-scenarios.ts` | `INDUSTRY_SCENARIOS` ~757–768, `INDUSTRY_LIST` ~770, `getScenariosForIndustry` ~772–774 |
| Dropdown helper (value/label objects) | `lib/templates/index.ts` | `INDUSTRY_LIST` ~17–20 |
| Database fields | `prisma/schema.prisma` | `Tenant.industry` ~21–22, `BusinessProfile.industry` ~129 |

### How the user selects industry

| Flow | File | Mechanism |
|------|------|-----------|
| Registration | `app/(auth)/register/page.tsx` | `<Select options={INDUSTRY_LIST} />` where `INDUSTRY_LIST` is imported from `@/lib/templates` (`{ value, label }` per industry string) |
| Onboarding questionnaire | `components/onboarding/QuestionnaireForm.tsx` + `components/onboarding/IndustrySelect.tsx` | `IndustrySelect` imports `INDUSTRY_LIST` from `@/lib/templates/industry-scenarios` (raw string array) and maps to select options |
| Profile edit | `app/(dashboard)/profile/page.tsx` | User can update `industry` state and save via profile API |

### What is stored per industry

- **`Tenant.industry`**: Optional string; set at registration (`app/api/v1/auth/register/route.ts`).
- **`BusinessProfile.industry`**: Optional string; aligned with questionnaire/profile updates (`lib/onboarding/profile-initializer.ts`, `app/api/v1/profile/route.ts`).
- No separate table of industries; values are **not** FK-constrained to an enum in Prisma—consistency depends on UI + API validation.

---

## Section 2: Simulation Templates Summary

| Metric | Value |
|--------|--------|
| Total industries with templates | 10 |
| Templates per industry | **4** each |
| **Total scenario templates** | **40** |
| Average templates per industry | 4 |
| Primary storage | **Hardcoded TypeScript** in `lib/templates/industry-scenarios.ts` |
| Runtime mapping | `getScenariosForIndustry(industry)` → `INDUSTRY_SCENARIOS[industry] ?? []` |

### How industry → simulations is resolved

1. **Listing scenarios for the tenant:** `app/api/v1/simulations/scenarios/route.ts` loads `BusinessProfile` by `tenantId`, then calls `getScenariosForIndustry(profile.industry ?? '')`.
2. **Starting a run (current path):** `app/api/v1/simulations/start/route.ts` accepts `scenarioId`; resolves definition via `getScenarioById(scenarioId)`, builds a client persona with `generatePersona(scenario)`, and stores `simulation.scenarioType` as that **scenario id** string (not the old enum name).
3. **Legacy path:** Same route still supports `scenarioType` (e.g. `PRICE_SENSITIVE`) and calls `generateSimulationPrompt` in `lib/ai/prompts/simulation.ts`, which uses **`getIndustryTemplate(industry)`** against `INDUSTRY_TEMPLATES` in `lib/templates/industry-templates.ts`.

---

## Section 3: Detailed Mapping (by industry)

For each industry: **4** simulations. The **owner (business user)** plays the professional; the **AI** plays the **incoming lead / client** described by the scenario (see teasers below).

### Legal Services

- **Defined in:** `lib/templates/industry-scenarios.ts` (`legalServicesScenarios`)
- **Selection:** Same as all industries—`profile.industry === "Legal Services"`
- **Simulations:** 4

| # | Scenario ID | Name | What the owner responds to (summary) | Content preview (teaser) |
|---|-------------|------|--------------------------------------|----------------------------|
| 1 | `legal_urgent_free_consult` | Urgent Case - Wants Free Consultation | Urgent matter but expects free initial consult | Incoming lead: Urgent legal case, wants free consultation first |
| 2 | `legal_lowest_rate_shopper` | Shopping for Lowest Rate | Rate shopping vs other lawyers | Incoming lead: Rate shopping, comparing multiple lawyers |
| 3 | `legal_complex_budget_sensitive` | Complex Case - Budget Sensitive | Complex work, limited budget, needs reassurance | Incoming lead: Complex legal matter, limited budget, needs reassurance |
| 4 | `legal_unrealistic_timeline` | Unrealistic Timeline Expectations | Wants complex work on impossible timeline | Incoming lead: Complex case, expects it done in days |

### Construction & Contracting

- **Defined in:** `constructionScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `construction_vague_scope_tight_budget` | Vague Scope - Tight Budget | Unclear scope, tight budget | Incoming lead: Kitchen remodel, vague ideas, budget-conscious |
| 2 | `construction_timeline_pressure` | Extreme Timeline Pressure | Rush job expectations | Incoming lead: Bathroom remodel, needs it done in 2 weeks |
| 3 | `construction_scope_creep` | Homeowner Scope Creep Risk | Expanding “while you’re here” scope | Incoming lead: Simple deck repair, but mentions many "bonus" ideas |
| 4 | `construction_premium_skeptic` | Premium Quality Skeptic | Questions premium pricing vs cheaper quotes | Incoming lead: Full kitchen remodel, questions premium pricing |

### Real Estate Services

- **Defined in:** `realEstateScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `realestate_first_buyer_overwhelmed` | First-Time Buyer - Overwhelmed | Nervous first-time buyer | Incoming lead: First-time buyer, nervous, needs guidance |
| 2 | `realestate_investor_haggler` | Investor - Price Haggler | Commission / volume negotiation | Incoming lead: Investor, multiple properties, wants commission discount |
| 3 | `realestate_unrealistic_expectations` | Unrealistic Price Expectations | Emotional seller pricing | Incoming lead: Selling family home, wants above-market price |
| 4 | `realestate_quick_sale_pressure` | Quick Sale Pressure | Must sell fast (e.g. relocation) | Incoming lead: Urgent sale needed, job relocation in 6 weeks |

### Financial Advisory

- **Defined in:** `financialAdvisoryScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `financial_small_portfolio_high_expectations` | Small Portfolio - High Expectations | Small assets, high service expectations | Incoming lead: Small portfolio, expects premium service |
| 2 | `financial_fee_skeptic` | Fee-Focused Skeptic | Fee sensitivity, DIY comparison | Incoming lead: Experienced investor, fee-sensitive, DIY mindset |
| 3 | `financial_market_timer` | Market Timer | Timing the market / trading mindset | Incoming lead: Wants help timing market, frequent trading |
| 4 | `financial_referral_ready` | Referral - Ready to Move | Warm referral, ready to engage | Incoming lead: Referral from top client, portfolio $1.5M |

### Business Consulting

- **Defined in:** `businessConsultingScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `consulting_startup_limited_budget` | Startup - Limited Budget | Early-stage, limited cash | Incoming lead: Pre-seed startup, wants strategic help, limited cash |
| 2 | `consulting_scope_creep_risk` | Scope Creep Risk | Growing scope on “simple” ask | Incoming lead: "Simple" market analysis, but scope keeps growing |
| 3 | `consulting_wants_hands_on` | Wants Hands-On Implementation | Wants implementer, not advice only | Incoming lead: Wants consultant to implement, not just recommend |
| 4 | `consulting_well_funded_high_expectations` | Well-Funded - High Expectations | Large budget, demanding engagement | Incoming lead: Series B company, big budget, tight timeline |

### Marketing & Creative Agencies

- **Defined in:** `marketingCreativeScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `marketing_unclear_brief_low_budget` | Unclear Brief - Low Budget | No brief, tiny budget | Incoming lead: "We need marketing" — no brief, tiny budget |
| 2 | `marketing_wants_everything_yesterday` | Wants Everything Yesterday | Unrealistic timeline for full scope | Incoming lead: Full rebrand + website + ads — in 2 weeks |
| 3 | `marketing_micromanager` | Micro-Manager Client | Excessive review/control | Incoming lead: Needs campaign, wants to review everything before launch |
| 4 | `marketing_brand_overhaul_big_budget` | Brand Overhaul - Big Budget | Large rebranding evaluation | Incoming lead: Complete rebrand, $100k+ budget, evaluating agencies |

### Home Services

- **Defined in:** `homeServicesScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `homeservices_emergency_price_shopper` | Emergency Fix - Price Shopper | Emergency + price shopping | Incoming lead: Burst pipe, calling 3 plumbers for cheapest quote |
| 2 | `homeservices_preventive_skeptic` | Preventive Maintenance Skeptic | Doubts need for maintenance | Incoming lead: HVAC tune-up offer, skeptical about necessity |
| 3 | `homeservices_diy_gone_wrong` | DIY Gone Wrong | Botched self-repair | Incoming lead: Tried to fix it themselves, now it's worse |
| 4 | `homeservices_premium_upgrade_budget_conscious` | Premium Upgrade - Budget Conscious | Smart upgrade, cost nervous | Incoming lead: Wants smart home upgrade, nervous about cost |

### Health & Wellness Coaching

- **Defined in:** `healthWellnessScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `health_quick_fix_mindset` | Quick Fix Mindset | Unrealistic fast results | Incoming lead: Wants to lose 30 lbs in 6 weeks |
| 2 | `health_price_vs_value` | Price vs Value Conflict | “Too expensive” objection | Incoming lead: Interested but says coaching is "expensive" |
| 3 | `health_commitment_issues` | Commitment Issues | History of quitting programs | Incoming lead: Excited about coaching but has quit programs before |
| 4 | `health_ready_to_transform` | Ready to Transform | Highly motivated, clear budget | Incoming lead: Doctor's orders, fully committed, budget available |

### IT & Technology Services

- **Defined in:** `itTechScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `it_break_fix_only` | Break-Fix Only Client | No managed service interest | Incoming lead: "Just fix it when it breaks, I don't need a contract" |
| 2 | `it_cheap_msp_burnout` | Cheap MSP Burnout | Bad prior provider, price-focused | Incoming lead: Left offshore IT support after disaster, now comparing prices |
| 3 | `it_growth_scaling` | Growth Company - Scaling | Fast growth, chaotic IT | Incoming lead: Grew from 5 to 50 employees, IT is chaos |
| 4 | `it_security_reactive` | Security Incident Reactive | Post-incident security overhaul | Incoming lead: Just got hit with ransomware, needs security overhaul |

### Interior Design

- **Defined in:** `interiorDesignScenarios`
- **Simulations:** 4

| # | Scenario ID | Name | Owner responds to | Teaser |
|---|-------------|------|-------------------|--------|
| 1 | `design_pinterest_ikea_budget` | Pinterest Inspired - IKEA Budget | High taste, low budget | Incoming lead: Wants Restoration Hardware look on IKEA budget |
| 2 | `design_style_indecisive` | Style Indecisive | Conflicting style directions | Incoming lead: "I love it all — modern AND rustic AND minimalist" |
| 3 | `design_timeline_unrealistic` | Timeline Unrealistic | Design work on impossible timeline | Incoming lead: Full living room design, done in 3 weeks (party coming) |
| 4 | `design_full_remodel_premium` | Full Remodel - Premium | Large budget, strong fit | Incoming lead: Full home redesign, referred by past client, $200k budget |

---

## Section 4: Code Locations Reference

| File | Purpose | Key symbols |
|------|---------|-------------|
| `lib/templates/industry-scenarios.ts` | All 40 scenario definitions; industry → scenarios map; `getScenarioById`, `getScenariosForIndustry`, `getAllScenarios` | `INDUSTRY_SCENARIOS`, `INDUSTRY_LIST` |
| `lib/templates/industry-templates.ts` | **Legacy** rich templates (`INDUSTRY_TEMPLATES`) keyed by snake_case (`legal_services`, `business_consulting`, …); deprecated note points to `industry-scenarios.ts` | `INDUSTRY_TEMPLATES`, `getIndustryTemplate` (via `lib/templates/index.ts`) |
| `lib/templates/index.ts` | Re-exports; `getIndustryTemplate(industry)` looks up **`INDUSTRY_TEMPLATES[industry]`** (expects legacy keys, not display names) | `getIndustryTemplate`, `INDUSTRY_LIST` |
| `lib/ai/prompts/simulation.ts` | Legacy prompt path: `generateSimulationPrompt(scenarioType, businessProfile)` uses `getIndustryTemplate(industry)`; falls back to generic `getScenarioConfig` if no template | `getScenarioConfig`, `generateSimulationPrompt` |
| `app/api/v1/simulations/start/route.ts` | Starts simulation: **new** `scenarioId` path vs **legacy** `scenarioType` path | `getScenarioById`, `generatePersona`, `generateSimulationPrompt` |
| `app/api/v1/simulations/scenarios/route.ts` | Lists scenarios for tenant from `profile.industry` | `getScenariosForIndustry` |
| `app/api/v1/simulations/[id]/message/route.ts` | Continues thread; resolves scenario for context | `getScenarioById` |
| `prisma/schema.prisma` | `Simulation.scenarioType` is a **string** (stores scenario id or legacy enum name) | `Simulation` model ~203–240 |

**Illustrative snippet (mapping):**

```772:774:lib/templates/industry-scenarios.ts
export function getScenariosForIndustry(industry: string): IndustryScenario[] {
  return INDUSTRY_SCENARIOS[industry] ?? [];
}
```

---

## Section 5: Gaps & Issues

| Check | Status | Notes |
|-------|--------|-------|
| Some industries missing simulation templates | **No** | All 10 onboarding industries have 4 scenarios each in `INDUSTRY_SCENARIOS`. |
| Simulations hardcoded (should be configurable) | **Yes** | All definitions live in TS modules; changing copy requires deploy, not CMS/DB. |
| Industry selection not wired to simulations | **No** | API uses `BusinessProfile.industry` with `getScenariosForIndustry`. |
| Template content unclear or generic | **Low risk** | Scenarios include teaser, description, focus areas, and persona templates. |
| Legacy template library mismatch | **Yes (technical debt)** | `getIndustryTemplate` indexes `INDUSTRY_TEMPLATES` by keys like `legal_services`, but stored profile values are display strings like `"Legal Services"`. **Legacy** `generateSimulationPrompt` therefore often **misses** the rich template and falls back to generic consulting-style `getScenarioConfig` unless industry happens to match a legacy key. **New** `scenarioId` path does not depend on that lookup. |
| Orphan legacy industry | **Yes** | `INDUSTRY_TEMPLATES` includes `mortgage_advisory`, which is **not** in `INDUSTRY_SCENARIOS` / onboarding list. |
| Missing dedicated templates for 3 industries in `INDUSTRY_TEMPLATES` | **Yes** | No `INDUSTRY_TEMPLATES` entries for **Home Services**, **Health & Wellness Coaching**, or **IT & Technology Services** (only relevant to **legacy** prompt path). |

---

## Section 6: ASCII Overview

```
Supported industries (10) — lib/templates/industry-scenarios.ts (INDUSTRY_SCENARIOS)
│
├─ Legal Services — 4 simulations (legal_*)
├─ Construction & Contracting — 4 (construction_*)
├─ Real Estate Services — 4 (realestate_*)
├─ Financial Advisory — 4 (financial_*)
├─ Business Consulting — 4 (consulting_*)
├─ Marketing & Creative Agencies — 4 (marketing_*)
├─ Home Services — 4 (homeservices_*)
├─ Health & Wellness Coaching — 4 (health_*)
├─ IT & Technology Services — 4 (it_*)
└─ Interior Design — 4 (design_*)

Industry → simulations: getScenariosForIndustry(profile.industry)
Start run (preferred): POST with scenarioId → getScenarioById → generatePersona → DB Simulation.scenarioType = scenarioId
Legacy: POST with scenarioType (PRICE_SENSITIVE, …) → generateSimulationPrompt → getIndustryTemplate (legacy keys)
```

---

## Success Criteria (from `task.md`)

| # | Criterion | Met |
|---|-----------|-----|
| 1 | All supported business types / industries listed | Yes — 10 strings above |
| 2 | Count of simulations per type | Yes — 4 each, 40 total |
| 3 | What the owner is expected to respond to | Yes — AI plays client; owner handles lead per scenario teaser/persona |
| 4 | Where each piece is defined | Yes — see Sections 1–4 |
| 5 | How industry maps to simulations | Yes — `INDUSTRY_SCENARIOS[industry]` via `getScenariosForIndustry` |

---

*Generated from repository analysis; line numbers may shift slightly as the code evolves.*
