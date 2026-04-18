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
 */

export interface CompletionBreakdown {
  questionnaire: number;
  communicationStyle: number;
  pricingLogic: number;
  qualificationCriteria: number;
  objectionHandling: number;
  decisionMaking: number;
  total: number;
}

export function calculateProfileCompletion(profile: Record<string, any>): CompletionBreakdown {
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
  communicationStyle = Math.min(communicationStyle, 20);

  const oh = profile.objectionHandling;
  const playbookCount = oh?.playbooks?.length || 0;
  let objectionHandling = Math.min(20, playbookCount * 5);
  if (oh?.playbooks?.some((p: any) => p.objectionType === 'price' && p.confidenceScore >= 60)) {
    objectionHandling = Math.min(20, objectionHandling + 2);
  }

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
  decisionMaking = Math.min(decisionMaking, 20);

  const qc = profile.qualificationCriteria;
  let qualificationCriteria = 0;
  if (qc) {
    if ((qc.greenFlags?.length || 0) >= 2) qualificationCriteria += 5;
    const hasNegative = (qc.redFlags?.length || 0) >= 1 || (qc.dealBreakers?.length || 0) >= 1;
    if (hasNegative) qualificationCriteria += 5;
    if ((qc.dealBreakers?.length || 0) >= 1) qualificationCriteria += 5;
    if (!hasNegative) qualificationCriteria = Math.min(qualificationCriteria, 8);
  }
  qualificationCriteria = Math.min(qualificationCriteria, 15);

  const pl = profile.pricingLogic;
  let pricingLogic = 0;
  if (pl) {
    if (pl.minimumBudget || pl.preferredBudgetRange) pricingLogic += 6;
    if (pl.priceDefenseStrategy) pricingLogic += 6;
    if ((pl.flexibleOn?.length || 0) >= 1 || (pl.notFlexibleOn?.length || 0) >= 1) pricingLogic += 3;
  }
  pricingLogic = Math.min(pricingLogic, 15);

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
