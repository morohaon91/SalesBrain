# ARTIFACT 1: Universal Scenario System
## Complete Replacement for industry-scenarios.ts

---

## Overview

**What this does:**
- Replaces your current per-industry scenario system
- Defines 8 mandatory scenarios that work across ALL 10 verticals
- Generates industry-specific personas dynamically at runtime
- Cleaner, simpler, more scalable

**What you get:**
- One scenario template = works for Legal, Construction, IT, etc.
- No duplicate scenario definitions
- Industry context injected at runtime based on `BusinessProfile.industry`

---

## File: `lib/scenarios/mandatory-scenarios.ts`

```typescript
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
  
  // Learning Goals
  primaryGoal: string;
  secondaryGoals: string[];
  expectedPatterns: string[];
  
  // Persona Generation Rules
  personaRules: {
    urgency: 'low' | 'medium' | 'high';
    budgetStatus: 'none' | 'tight' | 'moderate' | 'approved' | 'flexible';
    painSeverity: 'minor' | 'moderate' | 'critical';
    decisionMaker: boolean;
    timeframe: 'immediate' | 'weeks' | 'months' | 'exploring';
    priorExperience: 'none' | 'bad' | 'good' | 'mixed';
    technicalSavvy: 'low' | 'medium' | 'high';
  };
  
  // Objections This Scenario Should Raise
  expectedObjections: string[];
  
  // Success Criteria
  successCriteria: string[];
  failureConditions: string[];
  
  // Metadata
  isMandatory: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  orderIndex: number;
}

/**
 * The 8 Mandatory Scenarios
 */
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
      'Capture when owner stops selling and starts scheduling'
    ],
    expectedPatterns: [
      'closing_pattern',
      'value_positioning',
      'discovery_flow',
      'linguistic_fingerprint'
    ],
    
    personaRules: {
      urgency: 'high',
      budgetStatus: 'approved',
      painSeverity: 'critical',
      decisionMaker: true,
      timeframe: 'immediate',
      priorExperience: 'none',
      technicalSavvy: 'medium'
    },
    
    expectedObjections: [], // Hot leads have minimal objections
    
    successCriteria: [
      'Owner asks for next step within 8 messages',
      'Clear meeting/call scheduled',
      'Owner maintains professional confidence',
      'No over-explaining after lead commits'
    ],
    failureConditions: [
      'Owner over-explains after lead is sold',
      'Fails to ask for next step',
      'Introduces unnecessary complexity',
      'Appears desperate or overly aggressive'
    ],
    
    isMandatory: true,
    difficulty: 'beginner',
    estimatedDuration: 15,
    orderIndex: 1
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
      'Capture confidence level in pricing justification'
    ],
    expectedPatterns: [
      'objection_handling',
      'value_positioning',
      'deal_breakers',
      'walk_away_strategy'
    ],
    
    personaRules: {
      urgency: 'medium',
      budgetStatus: 'tight',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'weeks',
      priorExperience: 'mixed',
      technicalSavvy: 'medium'
    },
    
    expectedObjections: [
      'price_too_high',
      'competitor_cheaper',
      'unclear_value_difference'
    ],
    
    successCriteria: [
      'Owner defends value without immediate discount',
      'Owner reframes price as investment',
      'Clear walk-away threshold demonstrated',
      'Professional handling even if disqualifying'
    ],
    failureConditions: [
      'Immediately discounts without defending value',
      'Becomes defensive or argumentative',
      'Fails to reframe price objection',
      'Continues pursuit after clear deal-breaker'
    ],
    
    isMandatory: true,
    difficulty: 'intermediate',
    estimatedDuration: 20,
    orderIndex: 2
  },
  
  {
    id: 'wrong_fit_universal',
    scenarioType: 'WRONG_FIT',
    name: 'Wrong Fit - Disqualification',
    description: 'Prospect with legitimate need but fundamental mismatch (budget/scope/expectations).',
    purpose: 'Learn owner\'s disqualification criteria and polite exit strategy.',
    
    primaryGoal: 'Extract deal-breakers and professional exit language',
    secondaryGoals: [
      'Identify minimum viable budget threshold',
      'Learn how owner says "no" professionally',
      'Understand if owner offers alternatives/referrals',
      'Capture tone when disengaging'
    ],
    expectedPatterns: [
      'deal_breakers',
      'walk_away_strategy',
      'qualification_criteria',
      'red_flags'
    ],
    
    personaRules: {
      urgency: 'low',
      budgetStatus: 'none', // Budget far below minimum
      painSeverity: 'minor',
      decisionMaker: true,
      timeframe: 'exploring',
      priorExperience: 'none',
      technicalSavvy: 'low'
    },
    
    expectedObjections: [],
    
    successCriteria: [
      'Owner recognizes mismatch clearly',
      'Professional disengagement language',
      'Clear but kind "no"',
      'Optionally offers referral or alternative'
    ],
    failureConditions: [
      'Continues pursuit after clear mismatch',
      'Rude or dismissive tone',
      'Fails to clearly disengage',
      'Offers unrealistic discount to close anyway'
    ],
    
    isMandatory: true,
    difficulty: 'intermediate',
    estimatedDuration: 15,
    orderIndex: 3
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
      'Capture empathy vs. selling balance'
    ],
    expectedPatterns: [
      'objection_handling',
      'communication_style',
      'pain_exploration',
      'value_positioning'
    ],
    
    personaRules: {
      urgency: 'medium',
      budgetStatus: 'moderate',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'weeks',
      priorExperience: 'bad',
      technicalSavvy: 'medium'
    },
    
    expectedObjections: [
      'how_different_from_others',
      'proof_of_reliability',
      'what_if_you_fail'
    ],
    
    successCriteria: [
      'Owner acknowledges prospect concerns',
      'Trust-building approach clear',
      'Suggests low-risk next step',
      'Empathy without over-promising'
    ],
    failureConditions: [
      'Defensive about competitors',
      'Over-promises to close',
      'Fails to acknowledge concerns',
      'Rushes to close before building trust'
    ],
    
    isMandatory: true,
    difficulty: 'intermediate',
    estimatedDuration: 20,
    orderIndex: 4
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
      'Capture comparison framing technique'
    ],
    expectedPatterns: [
      'objection_handling',
      'value_positioning',
      'communication_style',
      'closing_pattern'
    ],
    
    personaRules: {
      urgency: 'high',
      budgetStatus: 'approved',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'immediate',
      priorExperience: 'mixed',
      technicalSavvy: 'high'
    },
    
    expectedObjections: [
      'competitor_cheaper',
      'all_providers_similar',
      'justify_higher_price'
    ],
    
    successCriteria: [
      'Clear differentiation without badmouthing',
      'Unique value proposition stated',
      'Confident but not arrogant',
      'Advances to proposal/meeting stage'
    ],
    failureConditions: [
      'Badmouths competitors',
      'Appears insecure or defensive',
      'Fails to differentiate clearly',
      'Competes only on price'
    ],
    
    isMandatory: true,
    difficulty: 'advanced',
    estimatedDuration: 25,
    orderIndex: 5
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
      'Capture long-term relationship building'
    ],
    expectedPatterns: [
      'communication_style',
      'closing_pattern',
      'qualification_criteria',
      'adaptation_triggers'
    ],
    
    personaRules: {
      urgency: 'low',
      budgetStatus: 'moderate',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'months',
      priorExperience: 'none',
      technicalSavvy: 'medium'
    },
    
    expectedObjections: [
      'not_right_now',
      'too_busy',
      'other_priorities'
    ],
    
    successCriteria: [
      'Owner respects timing',
      'Sets up appropriate follow-up',
      'Maintains relationship without pressure',
      'Gets future commitment or permission to follow up'
    ],
    failureConditions: [
      'Pushy or aggressive',
      'Gives up immediately',
      'Fails to get future commitment',
      'Doesn\'t respect prospect timing'
    ],
    
    isMandatory: true,
    difficulty: 'intermediate',
    estimatedDuration: 15,
    orderIndex: 6
  },
  
  {
    id: 'confused_lead_universal',
    scenarioType: 'CONFUSED_LEAD',
    name: 'Confused Lead - Needs Guidance',
    description: 'Prospect can\'t articulate needs clearly. Tests diagnostic and clarification skills.',
    purpose: 'Learn how owner leads conversation and simplifies complex situations.',
    
    primaryGoal: 'Extract clarifying question framework and leadership ability',
    secondaryGoals: [
      'Learn how owner simplifies technical concepts',
      'Identify diagnostic questioning approach',
      'Understand patience in discovery',
      'Capture educational selling style'
    ],
    expectedPatterns: [
      'discovery_pattern',
      'pain_exploration',
      'communication_style',
      'adaptation_triggers'
    ],
    
    personaRules: {
      urgency: 'medium',
      budgetStatus: 'moderate',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'weeks',
      priorExperience: 'none',
      technicalSavvy: 'low'
    },
    
    expectedObjections: [],
    
    successCriteria: [
      'Owner asks clarifying questions',
      'Diagnoses real need effectively',
      'Simplifies without being condescending',
      'Proposes clear path forward'
    ],
    failureConditions: [
      'Frustrated with confusion',
      'Uses jargon despite confusion signals',
      'Fails to take control of conversation',
      'Gives up on clarification too early'
    ],
    
    isMandatory: true,
    difficulty: 'advanced',
    estimatedDuration: 20,
    orderIndex: 7
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
      'Capture audience awareness signals'
    ],
    expectedPatterns: [
      'adaptation_triggers',
      'value_positioning',
      'communication_style',
      'discovery_pattern'
    ],
    
    personaRules: {
      urgency: 'high',
      budgetStatus: 'approved',
      painSeverity: 'moderate',
      decisionMaker: true,
      timeframe: 'immediate',
      priorExperience: 'good',
      technicalSavvy: 'high' // This will alternate to 'low' in second run
    },
    
    expectedObjections: [],
    
    successCriteria: [
      'Owner adapts language based on technical cues',
      'Appropriate depth for audience',
      'Value framing matches buyer priorities',
      'Natural adjustment without asking about technical level'
    ],
    failureConditions: [
      'Same approach for all audiences',
      'Too technical with non-technical buyer',
      'Too simple with technical buyer',
      'Fails to recognize audience cues'
    ],
    
    isMandatory: true,
    difficulty: 'advanced',
    estimatedDuration: 30, // Runs twice with different personas
    orderIndex: 8
  }
];

/**
 * Get all mandatory scenarios
 */
export function getMandatoryScenarios(): UniversalScenario[] {
  return MANDATORY_SCENARIOS;
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): UniversalScenario | undefined {
  return MANDATORY_SCENARIOS.find(s => s.id === id);
}

/**
 * Get scenario by type
 */
export function getScenarioByType(type: ScenarioType): UniversalScenario | undefined {
  return MANDATORY_SCENARIOS.find(s => s.scenarioType === type);
}

/**
 * Get scenarios user has NOT completed yet
 */
export function getUncompletedScenarios(completedScenarioIds: string[]): UniversalScenario[] {
  return MANDATORY_SCENARIOS.filter(s => !completedScenarioIds.includes(s.id));
}

/**
 * Get next recommended scenario based on completion
 */
export function getNextRecommendedScenario(completedScenarioIds: string[]): UniversalScenario | null {
  const uncompleted = getUncompletedScenarios(completedScenarioIds);
  if (uncompleted.length === 0) return null;
  
  // Return lowest orderIndex
  return uncompleted.sort((a, b) => a.orderIndex - b.orderIndex)[0];
}

/**
 * Check if all mandatory scenarios are completed
 */
export function allMandatoryScenariosCompleted(completedScenarioIds: string[]): boolean {
  return MANDATORY_SCENARIOS.every(s => completedScenarioIds.includes(s.id));
}
```

