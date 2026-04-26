/**
 * Universal Mandatory Scenarios
 *
 * These 8 scenarios are REQUIRED for Go Live.
 * Each works across all 10 business verticals.
 * Personas are generated dynamically based on tenant's industry.
 */

export type ScenarioType =
  | 'HOT_LEAD'
  | 'PRICE_OBJECTION'
  | 'WRONG_FIT'
  | 'SKEPTICAL_LEAD'
  | 'COMPETITOR_COMPARISON'
  | 'BUSY_NOT_READY'
  | 'CONFUSED_LEAD'
  | 'TECHNICAL_ADAPTATION';

export interface UniversalScenario {
  id: string;
  scenarioType: ScenarioType;
  name: string;
  description: string;
  purpose: string;

  primaryGoal: string;
  secondaryGoals: string[];
  expectedPatterns: string[];

  personaRules: {
    urgency: 'low' | 'medium' | 'high';
    budgetStatus: 'none' | 'tight' | 'moderate' | 'approved' | 'flexible';
    painSeverity: 'minor' | 'moderate' | 'critical';
    decisionMaker: boolean;
    timeframe: 'immediate' | 'weeks' | 'months' | 'exploring';
    priorExperience: 'none' | 'bad' | 'good' | 'mixed';
    technicalSavvy: 'low' | 'medium' | 'high';
  };

  expectedObjections: string[];

  successCriteria: string[];
  failureConditions: string[];

  isMandatory: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  orderIndex: number;
}

