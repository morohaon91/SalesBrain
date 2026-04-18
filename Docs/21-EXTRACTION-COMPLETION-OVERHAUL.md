# Extraction Engine + Completion Formula Overhaul
**Date:** 2026-04-18
**Depends on:** `20-ACTIVATION-SCORE-REFACTOR.md` (must be completed first)

---

## Context

Read `19-CONFIDENCE-GOLIVE-AUDIT-2026-04-18.md` and `completion-ts-audit.md` before starting.

The audit found:
- 36 out of 100 completion points are permanently locked due to extraction bugs
- The completion formula has dead weight sections that never score
- The questionnaire and Basic Info tab are out of sync
- The profile page shows a % that confuses users relative to the Activation Score
- New users face choice paralysis on the simulations page

This document fixes all of it. Execute in order — each part is independently testable.

---

## Part 1 — Fix the Extraction Engine

**File:** `lib/extraction/extraction-engine.ts`

These are bugs where the formula expects data that the engine never writes. Fix each one.

### Fix 1 — `valuePositioning` Structure

**Problem:** Stored as a flat string `"outcome"`, but completion formula reads `valuePositioning.primaryValueLens` (object property) → always `undefined` → 3pts permanently locked.

**Fix:** In `mergeDecisionMaking`, wherever `valuePositioning` is written, ensure it is always stored as an object:

```ts
valuePositioning: {
  primaryValueLens: extracted.valuePositioning?.primaryValueLens 
    || existing.valuePositioning?.primaryValueLens 
    || null,
  secondaryValueLens: mergeUnique(
    existing.valuePositioning?.secondaryValueLens || [],
    extracted.valuePositioning?.secondaryValueLens || []
  ),
  proofSignalsUsed: mergeUnique(
    existing.valuePositioning?.proofSignalsUsed || [],
    extracted.valuePositioning?.proofSignalsUsed || []
  ),
},
```

If the existing DB value is a flat string (migration case), handle it:
```ts
const existingVP = typeof existing.valuePositioning === 'string'
  ? { primaryValueLens: existing.valuePositioning, secondaryValueLens: [], proofSignalsUsed: [] }
  : existing.valuePositioning;
```

### Fix 2 — `objectionHandling.playbooks` Never Populated

**Problem:** The extraction prompt asks Claude to extract objection handling, but the merge function never writes to the `playbooks` array correctly. Every profile shows 0 playbooks.

**Fix:** In `mergeObjectionHandling`, add explicit logging to verify what Claude is returning for playbooks. Then ensure the merge path handles both the case where Claude returns an array and where it returns an object keyed by type.

Add a fallback: if `extracted.objectionHandling` exists but `extracted.objectionHandling.playbooks` is empty or undefined, check if Claude returned objection data in a flat structure and normalize it into the playbooks array format before merging.

After fixing, verify by completing one simulation and checking the DB directly:
```sql
SELECT "objectionHandling"->'playbooks' FROM "BusinessProfile" WHERE id = '<your-profile-id>';
```
Expected: array with at least 1 playbook entry.

### Fix 3 — `discovery.firstQuestions` Never Populated

**Problem:** `decisionMakingPatterns.discovery.firstQuestions` is always `[]` — extraction prompt returns discovery data but the merge function doesn't write `firstQuestions`.

**Fix:** In `mergeDecisionMaking`, in the discovery merge block, explicitly map Claude's returned questions:

```ts
discovery: {
  firstQuestions: mergeUnique(
    existing.discovery?.firstQuestions || [],
    extracted.discovery?.firstQuestions || extracted.discovery?.questions || []
  ).slice(0, 15),
  discoveryOrder: extracted.discovery?.discoveryOrder || existing.discovery?.discoveryOrder || [],
  prioritizedInfo: mergeUnique(
    existing.discovery?.prioritizedInfo || [],
    extracted.discovery?.prioritizedInfo || []
  ),
  moveToValueTrigger: extracted.discovery?.moveToValueTrigger 
    || existing.discovery?.moveToValueTrigger 
    || null,
},
```

