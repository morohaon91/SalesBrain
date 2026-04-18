# `lib/extraction/completion.ts` — Audit Report

_Date: 2026-04-18 | Profile audited: `ca5576bb-a177-413c-b2d6-099dc222cc1d`_

---

## 1. Full Scoring Formula

| Section | Max pts | What earns the points |
|---|---|---|
| **Questionnaire** | 20 | industry(4) + serviceDescription(4) + targetClientType(3) + typicalBudgetRange(3) + commonClientQuestions≥1(3) + serviceArea(2) + teamSize(1) |
| **Communication Style** | 15 | tone(3) + commonPhrases≥3(4) + evidenceCount≥3(4) + humorExamples≥1 OR empathyExamples≥1(4) |
| **Pricing Logic** | 15 | minimumBudget OR preferredBudgetRange(5) + priceDefenseStrategy(5) + flexibleOn≥1 OR notFlexibleOn≥1(5) |
| **Qualification Criteria** | 15 | greenFlags≥2(5) + redFlags≥1(5) + dealBreakers≥1(5) |
| **Objection Handling** | 15 | playbooks × 5, capped at 15 |
| **Decision Making** | 10 | firstQuestions≥3(3) + valuePositioning.primaryValueLens(3) + closing.preferredNextStep(4) |
| **Business Facts** | 10 | yearsExperience(3) + serviceOfferings≥1(4) + certifications≥1(3) |

---

## 2. What's Actually Written to the DB vs What the Code Reads

| Field | Code reads | DB reality |
|---|---|---|
| `profile.serviceOfferings` | array, needs ≥1 | **Always `[]`** — extraction writes `serviceDescription` (string), never populates this array |
| `profile.certifications` | array, needs ≥1 | **Always `[]`** — no extraction step writes this |
| `communicationStyle.evidenceCount` | number ≥ 3 | Set to sim count; currently **1** for this profile |
| `communicationStyle.humorExamples` / `empathyExamples` | array ≥1 | **Both `[]`** — extraction sets `usesHumor`/`usesEmpathy` booleans instead |
| `decisionMakingPatterns.valuePositioning?.primaryValueLens` | nested property | **STRUCTURAL BUG**: stored as a flat string in DB, not an object — `.primaryValueLens` always `undefined` → 3pts permanently unreachable |
| `decisionMakingPatterns.discovery.firstQuestions` | array ≥3 | **`[]`** — not populated by extraction |
| `decisionMakingPatterns.closing.preferredNextStep` | string | **`null`** — not populated |
| `objectionHandling.playbooks` | array | **`[]`** — 0 playbooks despite section being marked "populated" |
| `qualificationCriteria.redFlags` | array ≥1 | **`[]`** — extraction found 6 green flags but 0 red flags |
| `qualificationCriteria.dealBreakers` | array ≥1 | **`[]`** — not extracted |
| `pricingLogic.minimumBudget` / `preferredBudgetRange` | value | **Both `null`** |
| `pricingLogic.priceDefenseStrategy` | string | **`null`** |

---

## 3. Per-Section Accuracy Flags

| Section | Risk | Detail |
|---|---|---|
| Questionnaire | ✅ Accurate | All 7 fields are questionnaire inputs — user controls them directly |
| Communication Style | **Deflation** | `evidenceCount≥3` requires 3+ completed simulations, locking 4pts for new users. `humorExamples`/`empathyExamples` never populated → 4pts always locked. Max realistic score: **7/15** |
| Pricing Logic | **Deflation** | `minimumBudget`/`preferredBudgetRange` and `priceDefenseStrategy` are null in practice. Only `flexibleOn` gets populated. Max realistic score: **5/15** |
| Qualification Criteria | **Extraction bias** | Extraction reliably finds green flags but not red flags or deal breakers. A strong sales call (6 green + 0 red) scores 5/15 — the opposite of intended behavior. Max realistic score: **5/15** |
| Objection Handling | **Always 0** | Playbooks array is never populated by the extraction engine. Every profile scores 0/15. |
| Decision Making | **Structural bug + always 0** | `valuePositioning` stored as flat string, read as object → 3pts always gone. `firstQuestions` and `preferredNextStep` not extracted → remaining 7pts gone. Max realistic score: **0/10** |
| Business Facts | **Dead weight** | `serviceOfferings` never populated (4pts). `certifications` never populated (3pts). Only `yearsExperience` earns. Max realistic score: **3/10** |

---

## 4. Dead Weight — Fields That Can Never Score

These fields exist in the formula but the extraction engine never writes them:

| Field | Points locked | Root cause |
|---|---|---|
| `serviceOfferings` | 4 | Extraction writes `serviceDescription` (string), not this array |
| `certifications` | 3 | No extraction step writes this field |
| `humorExamples` / `empathyExamples` | 4 | Extraction uses boolean flags (`usesHumor`, `usesEmpathy`), not example arrays |
| `objectionHandling.playbooks` | 15 | Array never populated |
| `decisionMakingPatterns.valuePositioning.primaryValueLens` | 3 | Field is a flat string — object property access always returns `undefined` |
| `decisionMakingPatterns.discovery.firstQuestions` | 3 | Not extracted |
| `decisionMakingPatterns.closing.preferredNextStep` | 4 | Not extracted |

**Total permanently locked: ~36 points** out of 100.  
The realistic ceiling for any profile — even with many simulations — is roughly **~60/100**.

---

## 5. Real DB Score Breakdown

Profile `ca5576bb` — stored `completionScore: 40`

| Section | Earned | Max | Notes |
|---|---|---|---|
| Questionnaire | 20 | 20 | All 7 fields present |
| Communication Style | 7 | 15 | tone + commonPhrases only; evidenceCount=1 (needs 3); humor/empathy empty |
| Pricing Logic | 5 | 15 | Only `flexibleOn` populated; budget and defense null |
| Qualification Criteria | 5 | 15 | 6 green flags; 0 red flags; 0 deal breakers |
| Objection Handling | 0 | 15 | 0 playbooks |
| Decision Making | 0 | 10 | All sub-fields empty or structurally broken |
| Business Facts | 3 | 10 | yearsExperience=10; serviceOfferings=[]; certifications=[] |
| **Total** | **40** | **100** | Matches stored value ✓ |

---

## 6. Recommended Actions

| Priority | Action |
|---|---|
| P0 | Fix `decisionMakingPatterns.valuePositioning` — extraction must write `{ primaryValueLens: string }`, not a flat string |
| P0 | Fix extraction to populate `objectionHandling.playbooks` array after each sim |
| P1 | Fix extraction to populate `decisionMakingPatterns.discovery.firstQuestions` and `closing.preferredNextStep` |
| P1 | Fix extraction to populate `qualificationCriteria.redFlags` and `dealBreakers` (not just green flags) |
| P1 | Fix extraction to populate `communicationStyle.humorExamples` / `empathyExamples` from `usesHumor`/`usesEmpathy` signals |
| P2 | Decide: does `serviceOfferings` get written by extraction, or should Business Facts read `serviceDescription` instead? |
| P2 | Decide: is `certifications` a user-entered field (questionnaire) or extraction-derived? Add it to the right place. |
| P2 | Consider lowering `evidenceCount` threshold from 3 to 1 for Communication Style — 3 sims is a high bar for early users |