export const MANDATORY_SCENARIOS: UniversalScenario[] = [
  {
    id: 'hot_lead_universal',
    scenarioType: 'HOT_LEAD',
    name: 'Hot Lead - Ready to Buy',
    description: 'Prospect with clear pain, approved budget, and high urgency. Ready to move fast.',
    purpose: 'Learn how owner closes momentum without over-explaining or creating friction.',
    primaryGoal: 'Extract closing strategy when momentum already exists',
    secondaryGoals: [
      'Identify transition from discovery to proposal',
      'Learn meeting/next-step language',
      'Understand urgency handling without pushiness',
      'Capture when owner stops selling and starts scheduling',
    ],
    expectedPatterns: ['closing_pattern', 'value_positioning', 'discovery_flow', 'linguistic_fingerprint'],
    personaRules: {
      urgency: 'high',
      budgetStatus: 'approved',
      painSeverity: 'critical',
      decisionMaker: true,
      timeframe: 'immediate',
      priorExperience: 'none',
      technicalSavvy: 'medium',
    },
    expectedObjections: [],
    successCriteria: [
      'Owner asks for next step within 8 messages',
      'Clear meeting/call scheduled',
      'Owner maintains professional confidence',
      'No over-explaining after lead commits',
    ],
    failureConditions: [
      'Owner over-explains after lead is sold',
      'Fails to ask for next step',
      'Introduces unnecessary complexity',
      'Appears desperate or overly aggressive',
    ],
    isMandatory: true,
    difficulty: 'beginner',
    estimatedDuration: 15,
    orderIndex: 1,
  },
  {
    id: 'price_objection_universal',
    scenarioType: 'PRICE_OBJECTION',
    name: 'Price Objection - Value Defense',
    description: 'Interested prospect pushes back on pricing. Tests value defense and walk-away threshold.',
    purpose: 'Learn how owner defends pricing, reframes value, and handles budget constraints.',
    primaryGoal: 'Extract price objection handling strategy and minimum acceptable budget',
    secondaryGoals: [
      'Identify value anchoring techniques',
      'Understand when owner walks away vs. adapts',
      'Learn pricing defense language',
      'Capture confidence level in pricing justification',
    ],
    expectedPatterns: ['objection_handling', 'value_positioning', 'deal_breakers', 'walk_away_strategy'],
    personaRules: {
      urgency: 'medium',
      budgetStatus: 'tight',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'weeks',
      priorExperience: 'mixed',
      technicalSavvy: 'medium',
    },
    expectedObjections: ['price_too_high', 'competitor_cheaper', 'unclear_value_difference'],
    successCriteria: [
      'Owner defends value without immediate discount',
      'Owner reframes price as investment',
      'Clear walk-away threshold demonstrated',
      'Professional handling even if disqualifying',
    ],
    failureConditions: [
      'Immediately discounts without defending value',
      'Becomes defensive or argumentative',
      'Fails to reframe price objection',
      'Continues pursuit after clear deal-breaker',
    ],
    isMandatory: true,
    difficulty: 'intermediate',
    estimatedDuration: 20,
    orderIndex: 2,
  },
  {
    id: 'wrong_fit_universal',
    scenarioType: 'WRONG_FIT',
    name: 'Wrong Fit - Disqualification',
    description: 'Prospect with legitimate need but fundamental mismatch (budget/scope/expectations).',
    purpose: "Learn owner's disqualification criteria and polite exit strategy.",
    primaryGoal: 'Extract deal-breakers and professional exit language',
    secondaryGoals: [
      'Identify minimum viable budget threshold',
      'Learn how owner says "no" professionally',
      'Understand if owner offers alternatives/referrals',
      'Capture tone when disengaging',
    ],
    expectedPatterns: ['deal_breakers', 'walk_away_strategy', 'qualification_criteria', 'red_flags'],
    personaRules: {
      urgency: 'low',
      budgetStatus: 'none',
      painSeverity: 'minor',
      decisionMaker: true,
      timeframe: 'exploring',
      priorExperience: 'none',
      technicalSavvy: 'low',
    },
    expectedObjections: [],
    successCriteria: [
      'Owner recognizes mismatch clearly',
      'Professional disengagement language',
      'Clear but kind "no"',
      'Optionally offers referral or alternative',
    ],
    failureConditions: [
      'Continues pursuit after clear mismatch',
      'Rude or dismissive tone',
      'Fails to clearly disengage',
      'Offers unrealistic discount to close anyway',
    ],
    isMandatory: true,
    difficulty: 'intermediate',
    estimatedDuration: 15,
    orderIndex: 3,
  },
  {
    id: 'skeptical_lead_universal',
    scenarioType: 'SKEPTICAL_LEAD',
    name: 'Skeptical Lead - Trust Building',
    description: 'Prospect burned by previous providers. Needs credibility and trust-building.',
    purpose: 'Learn how owner builds trust and addresses past negative experiences.',
    primaryGoal: 'Extract trust-building language and credibility signals',
    secondaryGoals: [
      'Learn how owner addresses past bad experiences',
      'Identify social proof usage',
      'Understand risk-reversal techniques',
      'Capture empathy vs. selling balance',
    ],
    expectedPatterns: ['objection_handling', 'communication_style', 'pain_exploration', 'value_positioning'],
    personaRules: {
      urgency: 'medium',
      budgetStatus: 'moderate',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'weeks',
      priorExperience: 'bad',
      technicalSavvy: 'medium',
    },
    expectedObjections: ['how_different_from_others', 'proof_of_reliability', 'what_if_you_fail'],
    successCriteria: [
      'Owner acknowledges prospect concerns',
      'Trust-building approach clear',
      'Suggests low-risk next step',
      'Empathy without over-promising',
    ],
    failureConditions: [
      'Defensive about competitors',
      'Over-promises to close',
      'Fails to acknowledge concerns',
      'Rushes to close before building trust',
    ],
    isMandatory: true,
    difficulty: 'intermediate',
    estimatedDuration: 20,
    orderIndex: 4,
  },
  {
    id: 'competitor_comparison_universal',
    scenarioType: 'COMPETITOR_COMPARISON',
    name: 'Competitor Comparison - Differentiation',
    description: 'Prospect actively comparing providers. Tests positioning without badmouthing.',
    purpose: 'Learn how owner differentiates without attacking competitors.',
    primaryGoal: 'Extract differentiation strategy and unique value proposition',
    secondaryGoals: [
      'Learn how owner handles direct competitor mentions',
      'Identify unique value angles',
      'Understand confidence without arrogance',
      'Capture comparison framing technique',
    ],
    expectedPatterns: ['objection_handling', 'value_positioning', 'communication_style', 'closing_pattern'],
    personaRules: {
      urgency: 'high',
      budgetStatus: 'approved',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'immediate',
      priorExperience: 'mixed',
      technicalSavvy: 'high',
    },
    expectedObjections: ['competitor_cheaper', 'all_providers_similar', 'justify_higher_price'],
    successCriteria: [
      'Clear differentiation without badmouthing',
      'Unique value proposition stated',
      'Confident but not arrogant',
      'Advances to proposal/meeting stage',
    ],
    failureConditions: [
      'Badmouths competitors',
      'Appears insecure or defensive',
      'Fails to differentiate clearly',
      'Competes only on price',
    ],
    isMandatory: true,
    difficulty: 'advanced',
    estimatedDuration: 25,
    orderIndex: 5,
  },
  {
    id: 'busy_not_ready_universal',
    scenarioType: 'BUSY_NOT_READY',
    name: 'Busy / Not Ready Yet',
    description: 'Prospect interested but timing is wrong. Tests patience and long-term nurturing.',
    purpose: 'Learn how owner handles "not now" without losing future opportunity.',
    primaryGoal: 'Extract non-pushy persistence and future follow-up approach',
    secondaryGoals: [
      'Learn how owner keeps door open',
      'Identify follow-up commitment language',
      'Understand patience vs. giving up',
      'Capture long-term relationship building',
    ],
    expectedPatterns: ['communication_style', 'closing_pattern', 'qualification_criteria', 'adaptation_triggers'],
    personaRules: {
      urgency: 'low',
      budgetStatus: 'moderate',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'months',
      priorExperience: 'none',
      technicalSavvy: 'medium',
    },
    expectedObjections: ['not_right_now', 'too_busy', 'other_priorities'],
    successCriteria: [
      'Owner respects timing',
      'Sets up appropriate follow-up',
      'Maintains relationship without pressure',
      'Gets future commitment or permission to follow up',
    ],
    failureConditions: [
      'Pushy or aggressive',
      'Gives up immediately',
      'Fails to get future commitment',
      "Doesn't respect prospect timing",
    ],
    isMandatory: true,
    difficulty: 'intermediate',
    estimatedDuration: 15,
    orderIndex: 6,
  },
  {
    id: 'confused_lead_universal',
    scenarioType: 'CONFUSED_LEAD',
    name: 'Confused Lead - Needs Guidance',
    description: "Prospect can't articulate needs clearly. Tests diagnostic and clarification skills.",
    purpose: 'Learn how owner leads conversation and simplifies complex situations.',
    primaryGoal: 'Extract clarifying question framework and leadership ability',
    secondaryGoals: [
      'Learn how owner simplifies technical concepts',
      'Identify diagnostic questioning approach',
      'Understand patience in discovery',
      'Capture educational selling style',
    ],
    expectedPatterns: ['discovery_pattern', 'pain_exploration', 'communication_style', 'adaptation_triggers'],
    personaRules: {
      urgency: 'medium',
      budgetStatus: 'moderate',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'weeks',
      priorExperience: 'none',
      technicalSavvy: 'low',
    },
    expectedObjections: [],
    successCriteria: [
      'Owner asks clarifying questions',
      'Diagnoses real need effectively',
      'Simplifies without being condescending',
      'Proposes clear path forward',
    ],
    failureConditions: [
      'Frustrated with confusion',
      'Uses jargon despite confusion signals',
      'Fails to take control of conversation',
      'Gives up on clarification too early',
    ],
    isMandatory: true,
    difficulty: 'advanced',
    estimatedDuration: 20,
    orderIndex: 7,
  },
  {
    id: 'technical_adaptation_universal',
    scenarioType: 'TECHNICAL_ADAPTATION',
    name: 'Technical Adaptation - Audience Awareness',
    description: 'Same need presented by technical vs. non-technical buyer. Tests adaptation.',
    purpose: 'Learn how owner adjusts depth and language based on audience.',
    primaryGoal: 'Extract adaptation patterns based on buyer technical level',
    secondaryGoals: [
      'Identify technical vs. business value framing',
      'Learn simplification strategies',
      'Understand when owner goes deep vs. stays high-level',
      'Capture audience awareness signals',
    ],
    expectedPatterns: ['adaptation_triggers', 'value_positioning', 'communication_style', 'discovery_pattern'],
    personaRules: {
      urgency: 'high',
      budgetStatus: 'approved',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'immediate',
      priorExperience: 'good',
      technicalSavvy: 'high',
    },
    expectedObjections: [],
    successCriteria: [
      'Owner adapts language based on technical cues',
      'Appropriate depth for audience',
      'Value framing matches buyer priorities',
      'Natural adjustment without asking about technical level',
    ],
    failureConditions: [
      'Same approach for all audiences',
      'Too technical with non-technical buyer',
      'Too simple with technical buyer',
      'Fails to recognize audience cues',
    ],
    isMandatory: true,
    difficulty: 'advanced',
    estimatedDuration: 30,
    orderIndex: 8,
  },
];

