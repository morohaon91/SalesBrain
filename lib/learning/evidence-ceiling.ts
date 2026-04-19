/**
 * Evidence-Based Confidence Ceilings
 *
 * The downstream AI agent goes live representing the business owner in real
 * sales conversations. Every pattern it uses should be validated, not guessed.
 *
 * Core rule: one simulation is a hint, not a conclusion. Confidence in a
 * pattern rises with repetition AND across-scenario diversity — the same way
 * any professional behavioral assessment would treat evidence.
 *
 * Two ceilings:
 *   - REPETITION_TIERS: ceiling grows with how many simulations contributed
 *     evidence to this pattern.
 *   - CROSS_SCENARIO_TIERS: for critical competencies (objection handling,
 *     deal breakers, closing strategy), the *diversity* of scenario contexts
 *     matters more than pure repetition. Handling a price objection in the
 *     PRICE_OBJECTION scenario AND again in a HOT_LEAD conversation is a
 *     stronger signal than running PRICE_OBJECTION twice.
 *
 * The effective ceiling on any confidence number is the minimum of the
 * applicable tiers. Raw AI-reported confidence is never trusted above this.
 *
 * Tier values are chosen so a user running all 8 mandatory scenarios in
 * order reaches ~90% activation around simulation 6-7 — leaving the last
 * 1-2 simulations as meaningful refinement, not gamified padding.
 */

export interface EvidenceTier {
  minCount: number;
  ceiling: number;
}

export const REPETITION_TIERS: EvidenceTier[] = [
  { minCount: 0, ceiling: 0 },
  { minCount: 1, ceiling: 50 }, // one data point — hint only
  { minCount: 2, ceiling: 70 }, // emerging pattern
  { minCount: 3, ceiling: 82 }, // validated pattern
  { minCount: 4, ceiling: 90 }, // reliable — go-live threshold reachable
  { minCount: 6, ceiling: 100 }, // fingerprint
];

export const CROSS_SCENARIO_TIERS: EvidenceTier[] = [
  { minCount: 0, ceiling: 0 },
  { minCount: 1, ceiling: 55 }, // demonstrated once, single context
  { minCount: 2, ceiling: 78 }, // two contexts — real pattern
  { minCount: 3, ceiling: 92 }, // three contexts — trustworthy
  { minCount: 4, ceiling: 100 },
];

function tierCeiling(tiers: EvidenceTier[], count: number): number {
  let ceiling = 0;
  for (const t of tiers) if (count >= t.minCount) ceiling = t.ceiling;
  return ceiling;
}

/** Ceiling on a pattern's confidence given N simulations with evidence. */
export function confidenceCeiling(simCount: number): number {
  return tierCeiling(REPETITION_TIERS, simCount);
}

/** Ceiling for critical competencies given N distinct scenario contexts. */
export function crossScenarioCeiling(distinctScenarios: number): number {
  return tierCeiling(CROSS_SCENARIO_TIERS, distinctScenarios);
}

/** Clamp a raw confidence to what the evidence base supports. */
export function clampConfidence(value: number, simCount: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.min(Math.max(0, safe), confidenceCeiling(simCount));
}

/**
 * Section ceiling (as a percentage 0–1) for the completion formula.
 * Extraction-derived sections cannot be fully earned from a handful of
 * simulations, regardless of how rich the JSON looks — the score must
 * reflect the breadth of evidence, not the best-case shape.
 *
 * Questionnaire-driven sections are NOT subject to this ceiling because
 * the user controls them directly at onboarding.
 */
export function sectionCeilingPct(simCount: number): number {
  if (simCount <= 0) return 0.30;
  if (simCount === 1) return 0.50;
  if (simCount === 2) return 0.65;
  if (simCount === 3) return 0.78;
  if (simCount === 4) return 0.88;
  if (simCount === 5) return 0.95;
  return 1.0;
}

/**
 * Competency gate thresholds.
 *
 * - ACHIEVED always requires ≥2 simulations. A single sim cannot unlock a
 *   competency, period.
 * - MASTERED requires ≥4 sims for ordinary competencies.
 * - Critical competencies additionally require cross-scenario evidence.
 *   This is checked against the tracked scenariosEncountered /
 *   scenariosDemonstrated arrays on the pattern itself.
 */
export const COMPETENCY_GATES = {
  achievedMinSims: 2,
  masteredMinSims: 4,
  criticalAchievedMinDistinctScenarios: 2,
  criticalMasteredMinDistinctScenarios: 3,
} as const;
