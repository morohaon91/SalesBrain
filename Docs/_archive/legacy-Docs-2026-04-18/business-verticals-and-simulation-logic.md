# Business verticals and simulation logic (reference)

**Purpose:** Answer product/engineering questions about industry lists, where they are stored, and how simulations and `scenarioType` behave today.  
**Last verified against codebase:** 2026-04-15.

---

## 1. Your “7 verticals” vs what the app actually uses

You listed:

1. Legal Services  
2. Construction & Contracting  
3. Financial Advisory  
4. Marketing & Creative Agencies  
5. Software Development Services  
6. IT & Technology Services  
7. Interior Design  

### Verdict

**Not exactly correct.** The canonical list in code is **10** verticals, defined as the **object keys** of `INDUSTRY_SCENARIOS` in `lib/templates/industry-scenarios.ts`. Each key must match **character-for-character** (including spacing and ampersands) wherever the app looks up scenarios by industry.

**Canonical list (exact strings):**

| # | Exact string (key) |
|---|---------------------|
| 1 | `Legal Services` |
| 2 | `Construction & Contracting` |
| 3 | `Real Estate Services` |
| 4 | `Financial Advisory` |
| 5 | `Business Consulting` |
| 6 | `Marketing & Creative Agencies` |
| 7 | `Home Services` |
| 8 | `Health & Wellness Coaching` |
| 9 | `IT & Technology Services` |
| 10 | `Interior Design` |

**Compared to your list:**

- **Matches:** Legal Services; Construction & Contracting; Financial Advisory; Marketing & Creative Agencies; IT & Technology Services; Interior Design.  
- **Not in codebase:** **Software Development Services** — there is no scenario bucket with that name. IT scenarios live under **IT & Technology Services** only.  
- **In codebase but not in your list:** Real Estate Services; Business Consulting; Home Services; Health & Wellness Coaching.

The UI dropdown uses these same strings: `components/onboarding/IndustrySelect.tsx` imports `INDUSTRY_LIST` from `industry-scenarios.ts` and uses each entry as both `value` and `label`.

---

## 2. Are these stored as exact strings in `tenant.industry`?

**Short answer: simulations and scenario lists do *not* rely on `tenant.industry` for the canonical vertical.**

### `Tenant.industry` (`prisma/schema.prisma`)

- Type: `String?` — **free text**, no enum in the database.  
- Often set at **registration** (`app/api/v1/auth/register/route.ts`) from optional user input.  
- Used in places like **public lead chat** (`buildLeadAssistantSystemPrompt` falls back to `tenant.industry` when service description is empty).

### `BusinessProfile.industry`

- Type: `String?` — also free text at the DB layer, but **in practice** it is set from the **questionnaire** to the same strings as `INDUSTRY_LIST` (`lib/onboarding/profile-initializer.ts` writes `data.industry` from validated onboarding).  
- **`GET /api/v1/simulations/scenarios`** calls `getScenariosForIndustry(profile.industry ?? '')` — so scenario loading is keyed off **`BusinessProfile.industry`**, not `Tenant.industry`.

### Practical implication

- **`BusinessProfile.industry`** should equal one of the **10 exact keys** above for `getScenariosForIndustry` to return scenarios.  
- **`Tenant.industry`** can differ from the profile (nothing in `profile-initializer` copies industry onto the tenant). Treat **`BusinessProfile.industry`** as the source of truth for simulation verticals.

### Legacy templates (`lib/templates/industry-templates.ts`)

- `getIndustryTemplate()` uses **different** internal slugs (e.g. `legal_services`, `constructors`) for the **older** simulation prompt path. That is separate from the **10 display names** used for scenario lists in `industry-scenarios.ts`.

---

## 3. How simulations work right now

### Where scenarios are defined

- **Primary source:** `lib/templates/industry-scenarios.ts`  
  - Exports `INDUSTRY_SCENARIOS`, `INDUSTRY_LIST`, `getScenariosForIndustry`, `getScenarioById`, `getAllScenarios`, etc.  
  - Each scenario is an `IndustryScenario`: `id`, `industry`, `name`, `teaser`, `personaTemplate` (budget/age/personality/pain/timeline pools), etc.

### How the API exposes them