export const INDUSTRY_LIST = [
  'Legal Services',
  'Construction & Contracting',
  'Real Estate Services',
  'Financial Advisory',
  'Business Consulting',
  'Marketing & Creative Agencies',
  'Home Services',
  'Health & Wellness Coaching',
  'IT & Technology Services',
  'Interior Design',
];

export function getMandatoryScenarios(): UniversalScenario[] {
  return MANDATORY_SCENARIOS;
}

export function getScenarioById(id: string): UniversalScenario | undefined {
  return MANDATORY_SCENARIOS.find((s) => s.id === id);
}

export function getScenarioByType(type: ScenarioType): UniversalScenario | undefined {
  return MANDATORY_SCENARIOS.find((s) => s.scenarioType === type);
}

/** Match by scenario id ('hot_lead_universal') OR legacy scenarioType ('HOT_LEAD'). */
function scenarioMatches(s: UniversalScenario, id: string): boolean {
  return s.id === id || s.scenarioType === id;
}

export function getUncompletedScenarios(completedScenarioIds: string[]): UniversalScenario[] {
  return MANDATORY_SCENARIOS.filter((s) => !completedScenarioIds.some((id) => scenarioMatches(s, id)));
}

export function getNextRecommendedScenario(completedScenarioIds: string[]): UniversalScenario | null {
  const uncompleted = getUncompletedScenarios(completedScenarioIds);
  if (uncompleted.length === 0) return null;
  return uncompleted.sort((a, b) => a.orderIndex - b.orderIndex)[0];
}

export function allMandatoryScenariosCompleted(completedScenarioIds: string[]): boolean {
  return MANDATORY_SCENARIOS.every((s) => completedScenarioIds.some((id) => scenarioMatches(s, id)));
}