---

## File: `lib/scenarios/persona-generator-v2.ts`

```typescript
/**
 * Universal Persona Generator
 * 
 * Generates industry-specific prospect personas based on:
 * - Universal scenario rules
 * - Tenant's business vertical
 * - Business profile context
 */

import { UniversalScenario } from './mandatory-scenarios';

export interface GeneratedPersona {
  // Identity
  name: string;
  role: string;
  company: string;
  companySize: string;
  
  // Context
  painPoints: string[];
  budget: string;
  timeline: string;
  priorExperience: string;
  
  // Opening
  openingMessage: string;
  
  // Behavior
  personality: string;
  communicationStyle: string;
  technicalLevel: string;
  
  // Objections to raise
  objectionsToRaise: string[];
}

// Industry-specific context templates
const INDUSTRY_CONTEXTS = {
  'Legal Services': {
    companyTypes: ['small business', 'startup', 'mid-size company', 'enterprise'],
    painTypes: {
      critical: ['contract dispute threatening $X loss', 'regulatory compliance violation', 'litigation risk'],
      moderate: ['contract review backlog', 'IP protection needs', 'employment law questions'],
      minor: ['general legal advice', 'document templates', 'consultation']
    },
    budgetRanges: {
      tight: '$1,000-2,000',
      moderate: '$3,000-7,000',
      approved: '$8,000-15,000',
      flexible: '$15,000+'
    },
    roleTypes: ['CEO', 'CFO', 'Operations Manager', 'Business Owner']
  },
  
  'Construction & Contracting': {
    companyTypes: ['homeowner', 'property management company', 'commercial developer', 'general contractor'],
    painTypes: {
      critical: ['project delay costing $X/day', 'failed inspection', 'contractor walked off job'],
      moderate: ['renovation estimate needed', 'permit issues', 'subcontractor coordination'],
      minor: ['maintenance quote', 'small repair', 'consultation']
    },
    budgetRanges: {
      tight: '$5,000-10,000',
      moderate: '$15,000-35,000',
      approved: '$40,000-80,000',
      flexible: '$100,000+'
    },
    roleTypes: ['Homeowner', 'Property Manager', 'Project Manager', 'Developer']
  },
  
  'Real Estate Services': {
    companyTypes: ['first-time buyer', 'investor', 'commercial buyer', 'property owner'],
    painTypes: {
      critical: ['closing deadline approaching', 'lost dream property', 'market moving fast'],
      moderate: ['looking to buy in 2-3 months', 'want to sell soon', 'portfolio expansion'],
      minor: ['market research', 'casual browsing', 'valuation curiosity']
    },
    budgetRanges: {
      tight: '$200,000-350,000',
      moderate: '$400,000-700,000',
      approved: '$750,000-1.5M',
      flexible: '$2M+'
    },
    roleTypes: ['Buyer', 'Seller', 'Investor', 'Business Owner']
  },
  
  'Financial Advisory': {
    companyTypes: ['young professional', 'mid-career', 'pre-retiree', 'business owner'],
    painTypes: {
      critical: ['retirement portfolio underwater', 'unexpected tax burden', 'business valuation for sale'],
      moderate: ['retirement planning', 'investment strategy', 'estate planning'],
      minor: ['financial checkup', 'savings advice', 'general questions']
    },
    budgetRanges: {
      tight: '$1,000-3,000',
      moderate: '$5,000-10,000',
      approved: '$12,000-25,000',
      flexible: '$30,000+'
    },
    roleTypes: ['Professional', 'Executive', 'Business Owner', 'Retiree']
  },
  
  'Business Consulting': {
    companyTypes: ['startup', 'small business', 'mid-size company', 'enterprise'],
    painTypes: {
      critical: ['revenue declining 30%', 'team dysfunction', 'operational crisis'],
      moderate: ['growth planning', 'process optimization', 'strategy development'],
      minor: ['general advice', 'workshop request', 'exploratory call']
    },
    budgetRanges: {
      tight: '$3,000-7,000',
      moderate: '$10,000-20,000',
      approved: '$25,000-50,000',
      flexible: '$75,000+'
    },
    roleTypes: ['Founder', 'CEO', 'Operations Director', 'Department Head']
  },
  
  'Marketing & Creative Agencies': {
    companyTypes: ['startup', 'local business', 'mid-size company', 'enterprise'],
    painTypes: {
      critical: ['product launch in 4 weeks', 'rebrand needed urgently', 'campaign failed'],
      moderate: ['need ongoing marketing', 'website redesign', 'brand identity work'],
      minor: ['logo design', 'social media help', 'consultation']
    },
    budgetRanges: {
      tight: '$2,000-5,000',
      moderate: '$8,000-15,000',
      approved: '$20,000-40,000',
      flexible: '$50,000+'
    },
    roleTypes: ['Founder', 'Marketing Director', 'Product Manager', 'CEO']
  },
  
  'Home Services': {
    companyTypes: ['homeowner', 'rental property owner', 'property manager', 'business owner'],
    painTypes: {
      critical: ['emergency repair needed', 'tenant complaint urgent', 'system failure'],
      moderate: ['seasonal maintenance', 'upgrade project', 'inspection needed'],
      minor: ['quote request', 'preventive maintenance', 'general question']
    },
    budgetRanges: {
      tight: '$500-1,500',
      moderate: '$2,000-5,000',
      approved: '$6,000-12,000',
      flexible: '$15,000+'
    },
    roleTypes: ['Homeowner', 'Property Manager', 'Landlord', 'Facility Manager']
  },
  
  'Health & Wellness Coaching': {
    companyTypes: ['individual', 'couple', 'small group', 'corporate wellness'],
    painTypes: {
      critical: ['health scare', 'relationship crisis', 'burnout'],
      moderate: ['weight loss goals', 'stress management', 'life transition'],
      minor: ['curiosity', 'maintenance', 'exploration']
    },
    budgetRanges: {
      tight: '$500-1,200',
      moderate: '$1,500-3,000',
      approved: '$3,500-7,000',
      flexible: '$10,000+'
    },
    roleTypes: ['Individual', 'Professional', 'Executive', 'Team Leader']
  },
  
  'IT & Technology Services': {
    companyTypes: ['small business', 'mid-size company', 'enterprise', 'startup'],
    painTypes: {
      critical: ['systems down', 'security breach', 'data loss'],
      moderate: ['slow performance', 'outdated infrastructure', 'scaling needs'],
      minor: ['IT assessment', 'consultation', 'minor upgrade']
    },
    budgetRanges: {
      tight: '$1,500-3,000',
      moderate: '$4,000-8,000',
      approved: '$10,000-20,000',
      flexible: '$25,000+'
    },
    roleTypes: ['CEO', 'Operations Manager', 'IT Manager', 'CFO']
  },
  
  'Interior Design': {
    companyTypes: ['homeowner', 'business owner', 'developer', 'property investor'],
    painTypes: {
      critical: ['renovation deadline approaching', 'space unusable', 'design disaster'],
      moderate: ['home refresh', 'office redesign', 'staging for sale'],
      minor: ['consultation', 'color advice', 'furniture selection']
    },
    budgetRanges: {
      tight: '$3,000-8,000',
      moderate: '$10,000-25,000',
      approved: '$30,000-60,000',
      flexible: '$75,000+'
    },
    roleTypes: ['Homeowner', 'Business Owner', 'Developer', 'Property Manager']
  }
};

const FIRST_NAMES = ['Sarah', 'Michael', 'Jennifer', 'David', 'Emily', 'James', 'Lisa', 'Robert', 'Jessica', 'John'];
const LAST_NAMES = ['Chen', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];

/**
 * Generate persona for a scenario + industry combination
 */
export function generateUniversalPersona(
  scenario: UniversalScenario,
  industry: string
): GeneratedPersona {
  
  const context = INDUSTRY_CONTEXTS[industry as keyof typeof INDUSTRY_CONTEXTS];
  if (!context) {
    throw new Error(`Industry not supported: ${industry}`);
  }
  
  const rules = scenario.personaRules;
  
  // Generate identity
  const name = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
  const companyType = randomFrom(context.companyTypes);
  const role = randomFrom(context.roleTypes);
  
  // Generate pain based on severity
  const painPool = context.painTypes[rules.painSeverity];
  const painPoints = [randomFrom(painPool)];
  
  // Generate budget based on status
  let budget = 'Unknown';
  if (rules.budgetStatus !== 'none') {
    budget = context.budgetRanges[rules.budgetStatus] || 'Flexible';
  }
  
  // Generate timeline
  const timeline = rules.timeframe === 'immediate' ? 'Within 1 week' :
                   rules.timeframe === 'weeks' ? '2-4 weeks' :
                   rules.timeframe === 'months' ? '2-3 months' :
                   'Exploring options';
  
  // Prior experience narrative
  const priorExperience = rules.priorExperience === 'bad' ? 'Had negative experience with previous provider' :
                         rules.priorExperience === 'good' ? 'Had positive experience before' :
                         rules.priorExperience === 'mixed' ? 'Mixed results with past providers' :
                         'First time seeking this service';
  
  // Technical level
  const technicalLevel = rules.technicalSavvy === 'high' ? 'Highly knowledgeable' :
                        rules.technicalSavvy === 'medium' ? 'Moderately informed' :
                        'Limited technical knowledge';
  
  // Personality based on scenario type
  const personality = scenario.scenarioType === 'HOT_LEAD' ? 'Decisive and urgent' :
                     scenario.scenarioType === 'PRICE_OBJECTION' ? 'Cost-conscious and analytical' :
                     scenario.scenarioType === 'SKEPTICAL_LEAD' ? 'Cautious and questioning' :
                     scenario.scenarioType === 'CONFUSED_LEAD' ? 'Uncertain and seeking guidance' :
                     scenario.scenarioType === 'BUSY_NOT_READY' ? 'Interested but overwhelmed' :
                     'Professional and balanced';
  
  // Communication style
  const communicationStyle = rules.technicalSavvy === 'high' ? 'Direct and detailed' :
                            rules.technicalSavvy === 'low' ? 'Simple and question-heavy' :
                            'Clear and conversational';
  
  // Generate opening message
  const openingMessage = generateOpeningMessage(scenario, industry, name, role, companyType, painPoints[0]);
  
  return {
    name,
    role,
    company: `${companyType}`,
    companySize: rules.decisionMaker ? '20-50 employees' : '50-100 employees',
    painPoints,
    budget,
    timeline,
    priorExperience,
    openingMessage,
    personality,
    communicationStyle,
    technicalLevel,
    objectionsToRaise: scenario.expectedObjections
  };
}

function generateOpeningMessage(
  scenario: UniversalScenario,
  industry: string,
  name: string,
  role: string,
  companyType: string,
  pain: string
): string {
  
  // Industry-specific greetings based on scenario type
  const greetings = {
    'Legal Services': {
      HOT_LEAD: `Hi, I'm ${name}. We have a ${pain} and need legal help immediately. Can you assist?`,
      PRICE_OBJECTION: `Hello, I'm looking for legal services. I got a quote from you and another firm - yours is higher. Why should we go with you?`,
      WRONG_FIT: `Hi, we're a ${companyType} and need occasional legal advice. What would basic support cost?`,
      SKEPTICAL_LEAD: `I'm ${name}. We used a lawyer before and it was a disaster - overcharged and poor communication. How are you different?`,
      COMPETITOR_COMPARISON: `Hi, we're comparing three law firms for ongoing support. Help me understand what makes your practice stand out?`,
      BUSY_NOT_READY: `Your services look good, but we're swamped with other priorities right now. Maybe in a few months?`,
      CONFUSED_LEAD: `Hi, we're having some legal issues but I'm not sure exactly what we need. Can you help figure that out?`,
      TECHNICAL_ADAPTATION: `I'm ${name}, ${role}. We need ${pain.toLowerCase()}. What's your approach to this type of case?`
    },
    'Construction & Contracting': {
      HOT_LEAD: `Hi, I'm ${name}. We've got ${pain} and need a contractor who can start this week. Are you available?`,
      PRICE_OBJECTION: `I got your estimate and another one that's 30% lower. Both seem to cover the same work. Why the difference?`,
      WRONG_FIT: `Hi, we need some small repairs around the house. What do you charge for handyman-type work?`,
      SKEPTICAL_LEAD: `Our last contractor was a nightmare - delays, cost overruns, poor quality. How do I know you won't be the same?`,
      COMPETITOR_COMPARISON: `We're getting bids from three contractors. You're the highest. What am I getting for that extra cost?`,
      BUSY_NOT_READY: `This project sounds great but we're in the middle of selling our business. Can we reconnect in Q3?`,
      CONFUSED_LEAD: `Our ${companyType} has some issues but I'm not sure if it's structural, cosmetic, or what. Where do we even start?`,
      TECHNICAL_ADAPTATION: `I'm ${name}. We need ${pain.toLowerCase()}. I've worked with contractors before - what's your timeline and process?`
    },
    // Add other industries similarly...
  };
  
  const industryGreetings = greetings[industry as keyof typeof greetings];
  if (!industryGreetings) {
    // Fallback generic
    return `Hi, I'm ${name}, ${role} at a ${companyType}. We're dealing with ${pain.toLowerCase()} and need help. Can you assist?`;
  }
  
  return industryGreetings[scenario.scenarioType] || industryGreetings.HOT_LEAD;
}

