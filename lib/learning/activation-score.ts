import { evaluateAllCompetencies } from './competencies';
import { validateAllGates } from './go-live-gates';

export interface ActivationScore {
  total: number;
  canRequestGoLive: boolean;
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
    (c) => c.status === 'ACHIEVED' || c.status === 'MASTERED'
  ).length;
  const competencyPoints = achievedCount * 5;

  // --- Profile Foundation (15pts max) ---
  let profilePoints = 0;

  // Questionnaire (8pts): industry + description + budget range
  const hasIndustry = !!profile.industry;
  const hasDescription = !!(profile.serviceDescription?.length > 20);
  const hasBudget = !!profile.typicalBudgetRange;
  if (hasIndustry) profilePoints += 3;
  if (hasDescription) profilePoints += 3;
  if (hasBudget) profilePoints += 2;

  // Business facts (7pts): years experience + services + certifications/specializations
  const hasYears = !!profile.yearsExperience;
  const hasServices = !!(profile.serviceDescription && profile.targetClientType);
  const hasCerts = (profile.certifications?.length || 0) >= 1;
  if (hasYears) profilePoints += 3;
  if (hasServices) profilePoints += 2;
  if (hasCerts) profilePoints += 2;

  const total = scenarioPoints + competencyPoints + profilePoints;
  const allGatesPassed = validateAllGates(profile).every((g) => g.status === 'PASSED');

  // --- Blocking Step ---
  let blockingStep: ActivationScore['blockingStep'] = 'ready';
  let nextAction = 'Review and activate your AI agent';

  if (profilePoints < 8) {
    blockingStep = 'profile';
    nextAction = 'Complete your business profile';
  } else if (completedCount < 2) {
    // No competency can unlock from a single simulation; need at least 2
    // before checking competency progress.
    blockingStep = 'simulations';
    nextAction = 'Complete more training simulations';
  } else if (achievedCount < 9) {
    blockingStep = 'competencies';
    nextAction = 'Continue simulations to train remaining competencies';
  }

  return {
    total: Math.min(100, total),
    canRequestGoLive: total >= 90 && allGatesPassed,
    breakdown: {
      scenarios: { earned: scenarioPoints, max: 40, completed: completedCount, total: 8 },
      competencies: { earned: competencyPoints, max: 45, achieved: achievedCount, total: 9 },
      profile: { earned: profilePoints, max: 15 },
    },
    blockingStep,
    nextAction,
  };
}