### Fix 4 — `closing.preferredNextStep` Never Populated

**Problem:** Always `null` — extraction returns it but merge doesn't write it.

**Fix:** In `mergeDecisionMaking`, in the closing merge block:

```ts
closing: {
  asksForNextStep: extracted.closing?.asksForNextStep ?? existing.closing?.asksForNextStep ?? false,
  ctaTiming: extracted.closing?.ctaTiming || existing.closing?.ctaTiming || null,
  ctaDirectness: extracted.closing?.ctaDirectness || existing.closing?.ctaDirectness || null,
  preferredNextStep: extracted.closing?.preferredNextStep 
    || existing.closing?.preferredNextStep 
    || null,
  createsUrgency: extracted.closing?.createsUrgency ?? existing.closing?.createsUrgency ?? false,
  urgencyMethod: extracted.closing?.urgencyMethod || existing.closing?.urgencyMethod || null,
},
```

### Fix 5 — `humorExamples` / `empathyExamples` Never Populated

**Problem:** Extraction writes `usesHumor: true` / `usesEmpathy: true` booleans but never populates the example arrays. 4pts locked.

**Fix:** In `mergeCommunicationStyle`, add:

```ts
humorExamples: mergeUnique(
  existing.humorExamples || [],
  extracted.humorExamples || extracted.humorInstances || []
).slice(0, 10),

empathyExamples: mergeUnique(
  existing.empathyExamples || [],
  extracted.empathyExamples || extracted.empathyInstances || []
).slice(0, 10),
```

Also update the extraction prompt to explicitly ask Claude to return `humorExamples` and `empathyExamples` as string arrays of actual quotes from the conversation, not just boolean flags.

**File:** `lib/extraction/extraction-prompts.ts`

In `EXTRACTION_SYSTEM_PROMPT`, in the LAYER 1 section, add:

```
- humorExamples: string[] — direct quotes where owner used humor (empty array if none)
- empathyExamples: string[] — direct quotes where owner showed empathy (empty array if none)
```

### Fix 6 — `certifications` Always `[]`

**Problem:** The questionnaire form has a Certifications/Licenses field with an "+ Add Certification" UI, but `certifications` is always `[]` in the DB. This is a form save bug.

**Fix:** Find the questionnaire form submission handler (likely in `app/questionnaire/page.tsx` or the API route it calls — `app/api/v1/profiles/questionnaire/route.ts` or similar). Verify that `certifications` is being included in the payload sent to the server. If the UI stores them in local state as an array but forgets to include them in the POST body, add it. If the API route receives it but doesn't write it to the DB, fix the Prisma update call.

After fixing, verify:
1. Add a certification in the questionnaire
2. Check DB: `SELECT certifications FROM "BusinessProfile"` — should be a non-empty array.

---

## Part 2 — Redesign the Completion Formula

**File:** `lib/extraction/completion.ts`

Replace the entire scoring formula with the following. Do not change the function signature — it should still accept a profile and return a number 0–100.

### New Formula

```
Communication Style    20pts  (was 15)
Objection Handling     20pts  (was 15)
Decision Making        20pts  (was 10)
Qualification Criteria 15pts  (was 15)
Pricing Logic          15pts  (was 15)
Questionnaire          10pts  (was 20 — Business Facts merged in)
─────────────────────────────────────
Total                 100pts
```

### Section Breakdown

**Communication Style — 20pts**
```ts
let comm = 0;
if (cs?.tone) comm += 4;
if ((cs?.commonPhrases?.length || 0) >= 3) comm += 4;
if ((cs?.commonPhrases?.length || 0) >= 8) comm += 2; // bonus for richness
if (cs?.energyLevel) comm += 2;
if ((cs?.humorExamples?.length || 0) >= 1 || (cs?.empathyExamples?.length || 0) >= 1) comm += 4;
if ((cs?.evidenceCount || 0) >= 1) comm += 2; // lowered from 3 — fair for early users
if ((cs?.evidenceCount || 0) >= 3) comm += 2; // bonus for multiple simulations
```