function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
```

---

## Migration Guide

### Step 1: Replace Files

**Delete:**
```
lib/templates/industry-scenarios.ts
```

**Add:**
```
lib/scenarios/mandatory-scenarios.ts
lib/scenarios/persona-generator-v2.ts
```

### Step 2: Update API Route `app/api/v1/simulations/scenarios/route.ts`

**Replace entire file with:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { getMandatoryScenarios, getNextRecommendedScenario } from '@/lib/scenarios/mandatory-scenarios';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get business profile
    const profile = await prisma.businessProfile.findUnique({
      where: { tenantId: user.tenantId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get all mandatory scenarios
    const allScenarios = getMandatoryScenarios();
    
    // Get completed scenario IDs
    const completedIds = profile.completedScenarios || [];
    
    // Get next recommended
    const nextRecommended = getNextRecommendedScenario(completedIds);
    
    // Map to response format
    const scenarios = allScenarios.map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      difficulty: scenario.difficulty,
      estimatedDuration: scenario.estimatedDuration,
      isMandatory: scenario.isMandatory,
      isCompleted: completedIds.includes(scenario.id),
      orderIndex: scenario.orderIndex
    }));

    return NextResponse.json({
      scenarios,
      suggestedNext: nextRecommended ? {
        id: nextRecommended.id,
        name: nextRecommended.name,
        reason: `Next in sequence - ${nextRecommended.purpose}`
      } : null,
      completionStats: {
        completed: completedIds.length,
        total: allScenarios.length,
        percentage: Math.round((completedIds.length / allScenarios.length) * 100)
      }
    });

  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Step 3: Update Simulation Start Route `app/api/v1/simulations/start/route.ts`

**Key changes:**

```typescript
import { getScenarioById } from '@/lib/scenarios/mandatory-scenarios';
import { generateUniversalPersona } from '@/lib/scenarios/persona-generator-v2';

