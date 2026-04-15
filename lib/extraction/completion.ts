/**
 * Depth-Based Profile Completion Calculator — new-schema edition.
 *
 * Weights:
 * - Questionnaire:          20%
 * - Communication Style:    15%
 * - Pricing Logic:          15%
 * - Qualification Criteria: 15%
 * - Objection Handling:     15%
 * - Decision Making:        10%
 * - Business Facts:         10%
 */

export interface CompletionBreakdown {
  questionnaire: number;
  communicationStyle: number;
  pricingLogic: number;
  qualificationCriteria: number;
  objectionHandling: number;
  decisionMaking: number;
  businessFacts: number;
  total: number;
}

function hasMinItems(arr: unknown, min: number): boolean {
  return Array.isArray(arr) && arr.filter(Boolean).length >= min;
}

function hasValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'number') return val > 0;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

export function calculateProfileCompletion(profile: Record<string, any>): CompletionBreakdown {
  // ── Questionnaire (20%) ──────────────────────────────────────────────────
  let questionnaire = 0;
  if (hasValue(profile.industry)) questionnaire += 4;
  if (hasValue(profile.serviceDescription)) questionnaire += 4;
  if (hasValue(profile.targetClientType)) questionnaire += 3;
  if (hasValue(profile.typicalBudgetRange)) questionnaire += 3;
  if (hasMinItems(profile.commonClientQuestions, 1)) questionnaire += 3;
  if (hasValue(profile.serviceArea)) questionnaire += 2;
  if (hasValue(profile.teamSize)) questionnaire += 1;
  questionnaire = Math.min(questionnaire, 20);

  // ── Communication Style (15%) ────────────────────────────────────────────
  const cs = profile.communicationStyle;
  let communicationStyle = 0;
  if (cs) {
    if (hasValue(cs.tone)) communicationStyle += 3;
    if (hasMinItems(cs.commonPhrases, 3)) communicationStyle += 4;
    if ((cs.evidenceCount ?? 0) >= 3) communicationStyle += 4;
    if (hasMinItems(cs.humorExamples, 1) || hasMinItems(cs.empathyExamples, 1)) communicationStyle += 4;
  }
  communicationStyle = Math.min(communicationStyle, 15);

  // ── Pricing Logic (15%) ──────────────────────────────────────────────────
  const pl = profile.pricingLogic;
  let pricingLogic = 0;
  if (pl) {
    if (hasValue(pl.minimumBudget) || hasValue(pl.preferredBudgetRange)) pricingLogic += 5;
    if (hasValue(pl.priceDefenseStrategy)) pricingLogic += 5;
    if (hasMinItems(pl.flexibleOn, 1) || hasMinItems(pl.notFlexibleOn, 1)) pricingLogic += 5;
  }
  pricingLogic = Math.min(pricingLogic, 15);

  // ── Qualification Criteria (15%) ─────────────────────────────────────────
  const qc = profile.qualificationCriteria;
  let qualificationCriteria = 0;
  if (qc) {
    if (hasMinItems(qc.greenFlags, 2)) qualificationCriteria += 5;
    if (hasMinItems(qc.redFlags, 1)) qualificationCriteria += 5;
    if (hasMinItems(qc.dealBreakers, 1)) qualificationCriteria += 5;
  }
  qualificationCriteria = Math.min(qualificationCriteria, 15);

  // ── Objection Handling (15%) ─────────────────────────────────────────────
  const oh = profile.objectionHandling;
  let objectionHandling = 0;
  if (oh) {
    const playbookCount = Array.isArray(oh.playbooks) ? oh.playbooks.length : 0;
    objectionHandling += Math.min(15, playbookCount * 5);
  }
  objectionHandling = Math.min(objectionHandling, 15);

  // ── Decision Making (10%) ────────────────────────────────────────────────
  const dm = profile.decisionMakingPatterns;
  let decisionMaking = 0;
  if (dm) {
    if (hasMinItems(dm.discovery?.firstQuestions, 3)) decisionMaking += 3;
    if (hasValue(dm.valuePositioning?.primaryValueLens)) decisionMaking += 3;
    if (hasValue(dm.closing?.preferredNextStep)) decisionMaking += 4;
  }
  decisionMaking = Math.min(decisionMaking, 10);

  // ── Business Facts (10%) ─────────────────────────────────────────────────
  let businessFacts = 0;
  if (hasValue(profile.yearsExperience)) businessFacts += 3;
  if (hasMinItems(profile.serviceOfferings, 1)) businessFacts += 4;
  if (hasMinItems(profile.certifications, 1)) businessFacts += 3;
  businessFacts = Math.min(businessFacts, 10);

  const total =
    questionnaire +
    communicationStyle +
    pricingLogic +
    qualificationCriteria +
    objectionHandling +
    decisionMaking +
    businessFacts;

  return {
    questionnaire,
    communicationStyle,
    pricingLogic,
    qualificationCriteria,
    objectionHandling,
    decisionMaking,
    businessFacts,
    total: Math.min(total, 100),
  };
}
