# Activation Score Refactor — Execution Prompt
**Date:** 2026-04-18
**Reference doc in repo:** `19-CONFIDENCE-GOLIVE-AUDIT-2026-04-18.md`

---

## Context

Read `19-CONFIDENCE-GOLIVE-AUDIT-2026-04-18.md` before starting. It documents the root cause of the broken confidence scores and the exact fix needed in `lib/extraction/extraction-engine.ts`.

The app currently shows three unrelated progress numbers across three pages (Dashboard: 33%, Simulations: 67%, AI Training: 40%). Users are confused about their status. This refactor replaces all three with a single unified Activation Score.

---

## What We Are Building

A single **Activation Score (0–100%)** that:
- Measures how well the AI has actually learned to represent the owner
- Is the same number shown on every page of the app
- Unlocks Go Live at **90%** (not 100% — the owner approves the final 10% by reviewing)
- Reflects real training quality, not admin task completion

---

## Part 1 — Fix the Broken Confidence Calculations

**File:** `lib/extraction/extraction-engine.ts`

Reference: Section "The Root Cause" and "Specific changes needed for Option B" in `19-CONFIDENCE-GOLIVE-AUDIT-2026-04-18.md`.

### Fix 1 — `mergeQualificationCriteria`

Find the line that currently sets `overallConfidence` in the UPDATE path (subsequent simulations). It looks like:
```ts
overallConfidence: Math.min(100, existing.overallConfidence + 5)
```

Replace the entire `overallConfidence` calculation (both first-sim and update paths) with:
```ts
const allFlags = [...mergedGreenFlags, ...mergedRedFlags];
const overallConfidence = allFlags.length > 0
  ? Math.round(allFlags.reduce((sum, f) => sum + (f.confidence || 0), 0) / allFlags.length)
  : 0;
```

This makes `qualificationCriteria.overallConfidence` reflect the actual average confidence of extracted flags instead of an arbitrary counter.

### Fix 2 — `mergeDecisionMaking`

Find the line that currently sets `overallConfidence` in the UPDATE path. It looks like:
```ts
overallConfidence: Math.min(100, existing.overallConfidence + 5)
```

Replace the entire `overallConfidence` calculation (both first-sim and update paths) with:
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

This makes `decisionMakingPatterns.overallConfidence` reflect what was actually extracted, not a counter.

**Do NOT touch** `objectionHandling.overallConfidence` or `pricingLogic.confidence` — these are not used by any gate or competency validator.

---

## Part 2 — New Activation Score Calculation

**Create new file:** `lib/learning/activation-score.ts`

### Score Formula

```
Activation Score = Scenarios (40pts) + Competencies (45pts) + Profile (15pts)
```

| Component | Max Points | Calculation |
|---|---|---|
| Scenarios completed | 40 | `(completedScenarios.length / 8) * 40` |
| Competencies achieved | 45 | `achievedCompetencies * 5` (9 competencies × 5pts each) |
| Profile foundation | 15 | Up to 8pts for questionnaire + 7pts for business facts |

**Go Live unlocks at 90 points.**

### Implementation

```ts
import { evaluateAllCompetencies } from './competencies';

export interface ActivationScore {
  total: number;           // 0–100
  canRequestGoLive: boolean; // true when total >= 90
  breakdown: {
    scenarios: { earned: number; max: number; completed: number; total: number };
    competencies: { earned: number; max: number; achieved: number; total: number };
    profile: { earned: number; max: number };
  };
  blockingStep: 'profile' | 'simulations' | 'competencies' | 'ready';
  nextAction: string;
}

export function calculateActivationScore(profile: any): ActivationScore {
  // --- Scenarios (40pts max) ---
  const completedCount = profile.completedScenarios?.length || 0;
  const scenarioPoints = Math.round((Math.min(completedCount, 8) / 8) * 40);

  // --- Competencies (45pts max) ---
  const competencyStatuses = evaluateAllCompetencies(profile);
  const achievedCount = competencyStatuses.filter(
    c => c.status === 'ACHIEVED' || c.status === 'MASTERED'
  ).length;
  const competencyPoints = achievedCount * 5; // 9 × 5 = 45 max

  // --- Profile Foundation (15pts max) ---
  let profilePoints = 0;

  // Questionnaire (8pts): industry + description + budget range
  const hasIndustry = !!profile.industry;
  const hasDescription = !!(profile.businessDescription?.length > 20);
  const hasBudget = !!profile.typicalProjectBudget;
  if (hasIndustry) profilePoints += 3;
  if (hasDescription) profilePoints += 3;
  if (hasBudget) profilePoints += 2;

  // Business facts (7pts): years experience + services + certifications or specializations
  const hasYears = !!profile.yearsInBusiness;
  const hasServices = (profile.servicesOffered?.length || 0) >= 1;
  const hasCerts = (profile.certifications?.length || 0) >= 1 || 
                   (profile.specializations?.length || 0) >= 1;
  if (hasYears) profilePoints += 3;
  if (hasServices) profilePoints += 2;
  if (hasCerts) profilePoints += 2;

  const total = scenarioPoints + competencyPoints + profilePoints;

  // --- Blocking Step ---
  let blockingStep: ActivationScore['blockingStep'] = 'ready';
  let nextAction = 'Review and activate your AI agent';

  if (profilePoints < 8) {
    blockingStep = 'profile';
    nextAction = 'Complete your business profile';
  } else if (completedCount < 3) {
    blockingStep = 'simulations';
    nextAction = 'Complete more training simulations';
  } else if (achievedCount < 9) {
    blockingStep = 'competencies';
    nextAction = 'Continue simulations to train remaining competencies';
  }

  return {
    total: Math.min(100, total),
    canRequestGoLive: total >= 90,
    breakdown: {
      scenarios: { earned: scenarioPoints, max: 40, completed: completedCount, total: 8 },
      competencies: { earned: competencyPoints, max: 45, achieved: achievedCount, total: 9 },
      profile: { earned: profilePoints, max: 15 },
    },
    blockingStep,
    nextAction,
  };
}
```