- **`GET /api/v1/simulations/scenarios`** (`app/api/v1/simulations/scenarios/route.ts`): loads the tenant’s `BusinessProfile`, then returns `getScenariosForIndustry(profile.industry ?? '')` plus suggestion metadata.

### How `scenarioType` is populated on `Simulation`

The `Simulation` model has `scenarioType String` (see `prisma/schema.prisma`). Two conventions coexist:

| Path | When | Value stored in `scenarioType` |
|------|------|----------------------------------|
| **New (scenario id)** | Client sends **`scenarioId`** in `POST /api/v1/simulations/start` | The scenario’s **`id`** string (e.g. `legal_urgent_free_consult`, `construction_vague_scope_tight_budget`). |
| **Legacy (enum)** | Client sends **`scenarioType`** only (legacy enum) | One of: `PRICE_SENSITIVE`, `INDECISIVE`, `DEMANDING`, `TIME_PRESSURED`, `HIGH_BUDGET`. |

Implementation reference: `app/api/v1/simulations/start/route.ts` — if `scenarioId` is present, `resolvedScenarioType` is set to that id; otherwise the legacy branch uses the enum string.

### Continuing a conversation (`POST .../simulations/[id]/message`)

- **`message/route.ts`** branches on whether `simulation.scenarioType` is in a fixed set `LEGACY_SCENARIO_TYPES`.  
  - **Legacy enum** → uses `generateSimulationPrompt()` from `lib/ai/prompts/simulation.ts` (industry templates + `BusinessProfile`).  
  - **Otherwise** (new id) → rebuilds an **inline** client system prompt from `personaDetails` + `businessProfile` + optional `getScenarioById(simulation.scenarioType)`.

### Is AI persona generation “working”?

**Yes, for the intended paths**, with the caveat that there are **two behaviors**:

1. **New path (`scenarioId`)**  
   - **Structured persona:** `generatePersona(scenario)` in `lib/templates/persona-generator.ts` (randomized name, age, budget, personality, pain points, timeline, opening line, backstory from the scenario’s `personaTemplate`).  
   - **LLM roleplay:** first and subsequent turns use the **inline** prompts in `start/route.ts` and `message/route.ts` (not `simulation.ts`), grounded in `BusinessProfile` + scenario teaser + persona fields.

2. **Legacy path (enum `scenarioType`)**  
   - **No** `generatePersona` — persona-ish fields come from **`getScenarioConfig()`** in `lib/ai/prompts/simulation.ts` and are stored under `aiPersona` as a simpler object.  
   - **LLM roleplay:** `generateSimulationPrompt` + industry templates from `getIndustryTemplate(businessProfile.industry)` — if the profile industry does not match a **legacy template slug**, prompts fall back to generic scenario text.

So persona generation is **working** for new simulations that use **`scenarioId`** and a valid **`BusinessProfile.industry`**; legacy flows work but use a different persona model and different industry keys (`industry-templates.ts` slugs vs scenario display names).

---

## 4. Quick checklist for operators

- [ ] Onboarding industry must be one of the **10 exact strings** in section 1 if you expect non-empty scenario lists from `GET .../scenarios`.  
- [ ] Do not assume **`tenant.industry`** equals the vertical used for simulations; confirm **`businessProfile.industry`**.  
- [ ] **`scenarioType`** on a row is either a **legacy enum** or a **scenario `id`** from `industry-scenarios.ts` — check which before reading `personaDetails` or choosing prompt code paths.

---

## 5. File map

| Concern | File(s) |
|--------|---------|
| Canonical vertical strings + scenarios | `lib/templates/industry-scenarios.ts` |
| Legacy prompt templates (slug keys) | `lib/templates/industry-templates.ts`, `lib/templates/index.ts` |
| Persona randomization | `lib/templates/persona-generator.ts` |
| Start simulation + `scenarioType` assignment | `app/api/v1/simulations/start/route.ts` |
| Turn-by-turn prompts | `app/api/v1/simulations/[id]/message/route.ts` |
| List scenarios for profile | `app/api/v1/simulations/scenarios/route.ts` |
| Industry dropdown | `components/onboarding/IndustrySelect.tsx` |
| DB: tenant vs profile industry | `prisma/schema.prisma` (`Tenant`, `BusinessProfile`) |