**Objection Handling — 20pts**
```ts
const playbookCount = oh?.playbooks?.length || 0;
let obj = Math.min(20, playbookCount * 5); // 4 playbooks = max 20pts
// Bonus: if price objection specifically handled
if (oh?.playbooks?.some(p => p.objectionType === 'price' && p.confidenceScore >= 60)) obj = Math.min(20, obj + 2);
```

**Decision Making — 20pts**
```ts
let dm = 0;
if ((patterns?.discovery?.firstQuestions?.length || 0) >= 1) dm += 4;
if ((patterns?.discovery?.firstQuestions?.length || 0) >= 3) dm += 2; // bonus
if (patterns?.discovery?.moveToValueTrigger) dm += 3;
if (patterns?.valuePositioning?.primaryValueLens) dm += 4;
if ((patterns?.valuePositioning?.proofSignalsUsed?.length || 0) >= 1) dm += 3;
if (patterns?.closing?.preferredNextStep) dm += 4;
```

**Qualification Criteria — 15pts**
```ts
let qual = 0;
if ((qc?.greenFlags?.length || 0) >= 2) qual += 5;
// Penalize profiles that only have green flags — AI needs to know when to say no
const hasNegative = (qc?.redFlags?.length || 0) >= 1 || (qc?.dealBreakers?.length || 0) >= 1;
if (hasNegative) qual += 5;
if ((qc?.dealBreakers?.length || 0) >= 1) qual += 5;
// Cap at 10 if no negative signals at all — cannot max this section without them
if (!hasNegative) qual = Math.min(qual, 8);
```

**Pricing Logic — 15pts**
```ts
let pricing = 0;
if (pl?.minimumBudget || pl?.preferredBudgetRange) pricing += 6;
if (pl?.priceDefenseStrategy) pricing += 6;
if ((pl?.flexibleOn?.length || 0) >= 1 || (pl?.notFlexibleOn?.length || 0) >= 1) pricing += 3;
```

**Questionnaire — 10pts (includes former Business Facts)**
```ts
let quest = 0;
if (profile.industry) quest += 2;
if ((profile.serviceDescription?.length || 0) > 20) quest += 2;
if (profile.targetClientType) quest += 1;
if (profile.typicalBudgetRange) quest += 1;
if ((profile.commonClientQuestions?.length || 0) >= 1) quest += 1;
if (profile.serviceArea) quest += 1;
// Former Business Facts (merged in):
if (profile.yearsInBusiness || profile.yearsExperience) quest += 1;
if ((profile.certifications?.length || 0) >= 1) quest += 1;
```

### Remove `serviceOfferings` Entirely

The formula must not reference `serviceOfferings` anywhere. Replace any existing check for `serviceOfferings` with `serviceDescription.length > 20`. Remove `serviceOfferings` from TypeScript interfaces if it exists there.

### Lower `evidenceCount` Threshold

The old formula required `evidenceCount >= 3` to earn 4pts — this locked points for users with only 1–2 simulations. New formula above uses `>= 1` for base points and `>= 3` for bonus points. This is already reflected above.

---

## Part 3 — Unify Questionnaire and Basic Info Tab

**Goal:** The Basic Info tab on the Profile page must show and save the exact same fields as the onboarding questionnaire.

### Step 1 — Audit current fields

Find the Basic Info tab component (likely `app/profile/components/BasicInfoTab.tsx` or similar). List every field it currently shows. Compare against the questionnaire fields:

Questionnaire fields:
- Industry
- Service Description
- Target Client Type
- Typical Budget Range
- Common Client Questions (array)
- Years of Experience
- Certifications / Licenses (array)
- Service Area
- Team Size

If any fields are missing from the Basic Info tab, add them. If the Basic Info tab has fields that don't exist in the questionnaire, evaluate whether they belong in the questionnaire too — if yes, add them there.

### Step 2 — Unify the save endpoint

