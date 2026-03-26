/**
 * Depth-Based Profile Completion Calculator
 *
 * Weights:
 * - Questionnaire complete: 20%
 * - Communication style:    15%
 * - Pricing logic:          15%
 * - Qualification criteria: 15%
 * - Objection handling:     15%
 * - Decision making:        10%
 * - Business facts:         10%
 * Total: 100%
 */

export interface CompletionBreakdown {
  questionnaire: number;      // 0-20
  communicationStyle: number; // 0-15
  pricingLogic: number;       // 0-15
  qualificationCriteria: number; // 0-15
  objectionHandling: number;  // 0-15
  decisionMaking: number;     // 0-10
  businessFacts: number;      // 0-10
  total: number;              // 0-100
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
    if (hasValue(cs.style)) communicationStyle += 3;
    if (hasMinItems(cs.keyPhrases, 3)) communicationStyle += 4;
    if (hasMinItems(profile.ownerVoiceExamples, 3)) communicationStyle += 5;
  }
  communicationStyle = Math.min(communicationStyle, 15);

  // ── Pricing Logic (15%) ──────────────────────────────────────────────────
  const pl = profile.pricingLogic;
  let pricingLogic = 0;
  if (pl) {
    if (hasValue(pl.minBudget) || hasValue(pl.typicalRange)) pricingLogic += 5;
    if (hasMinItems(pl.flexibilityFactors, 1)) pricingLogic += 5;
    if (hasMinItems(pl.dealBreakers, 1)) pricingLogic += 5;
  }
  pricingLogic = Math.min(pricingLogic, 15);

  // ── Qualification Criteria (15%) ─────────────────────────────────────────
  const qc = profile.qualificationCriteria;
  let qualificationCriteria = 0;
  if (qc) {
    if (hasMinItems(qc.mustHaves, 2)) qualificationCriteria += 5;
    if (hasMinItems(qc.greenFlags, 2)) qualificationCriteria += 5;
    if (hasMinItems(qc.dealBreakers, 2)) qualificationCriteria += 5;
  }
  qualificationCriteria = Math.min(qualificationCriteria, 15);

  // ── Objection Handling (15%) ─────────────────────────────────────────────
  const oh = profile.objectionHandling;
  let objectionHandling = 0;
  if (oh) {
    if (hasValue(oh.priceObjection) && oh.priceObjection !== 'not_demonstrated') objectionHandling += 4;
    if (hasValue(oh.timelineObjection) && oh.timelineObjection !== 'not_demonstrated') objectionHandling += 4;
    if (hasValue(oh.qualityObjection) && oh.qualityObjection !== 'not_demonstrated') objectionHandling += 4;
    if (hasValue(oh.scopeObjection) && oh.scopeObjection !== 'not_demonstrated') objectionHandling += 3;
  }
  objectionHandling = Math.min(objectionHandling, 15);

  // ── Decision Making (10%) ────────────────────────────────────────────────
  const dm = profile.decisionMakingPatterns;
  let decisionMaking = 0;
  if (dm) {
    if (hasMinItems(dm.whenToSayYes, 1)) decisionMaking += 5;
    if (hasMinItems(dm.warningSignsToWatch, 1)) decisionMaking += 5;
  }
  decisionMaking = Math.min(decisionMaking, 10);

  // ── Business Facts (10%) ─────────────────────────────────────────────────
  let businessFacts = 0;
  if (hasValue(profile.yearsExperience)) businessFacts += 3;
  if (hasMinItems(profile.serviceOfferings, 1) || hasMinItems(profile.certifications, 1)) businessFacts += 4;
  if (hasMinItems(profile.certifications, 1)) businessFacts += 3;
  businessFacts = Math.min(businessFacts, 10);

  const total = questionnaire + communicationStyle + pricingLogic + qualificationCriteria + objectionHandling + decisionMaking + businessFacts;

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