---

## Part 3 — New Unified API Endpoint

**Create new file:** `app/api/v1/profiles/activation-status/route.ts`

This is the single endpoint all pages read from.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { calculateActivationScore } from '@/lib/learning/activation-score';
import { getNextRecommendedScenario } from '@/lib/scenarios/mandatory-scenarios';
import { validateAllGates } from '@/lib/learning/go-live-gates';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const profile = await prisma.businessProfile.findUnique({
      where: { tenantId: user.tenantId },
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const score = calculateActivationScore(profile);
    const nextScenario = getNextRecommendedScenario(profile.completedScenarios || []);
    const gates = validateAllGates(profile);

    return NextResponse.json({
      activationScore: score.total,
      canRequestGoLive: score.canRequestGoLive,
      breakdown: score.breakdown,
      blockingStep: score.blockingStep,
      nextAction: score.nextAction,
      nextScenario: nextScenario
        ? { id: nextScenario.id, name: nextScenario.name, purpose: nextScenario.purpose }
        : null,
      gates: gates.map(g => ({
        id: g.gateId,
        name: g.name,
        status: g.status,
        progress: g.progress,
        // Return max 2 blocking reasons — most actionable first
        blockingReasons: g.blockingReasons.slice(0, 2),
      })),
    });
  } catch (error) {
    console.error('Error fetching activation status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Part 4 — Update Existing Readiness Calculator

**File:** `lib/learning/readiness-calculator.ts`

In `updateProfileReadiness`, replace the status logic with:

```ts
const score = calculateActivationScore(profile);

let newStatus: ProfileApprovalStatus = profile.profileApprovalStatus;

// Only auto-update if not already approved or live
if (profile.profileApprovalStatus !== 'APPROVED' && profile.profileApprovalStatus !== 'LIVE') {
  if (score.canRequestGoLive) {
    newStatus = 'READY'; // 90%+ reached — owner can now approve
  } else if (profile.completedScenarios.length >= 1) {
    newStatus = 'PENDING';
  }
}
```

Import `calculateActivationScore` at the top of the file.

---

## Part 5 — Update UI Pages

### Rule for all pages
**Every page must read from `/api/v1/profiles/activation-status` only.**
Remove any existing local progress calculations from page components.

---

### 5A — Dashboard Banner

**File:** wherever the "Get your AI concierge live" banner component lives.

Replace the current banner with this logic:

```
activationScore = data.activationScore
blockingStep = data.blockingStep
nextAction = data.nextAction
nextScenario = data.nextScenario
```

Display:
- Title: `"Activate your AI — {activationScore}% complete"` (or `"Your AI is ready to activate!"` if `canRequestGoLive`)
- Progress bar: filled to `activationScore`%
- Three step indicators:
  - Step 1 "Build your profile" — complete when `breakdown.profile.earned >= 8`, else show `"{breakdown.profile.earned}/15 pts"`
  - Step 2 "Train your AI" — complete when `breakdown.scenarios.completed === 8 && breakdown.competencies.achieved === 9`, else show `"{breakdown.scenarios.completed}/8 scenarios · {breakdown.competencies.achieved}/9 skills"`
  - Step 3 "Approve & go live" — shown as active only when `canRequestGoLive === true`
- One CTA button below: links to the page relevant to `blockingStep`:
  - `profile` → `/profile`
  - `simulations` → `/simulations`
  - `competencies` → `/dashboard/learning`
  - `ready` → `/dashboard/go-live`

**Remove** the "40% done — need 70%" sub-label. It is no longer relevant.

---

### 5B — Simulations Page

**File:** wherever "AI Training Progress / 2 of 3 required simulations completed" appears.

Replace the progress block with:
- Title: `"AI Training Progress"`
- Subtitle: `"{breakdown.scenarios.completed} of 8 required scenarios completed"`
- Progress bar: `(breakdown.scenarios.completed / 8) * 100`%
- Scenario indicators: show all 8 scenario slots (Sim 1 through Sim 8), checkmark each completed one

**Remove** the "67% trained" percentage from this page. The activation score on the dashboard is the single number. This page shows scenario count only.

Keep the stats cards (Total, Completed, Messages, Avg Quality) — these are fine.

---

### 5C — AI Training Page

**File:** `app/dashboard/learning/page.tsx` (or equivalent).

At the top of the page:
- Show `activationScore`% as the "Overall Readiness" number — **same number as the dashboard**
- Status badge: `"In Training"` below 90%, `"Ready for Go Live"` at 90%+
- Subtitle when below 90%: `nextAction` from the API response

Below that, keep the existing Go-Live Requirements gate cards and competency breakdown — this page is the right place for that detail.

**One change to gate cards:** Only show the top 2 `blockingReasons` per gate (the API already limits this). Do not show all 10 bullets. If a gate is blocked, show the 2 most actionable reasons and a link to the relevant scenario or profile section.

**Remove** any separate "Overall Readiness" calculation local to this page. It must use `activationScore` from the API.

---

## Part 6 — Backfill Existing Profiles

After deploying, run the readiness recalculation for all existing profiles so their scores reflect the new formula:

```ts
// One-time script: scripts/backfill-activation-scores.ts

import { prisma } from '../lib/db/prisma';
import { updateProfileReadiness } from '../lib/learning/readiness-calculator';

async function backfill() {
  const profiles = await prisma.businessProfile.findMany({
    select: { id: true },
  });

  console.log(`Backfilling ${profiles.length} profiles...`);

  for (const p of profiles) {
    try {
      await updateProfileReadiness(p.id);
      console.log(`✓ ${p.id}`);
    } catch (err) {
      console.error(`✗ ${p.id}`, err);
    }
  }

  console.log('Done.');
}

backfill();
```

Run with: `npx ts-node scripts/backfill-activation-scores.ts`

---

## Execution Order

Execute in this exact order — each step is independently testable before moving to the next:

1. **Fix extraction engine** (Part 1) → verify by running a simulation and checking that `qualificationCriteria.overallConfidence` and `decisionMakingPatterns.overallConfidence` are non-zero in the DB
2. **Create activation score calculator** (Part 2) → unit test with a mock profile object
3. **Create activation status API** (Part 3) → test endpoint directly: `GET /api/v1/profiles/activation-status`
4. **Update readiness calculator** (Part 4) → verify `profileApprovalStatus` updates correctly after a simulation
5. **Update UI pages** (Part 5) → verify all three pages show the same `activationScore` number
6. **Backfill** (Part 6) → run script, verify no profiles are stuck at 0%

---

## Acceptance Criteria

- [ ] `qualificationCriteria.overallConfidence` is > 0 after one completed simulation with green/red flags extracted
- [ ] `decisionMakingPatterns.overallConfidence` is > 0 after one completed simulation with discovery/closing data extracted
- [ ] Dashboard banner, Simulations page, and AI Training page all show the same activation score
- [ ] Activation score formula: scenarios (40) + competencies (45) + profile (15) = 100 max
- [ ] Go Live unlocks at 90% (`canRequestGoLive: true`)
- [ ] No page performs its own local progress calculation — all read from `/api/v1/profiles/activation-status`
- [ ] Existing profiles recalculated correctly after backfill script
- [ ] AI Training page shows max 2 blocking reasons per gate (not 10 bullets)
- [ ] Dashboard banner CTA links to the correct page based on `blockingStep`

---

## What NOT to Change

- Do not touch `lib/extraction/completion.ts` — Profile Completion % is a separate internal metric used in the Extracted Patterns tab on the Profile page. It is fine as-is and is not shown to users in the main flow.
- Do not touch `playbook.confidenceScore` or `dealBreaker.confidence` per-item logic — these work correctly.
- Do not touch `communicationStyle.confidence` — it starts at 30 and averages correctly.
- Do not change gate or competency validator logic — only the confidence inputs are broken, not the validators themselves.