The questionnaire and the Basic Info tab must both POST to the same API endpoint with the same payload shape. Find the current save handlers for each:
- Questionnaire: likely `app/api/v1/profiles/questionnaire/route.ts` or `onboarding`
- Basic Info tab: likely `app/api/v1/profiles/[tenantId]/route.ts` or similar

If they are different endpoints writing to different fields, consolidate them into one: `PATCH /api/v1/profiles/basic-info` that handles all questionnaire/basic-info fields in a single Prisma update.

Both the questionnaire submit and the Basic Info save button call this same endpoint.

### Step 3 — Verify field mapping

After unifying the endpoint, confirm every field saves correctly:
1. Fill out the questionnaire completely
2. Navigate to Profile → Basic Info tab
3. Verify all values appear
4. Edit one field, save
5. Reload — verify the change persisted
6. Check the DB directly to confirm the correct column was updated

---

## Part 4 — Profile Page UI: Remove the Headline %

**File:** The Extracted Patterns tab component on the Profile page (likely `app/profile/components/ExtractedPatternsTab.tsx` or similar).

### Remove
- The "Profile Completion — 40%" headline number
- The progress bar under it
- Any text referencing this % as a progress indicator

### Replace With

A section-by-section data coverage table. No top-level percentage. Label it clearly as "Extracted Data Coverage" not "Profile Completion" to prevent confusion with the Activation Score.

```
Extracted Data Coverage
How much detail has been captured from your simulations.
This does not affect your go-live readiness score.

┌─────────────────────────────────────────────────────────────┐
│ Section              │ Coverage bar     │ Score  │ Status   │
├─────────────────────────────────────────────────────────────┤
│ Questionnaire        │ ████████████████ │ 10/10  │ ✓        │
│ Communication Style  │ ████████░░░░░░░░ │  8/20  │          │
│ Objection Handling   │ ░░░░░░░░░░░░░░░░ │  0/20  │ needs sim│
│ Decision Making      │ ████░░░░░░░░░░░░ │  4/20  │          │
│ Qualification        │ ████████░░░░░░░░ │  8/15  │          │
│ Pricing Logic        │ ████░░░░░░░░░░░░ │  6/15  │          │
└─────────────────────────────────────────────────────────────┘

1 simulation completed · Last extracted 4/18/2026
```

For sections scoring 0, show a subtle note: "Complete more simulations to populate this section."
For sections scoring max, show a green checkmark.

Do NOT show a total or sum. Each section stands alone.

Keep the existing "5 of 5 Go-Live gates remaining" expandable — that's useful context and should stay.

---

## Part 5 — Simulations Page: Fix First-Time User Experience

**File:** The simulations page / new simulation page (likely `app/simulations/new/page.tsx` or `app/simulations/page.tsx`).

### Current Problem
New users (0 simulations completed) see the full scenario grid — all 8 scenarios including intermediate and advanced ones. This creates choice paralysis.

### Fix

Add a condition: if `completedScenarios.length === 0`, show a focused first-time view instead of the full grid.

**First-time view (0 simulations completed):**
```
┌─────────────────────────────────────────────────────────────┐
│  Start your first training session                           │
│  This takes about 15 minutes. Your AI learns from how       │
│  you respond to a real prospect scenario.                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⭐ Hot Lead — Ready to Buy          ~15 min        │   │
│  │  Beginner · Required                                │   │
│  │  A prospect with clear pain and approved budget.    │   │
│  │  Learn how to close momentum without friction.      │   │
│  │                                                     │   │
│  │  [Start Your First Simulation →]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  You'll unlock all 8 scenarios after your first session.   │
└─────────────────────────────────────────────────────────────┘
```

**After first simulation completed:** show the full grid as it currently exists, with the recommended scenario highlighted at the top.

Implementation:
```ts
const isFirstTime = completedScenarios.length === 0;

if (isFirstTime) {
  // Show focused single-scenario view
  // Hard-code to 'hot_lead_universal' scenario
  // Show unlock message at bottom
} else {
  // Show existing full grid with recommended + all available
}
```