// In POST handler:
const scenario = getScenarioById(scenarioId);
if (!scenario) {
  return NextResponse.json({ error: 'Invalid scenario' }, { status: 400 });
}

// Generate persona
const persona = generateUniversalPersona(scenario, businessProfile.industry);

// Create simulation
const simulation = await prisma.simulation.create({
  data: {
    tenantId: user.tenantId,
    scenarioType: scenario.id, // Store scenario ID
    status: 'IN_PROGRESS',
    personaDetails: persona as any,
    aiPersona: persona as any // Legacy compat
  }
});

// Store opening message
await prisma.simulationMessage.create({
  data: {
    simulationId: simulation.id,
    role: 'AI_CLIENT',
    content: persona.openingMessage
  }
});
```

### Step 4: Test

```bash
# Start a hot lead simulation
POST /api/v1/simulations/start
{
  "scenarioId": "hot_lead_universal"
}

# Verify persona is industry-specific
# Check that opening message makes sense for your industry
```

---

## Completion Checklist

- [ ] Old `industry-scenarios.ts` deleted
- [ ] New `mandatory-scenarios.ts` added
- [ ] New `persona-generator-v2.ts` added
- [ ] Scenarios API route updated
- [ ] Start simulation route updated
- [ ] Tested with at least 3 different industries
- [ ] Personas are industry-appropriate
- [ ] All 8 scenarios accessible

---

**Next:** Artifact 2 - JSON Extraction System
