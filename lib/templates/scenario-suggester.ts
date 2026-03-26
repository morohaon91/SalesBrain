import { BusinessProfile } from '@/lib/types/business-profile';
import { ExtractedPatterns, ObjectionHandling } from '@/lib/types/business-profile';
import { IndustryScenario, ScenarioSuggestion } from '@/lib/types/scenarios';
import { getScenariosForIndustry, getScenarioById } from './industry-scenarios';

interface ProfileGaps {
  communicationStyle: boolean;
  pricingLogic: boolean;
  qualificationCriteria: boolean;
  objectionHandling: boolean;
  decisionMaking: boolean;
  businessFacts: boolean;
  pricingFlexibility: boolean;
  timelineHandling: boolean;
  budgetObjections: boolean;
  competitorHandling: boolean;
  scopeManagement: boolean;
  qualityVsPrice: boolean;
}

export function analyzeProfileGaps(profile: BusinessProfile): ProfileGaps {
  const patterns = profile.communicationStyle
    ? ({
        communicationStyle: profile.communicationStyle,
        pricingLogic: profile.pricingLogic,
        qualificationCriteria: profile.qualificationCriteria,
        objectionHandling: profile.objectionHandling,
        decisionMakingPatterns: profile.decisionMakingPatterns,
      } as Partial<ExtractedPatterns>)
    : null;

  if (!patterns) {
    return {
      communicationStyle: true,
      pricingLogic: true,
      qualificationCriteria: true,
      objectionHandling: true,
      decisionMaking: true,
      businessFacts: true,
      pricingFlexibility: true,
      timelineHandling: true,
      budgetObjections: true,
      competitorHandling: true,
      scopeManagement: true,
      qualityVsPrice: true,
    };
  }

  const oh = patterns.objectionHandling as ObjectionHandling | null;
  const pl = patterns.pricingLogic;

  return {
    communicationStyle: !patterns.communicationStyle,
    pricingLogic: !patterns.pricingLogic,
    qualificationCriteria: !patterns.qualificationCriteria,
    objectionHandling: !patterns.objectionHandling,
    decisionMaking: !patterns.decisionMakingPatterns,
    businessFacts: !profile.yearsExperience && profile.serviceOfferings.length === 0,
    pricingFlexibility: !pl?.flexibilityFactors || pl.flexibilityFactors.length === 0,
    timelineHandling: !oh?.timelineObjection || oh.timelineObjection === 'not_demonstrated',
    budgetObjections: !oh?.priceObjection || oh.priceObjection === 'not_demonstrated',
    competitorHandling: !oh?.competitorObjection || oh.competitorObjection === 'not_demonstrated',
    scopeManagement: !oh?.scopeObjection || oh.scopeObjection === 'not_demonstrated',
    qualityVsPrice: !oh?.qualityObjection || oh.qualityObjection === 'not_demonstrated',
  };
}

export function suggestNextScenario(profile: BusinessProfile): ScenarioSuggestion | null {
  const industry = profile.industry;
  if (!industry) return null;

  const availableScenarios = getScenariosForIndustry(industry);
  if (availableScenarios.length === 0) return null;

  const completedScenarios = profile.completedScenarios || [];
  const remainingScenarios = availableScenarios.filter((s) => !completedScenarios.includes(s.id));

  if (remainingScenarios.length === 0) return null;

  const gaps = analyzeProfileGaps(profile);

  const scoredScenarios = remainingScenarios.map((scenario) => {
    let score = 0;
    const fillsGaps: string[] = [];

    if (scenario.focusAreas.some((a) => a.includes('pricing_logic_flexibility')) && gaps.pricingFlexibility) {
      score += 10; fillsGaps.push('pricing flexibility');
    }
    if (scenario.focusAreas.some((a) => a.includes('objection_handling_timeline')) && gaps.timelineHandling) {
      score += 10; fillsGaps.push('timeline handling');
    }
    if (scenario.focusAreas.some((a) => a.includes('objection_handling_price')) && gaps.budgetObjections) {
      score += 10; fillsGaps.push('budget objections');
    }
    if (scenario.focusAreas.some((a) => a.includes('objection_handling_competitor')) && gaps.competitorHandling) {
      score += 10; fillsGaps.push('competitor comparisons');
    }
    if (scenario.focusAreas.some((a) => a.includes('objection_handling_scope')) && gaps.scopeManagement) {
      score += 10; fillsGaps.push('scope management');
    }
    if (scenario.focusAreas.some((a) => a.includes('objection_handling_quality')) && gaps.qualityVsPrice) {
      score += 10; fillsGaps.push('quality vs price');
    }

    if (gaps.communicationStyle) score += 5;
    if (gaps.pricingLogic) score += 5;
    if (gaps.qualificationCriteria) score += 5;
    if (gaps.objectionHandling) score += 5;
    if (gaps.decisionMaking) score += 5;

    // Bias difficulty based on sim count
    const simCount = profile.simulationCount ?? 0;
    if (simCount === 0 && scenario.difficulty === 'easy') score += 15;
    if (simCount === 1 && scenario.difficulty === 'medium') score += 10;
    if (simCount >= 2 && scenario.difficulty === 'hard') score += 5;

    return { scenario, score, fillsGaps };
  });

  scoredScenarios.sort((a, b) => b.score - a.score);
  const top = scoredScenarios[0];

  let priority: 'high' | 'medium' | 'low' = 'medium';
  let reason = '';

  const simCount = profile.simulationCount ?? 0;
  if (simCount === 0) {
    priority = 'high';
    reason = 'Perfect starting scenario for your industry';
  } else if (top.fillsGaps.length >= 3) {
    priority = 'high';
    reason = `This scenario addresses multiple gaps: ${top.fillsGaps.join(', ')}`;
  } else if (top.fillsGaps.length >= 1) {
    priority = 'medium';
    reason = `This will help demonstrate ${top.fillsGaps.join(', ')}`;
  } else {
    priority = 'low';
    reason = 'Continuing to build your profile depth';
  }

  return { scenario: top.scenario, reason, priority, fillsGaps: top.fillsGaps };
}

export function getAllSuggestions(profile: BusinessProfile): ScenarioSuggestion[] {
  const industry = profile.industry;
  if (!industry) return [];

  const availableScenarios = getScenariosForIndustry(industry);
  const completedScenarios = profile.completedScenarios || [];
  const gaps = analyzeProfileGaps(profile);

  return availableScenarios
    .filter((s) => !completedScenarios.includes(s.id))
    .map((scenario) => {
      const fillsGaps: string[] = [];
      let priority: 'high' | 'medium' | 'low' = 'low';

      if (scenario.focusAreas.some((a) => a.includes('pricing')) && gaps.pricingLogic) {
        fillsGaps.push('pricing patterns');
        priority = 'high';
      }
      if (scenario.focusAreas.some((a) => a.includes('objection')) && gaps.objectionHandling) {
        fillsGaps.push('objection handling');
        if (priority === 'low') priority = 'medium';
      }
      if (scenario.focusAreas.some((a) => a.includes('qualification')) && gaps.qualificationCriteria) {
        fillsGaps.push('qualification criteria');
        if (priority === 'low') priority = 'medium';
      }

      return {
        scenario,
        reason: fillsGaps.length > 0 ? `Addresses: ${fillsGaps.join(', ')}` : 'Builds additional profile depth',
        priority,
        fillsGaps,
      };
    })
    .sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.priority] - order[a.priority];
    });
}

export { getScenarioById };