---

## Part 6 — Backfill Existing Profiles

After all fixes are deployed, re-run completion calculation for all existing profiles so their scores reflect the new formula and the newly populated fields.

**File:** Create `scripts/backfill-completion-scores.ts`

```ts
import { prisma } from '../lib/db/prisma';
import { calculateCompletionScore } from '../lib/extraction/completion';

async function backfill() {
  const profiles = await prisma.businessProfile.findMany();
  
  console.log(`Backfilling ${profiles.length} profiles...`);
  
  for (const profile of profiles) {
    try {
      const score = calculateCompletionScore(profile);
      await prisma.businessProfile.update({
        where: { id: profile.id },
        data: { completionPercentage: score }
      });
      console.log(`✓ ${profile.id} → ${score}%`);
    } catch (err) {
      console.error(`✗ ${profile.id}`, err);
    }
  }
  
  console.log('Done.');
}

backfill();
```

Run with: `npx ts-node scripts/backfill-completion-scores.ts`

---

## Execution Order

Execute in this exact order:

1. **Part 1** — Fix extraction engine bugs → verify by running one simulation and checking DB fields are now populated
2. **Part 2** — Redesign completion formula → verify new section scores add up correctly against the test profile
3. **Part 3** — Unify questionnaire + Basic Info tab → verify same data shows in both places after save
4. **Part 4** — Remove headline % from Profile page → verify no % shown, section table shows correctly
5. **Part 5** — Fix first-time simulation UX → verify new user sees focused view, returning user sees full grid
6. **Part 6** — Backfill → run script, verify no profiles stuck at incorrect scores

---

## Acceptance Criteria

**Extraction Engine:**
- [ ] After one simulation: `objectionHandling.playbooks` has at least 1 entry
- [ ] After one simulation: `decisionMakingPatterns.discovery.firstQuestions` is non-empty array
- [ ] After one simulation: `decisionMakingPatterns.closing.preferredNextStep` is non-null
- [ ] After one simulation: `decisionMakingPatterns.valuePositioning` is an object with `primaryValueLens` property
- [ ] After one simulation: `communicationStyle.humorExamples` or `empathyExamples` is non-empty if those signals appeared
- [ ] Certifications saved from questionnaire appear in DB as non-empty array

**Completion Formula:**
- [ ] Max score per section matches new weights (20/20/20/15/15/10)
- [ ] Qualification section cannot exceed 8pts without at least 1 red flag or deal breaker
- [ ] `serviceOfferings` not referenced anywhere in the formula
- [ ] A profile with 0 simulations scores no more than 10pts (questionnaire only)
- [ ] A profile with 4 completed simulations and good extraction can realistically reach 70+pts

**Questionnaire / Basic Info:**
- [ ] All questionnaire fields visible and editable in Basic Info tab
- [ ] Saving from either location writes to the same DB columns
- [ ] Certifications field saves correctly from both locations

**Profile Page:**
- [ ] No headline % shown on Extracted Patterns tab
- [ ] Section-by-section table shown with label "Extracted Data Coverage"
- [ ] Disclaimer text: "This does not affect your go-live readiness score"
- [ ] No progress bar at the top of the Extracted Patterns section

**Simulations Page:**
- [ ] User with 0 simulations sees single focused scenario view
- [ ] User with 1+ simulations sees full scenario grid
- [ ] Unlock message shown at bottom of first-time view

---

## What NOT to Change

- Do not touch `lib/learning/activation-score.ts` — that is a separate system from `20-ACTIVATION-SCORE-REFACTOR.md`
- Do not touch `lib/learning/competencies.ts` or `go-live-gates.ts`
- Do not change the Activation Score formula or the `/api/v1/profiles/activation-status` endpoint
- Do not remove the "5 of 5 Go-Live gates remaining" expandable from the Profile page — keep it
- Do not change the simulation chat interface itself — only the scenario selection page
- Team Size field: leave as-is, no changes needed
