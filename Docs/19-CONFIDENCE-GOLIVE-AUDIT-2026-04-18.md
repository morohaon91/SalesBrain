# Confidence & Go-Live Score — Deep Dive Audit

**Date:** 2026-04-18  
**Status:** Pending fix decisions

---

## How the System Works (Big Picture)

There are **two separate scoring systems** that feed two different UI views:

|  | Profile Completion % | Go-Live Readiness |
|---|---|---|
| **Shown in** | Extracted Patterns tab (Profile page) | AI Training page |
| **Calculated by** | `lib/extraction/completion.ts` | `lib/learning/competencies.ts` + `go-live-gates.ts` |
| **Logic** | Does this data *exist*? | Is the confidence *high enough*? |
| **Uses `overallConfidence`?** | ❌ No | ✅ Yes |

These two systems are **independent**. Profile completion can be 40% even if all competencies are blocked, and vice versa.

---

## System 1 — Profile Completion % (Working Correctly)

**File:** `lib/extraction/completion.ts`

Purely counts whether data was extracted. No confidence scores involved.

| Section | Weight | What it checks |
|---|---|---|
| Questionnaire | 20% | industry, description, budget, etc. filled in |
| Communication Style | 15% | has tone, 3+ phrases, 3+ simulations |
| Pricing Logic | 15% | has minimumBudget, defense strategy, flexibility |
| Qualification Criteria | 15% | has 2+ green flags, 1+ red flag, 1+ deal breaker |
| Objection Handling | 15% | number of playbooks × 5 |
| Decision Making | 10% | discovery questions, value lens, closing step |
| Business Facts | 10% | years experience, services, certifications |

**No bugs here. This system works correctly today.**

---

## System 2 — Go-Live Readiness (Contains Bugs)

### The 5 Hard Gates

All 5 must PASS for the profile to go live.  
**File:** `lib/learning/go-live-gates.ts`

| Gate | What it checks | Status |
|---|---|---|
| Complete All 8 Mandatory Scenarios | Count of `completedScenarios` | ✅ Works correctly |
| All Mandatory Competencies Achieved | Runs all 9 competency validators | ⚠️ Inherits bugs below |
| Price & Trust Objections Handled | Individual playbook `confidenceScore >= 70` | ⚠️ Depends on Claude returning it |
| At Least 1 Deal Breaker Validated | Individual deal breaker `confidence >= 75` | ⚠️ Depends on Claude returning it |
| Linguistic Fingerprint Captured | Counts greetings/phrases/closings (no confidence) | ✅ Works correctly |

### The 9 Competencies

All 9 are required for go-live.  
**File:** `lib/learning/competencies.ts`

| Competency | Reads from | Min confidence | Bug? |
|---|---|---|---|
| Communication Style Established | `communicationStyle.confidence` | 70% | ✅ Works |
| Linguistic Fingerprint Captured | Counts examples × 3 (ignores stored confidence) | 60% | ✅ Works |
| Discovery Mastery | `decisionMakingPatterns.overallConfidence` | 70% | ❌ Broken |
| Value Positioning Established | `decisionMakingPatterns.overallConfidence` | 65% | ❌ Broken |
| Closing Strategy Defined | `decisionMakingPatterns.overallConfidence` | 70% | ❌ Broken |
| Green Flags Identified | `qualificationCriteria.overallConfidence` | 65% | ❌ Broken |
| Deal Breakers Validated | Avg of individual `dealBreaker.confidence` | 75% | ✅ Works |
| Price Objection Handling | Individual `playbook.confidenceScore` | 75% | ⚠️ Depends on Claude |
| Trust Objection Handling | Individual `playbook.confidenceScore` | 70% | ⚠️ Depends on Claude |

**4 out of 9 competencies are broken.** They stay stuck near 0% regardless of how good the extracted data is.

---

## The Root Cause

**File:** `lib/extraction/extraction-engine.ts`

Every section has two code paths: first simulation, and subsequent simulations.

### First simulation (no existing data):
```ts
overallConfidence: e.overallConfidence ?? 0
```
Uses what Claude returned, OR defaults to 0 if Claude didn't return it.  
**Problem:** The extraction prompt never tells Claude to return `overallConfidence` — so Claude almost always omits it → stored as 0.

### Subsequent simulations:
```ts
overallConfidence: Math.min(100, existing.overallConfidence + 5)
```
Completely ignores what Claude returned. Just adds +5 to whatever was stored before.  
Starting from 0 → need **13 simulations** to reach 65%.

### How each section behaves today:

| Section | First sim default | Update logic | Impact |
|---|---|---|---|
| `communicationStyle.confidence` | `e.confidence ?? 30` | Averages with Claude's value | ✅ Not broken (starts at 30) |
| `qualificationCriteria.overallConfidence` | `e.overallConfidence ?? 0` | `existing + 5` | ❌ Broken — used by Green Flags competency |
| `decisionMakingPatterns.overallConfidence` | `e.overallConfidence ?? 0` | `existing + 5` | ❌ Broken — used by 3 strategic competencies |
| `objectionHandling.overallConfidence` | `e.overallConfidence ?? 0` | `existing + 5` | ⚠️ Not used in any gate, no real impact |
| `pricingLogic.confidence` | `e.confidence ?? 0` | `existing + 5` | ⚠️ Not used in any gate, no real impact |
| `playbook.confidenceScore` (per item) | From Claude | `existing + 10` per encounter | ⚠️ Works if Claude returns it |
| `dealBreaker.confidence` (per item) | From Claude | `existing + 10` per encounter | ⚠️ Works if Claude returns it |

The two fields that actually block go-live are:
- `qualificationCriteria.overallConfidence` → blocks **Green Flags Identified**
- `decisionMakingPatterns.overallConfidence` → blocks **Discovery Mastery**, **Value Positioning**, **Closing Strategy**

---

## Real-World Example (Current Profile)

- 7 green flags stored in DB ✅
- Extracted Patterns tab shows them correctly ✅
- `qualificationCriteria.overallConfidence` = ~0 in DB ❌
- AI Training shows 0% for Green Flags Identified ❌

Same pattern applies to `decisionMakingPatterns` — data is likely extracted, but all 3 strategic competencies show 0%.

---

## Three Fix Options

### Option A — Quick Fix (1 line per section)

In the UPDATE path, take the max of `existing + 5` vs what Claude returned:

```ts
overallConfidence: Math.min(100, Math.max(existing.overallConfidence + 5, e.overallConfidence ?? 0))
```

**Pros:** Tiny change, immediate fix, safe.  
**Cons:** Still depends on Claude returning the field. If Claude returns 0, you only get +5.

---

### Option B — Compute from Actual Data (Recommended)

Don't trust Claude to return `overallConfidence`. Calculate it from what was extracted:

- `qualificationCriteria.overallConfidence` → average `confidence` of individual green flags + red flags
- `decisionMakingPatterns.overallConfidence` → % of key fields that were filled (firstQuestions, valuePositioning, closingStep, moveToValueTrigger)

Individual `playbook.confidenceScore` and `dealBreaker.confidence` already come from Claude per-item — keep those as-is.

**Pros:** Accurate, self-correcting, no dependency on Claude returning a top-level field.  
**Cons:** Need to define the formula per section. Slightly more code.

---

### Option C — Remove Stored `overallConfidence` Entirely (Cleanest)

Compute confidence on-the-fly inside each competency validator, exactly like `linguistic_fingerprint_captured` and `deal_breakers_validated` already do. Never store it, never trust Claude to return it.

**Pros:** No stale/broken confidence in DB. Always reflects current data.  
**Cons:** Bigger refactor, touches every competency validator.

---

## Recommendation

**Go with Option B.**

It's the right architecture — confidence should reflect the data, not an arbitrary counter. It's also consistent with how the two working competencies already behave:
- `linguistic_fingerprint_captured` computes `confidence = totalExamples * 3`
- `deal_breakers_validated` computes `avgConfidence` from individual item scores

### Specific changes needed for Option B:

**1. `mergeQualificationCriteria` in `lib/extraction/extraction-engine.ts`**  
Replace `existing.overallConfidence + 5` with:
```ts
const allFlags = [...mergedGreenFlags, ...mergedRedFlags];
const overallConfidence = allFlags.length > 0
  ? Math.round(allFlags.reduce((sum, f) => sum + (f.confidence || 0), 0) / allFlags.length)
  : 0;
```

**2. `mergeDecisionMaking` in `lib/extraction/extraction-engine.ts`**  
Replace `existing.overallConfidence + 5` with:
```ts
const filledFields = [
  merged.discovery?.firstQuestions?.length >= 3,
  merged.discovery?.moveToValueTrigger,
  merged.valuePositioning?.primaryValueLens,
  merged.valuePositioning?.proofSignalsUsed?.length >= 1,
  merged.closing?.asksForNextStep,
  merged.closing?.preferredNextStep,
].filter(Boolean).length;

const overallConfidence = Math.round((filledFields / 6) * 100);
```

**No changes needed** for `objectionHandling.overallConfidence` or `pricingLogic.confidence` — those fields are not used by any gate or competency.

---

## Files to Touch

| File | Change |
|---|---|
| `lib/extraction/extraction-engine.ts` | Fix `mergeQualificationCriteria` and `mergeDecisionMaking` |
| `lib/extraction/extraction-prompts.ts` | Optional: explicitly ask Claude to return `overallConfidence` as a fallback |

No changes needed in competencies, gates, or the readiness calculator — the validators already read these fields correctly, they just get 0 because the engine never populates them properly.
