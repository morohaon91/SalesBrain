/**
 * Depth-Based Profile Completion Calculator
 *
 * Weights:
 * - Communication Style:    20pts
 * - Objection Handling:     20pts
 * - Decision Making:        20pts
 * - Qualification Criteria: 15pts
 * - Pricing Logic:          15pts
 * - Questionnaire:          10pts  (includes former Business Facts)
 * ─────────────────────────────────
 * Total:                   100pts
 *
 * Evidence-based ceilings: extraction-derived sections are capped by the
 * number of completed simulations. No matter how rich the JSON looks from
 * a single conversation, we won't attribute full credit to one data point.
 * See lib/learning/evidence-ceiling.ts for the rationale and tier values.
 *
 * Questionnaire is NOT capped — the user controls it directly at onboarding.
 */

import { sectionCeilingPct } from '@/lib/learning/evidence-ceiling';

export interface CompletionBreakdown {
  questionnaire: number;
  communicationStyle: number;
  pricingLogic: number;
  qualificationCriteria: number;
  objectionHandling: number;
  decisionMaking: number;
  total: number;
}

function getSimCount(profile: Record<string, any>): number {
  if (Array.isArray(profile.completedScenarios)) return profile.completedScenarios.length;
  if (typeof profile.simulationCount === 'number') return profile.simulationCount;
  return 0;
}

function capSection(raw: number, max: number, simCount: number): number {
  const ceiling = Math.floor(max * sectionCeilingPct(simCount));
  return Math.min(raw, ceiling, max);
}

export function calculateProfileCompletion(profile: Record<string, any>): CompletionBreakdown {
  const simCount = getSimCount(profile);

  const cs = profile.communicationStyle;
  let communicationStyle = 0;
  if (cs) {
    if (cs.tone) communicationStyle += 4;
    if ((cs.commonPhrases?.length || 0) >= 3) communicationStyle += 4;
    if ((cs.commonPhrases?.length || 0) >= 8) communicationStyle += 2;
    if (cs.energyLevel) communicationStyle += 2;
    if ((cs.humorExamples?.length || 0) >= 1 || (cs.empathyExamples?.length || 0) >= 1) communicationStyle += 4;
    if ((cs.evidenceCount || 0) >= 1) communicationStyle += 2;
    if ((cs.evidenceCount || 0) >= 3) communicationStyle += 2;
  }
  communicationStyle = capSection(communicationStyle, 20, simCount);

  const oh = profile.objectionHandling;
  const playbookCount = oh?.playbooks?.length || 0;
  let objectionHandling = Math.min(20, playbookCount * 5);
  if (oh?.playbooks?.some((p: any) => p.objectionType === 'price' && p.confidenceScore >= 60)) {
    objectionHandling = Math.min(20, objectionHandling + 2);
  }
  objectionHandling = capSection(objectionHandling, 20, simCount);

  const dm = profile.decisionMakingPatterns;
  let decisionMaking = 0;
  if (dm) {
    const vp = typeof dm.valuePositioning === 'string'
      ? { primaryValueLens: dm.valuePositioning, proofSignalsUsed: [] }
      : (dm.valuePositioning ?? {});
    if ((dm.discovery?.firstQuestions?.length || 0) >= 1) decisionMaking += 4;
    if ((dm.discovery?.firstQuestions?.length || 0) >= 3) decisionMaking += 2;
    if (dm.discovery?.moveToValueTrigger) decisionMaking += 3;
    if (vp.primaryValueLens) decisionMaking += 4;
    if ((vp.proofSignalsUsed?.length || 0) >= 1) decisionMaking += 3;
    if (dm.closing?.preferredNextStep) decisionMaking += 4;
  }
  decisionMaking = capSection(decisionMaking, 20, simCount);

  const qc = profile.qualificationCriteria;
  let qualificationCriteria = 0;
  if (qc) {
    if ((qc.greenFlags?.length || 0) >= 2) qualificationCriteria += 5;
    const hasNegative = (qc.redFlags?.length || 0) >= 1 || (qc.dealBreakers?.length || 0) >= 1;
    if (hasNegative) qualificationCriteria += 5;
    if ((qc.dealBreakers?.length || 0) >= 1) qualificationCriteria += 5;
    if (!hasNegative) qualificationCriteria = Math.min(qualificationCriteria, 8);
  }
  qualificationCriteria = capSection(qualificationCriteria, 15, simCount);

  const pl = profile.pricingLogic;
  let pricingLogic = 0;
  if (pl) {
    if (pl.minimumBudget || pl.preferredBudgetRange) pricingLogic += 6;
    if (pl.priceDefenseStrategy) pricingLogic += 6;
    if ((pl.flexibleOn?.length || 0) >= 1 || (pl.notFlexibleOn?.length || 0) >= 1) pricingLogic += 3;
  }
  pricingLogic = capSection(pricingLogic, 15, simCount);

  // Questionnaire: user-controlled, not subject to simulation ceiling.
  let questionnaire = 0;
  if (profile.industry) questionnaire += 2;
  if ((profile.serviceDescription?.length || 0) > 20) questionnaire += 2;
  if (profile.targetClientType) questionnaire += 1;
  if (profile.typicalBudgetRange) questionnaire += 1;
  if ((profile.commonClientQuestions?.length || 0) >= 1) questionnaire += 1;
  if (profile.serviceArea) questionnaire += 1;
  if (profile.yearsInBusiness || profile.yearsExperience) questionnaire += 1;
  if ((profile.certifications?.length || 0) >= 1) questionnaire += 1;
  questionnaire = Math.min(questionnaire, 10);

  const total = Math.min(
    communicationStyle + objectionHandling + decisionMaking + qualificationCriteria + pricingLogic + questionnaire,
    100
  );

  return {
    questionnaire,
    communicationStyle,
    pricingLogic,
    qualificationCriteria,
    objectionHandling,
    decisionMaking,
    total,
  };
}
