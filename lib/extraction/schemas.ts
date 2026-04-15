/**
 * TypeScript Interfaces for BusinessProfile JSON Fields
 *
 * These define the EXACT structure stored in your database.
 * All JSON fields use these types.
 */

// ============================================
// COMMUNICATION STYLE (Identity Layer)
// ============================================

export interface CommunicationStyle {
  tone: 'friendly' | 'direct' | 'formal' | 'warm' | 'assertive' | 'consultative' | null;
  energyLevel: 'low' | 'medium' | 'high' | null;
  sentenceLength: 'short' | 'mixed' | 'long' | null;
  complexityLevel: 'simple' | 'moderate' | 'advanced' | null;

  usesHumor: boolean;
  humorExamples: string[];

  usesEmpathy: boolean;
  empathyExamples: string[];

  pressureLevel: 'low' | 'medium' | 'high' | null;

  commonPhrases: string[];
  commonOpenings: string[];
  commonClosings: string[];
  favoriteWords: string[];

  punctuationStyle: 'minimal' | 'standard' | 'expressive' | null;
  emojiUsage: 'none' | 'occasional' | 'frequent' | null;
  typoTolerance: 'formal' | 'casual' | 'very_casual' | null;

  verbosityPattern: 'concise' | 'balanced' | 'detailed' | null;

  confidence: number;
  evidenceCount: number;
  lastUpdated: string;
}

// ============================================
// OBJECTION HANDLING (Objection Layer)
// ============================================

export interface ObjectionPlaybook {
  objectionType: 'price' | 'trust' | 'time' | 'competitor' | 'complexity' | 'risk';

  signalExamples: string[];

  responseStrategy: string;
  reframingMethod: string | null;
  responseExamples: string[];

  escalationLogic: string | null;
  exitLogic: string | null;

  confidenceScore: number;
  evidenceCount: number;
  lastSeenAt: string;
  scenariosEncountered: string[];
}

export interface ObjectionHandling {
  playbooks: ObjectionPlaybook[];
  overallConfidence: number;
  lastUpdated: string;
}

// ============================================
// QUALIFICATION CRITERIA (Qualification Layer)
// ============================================

export interface GreenFlag {
  flagType: string;
  description: string;
  signalExamples: string[];
  confidence: number;
}

export interface YellowFlag {
  flagType: string;
  description: string;
  signalExamples: string[];
  ownerResponse: string | null;
  confidence: number;
}

export interface RedFlag {
  flagType: string;
  description: string;
  signalExamples: string[];
  triggersExit: boolean;
  confidence: number;
}

export interface DealBreaker {
  rule: string;
  reasoning: string;
  isAbsolute: boolean;
  evidenceCount: number;
  confidence: number;
  scenariosDemonstrated: string[];
}

export interface WalkAwayStrategy {
  exitLanguage: string[];
  leavesDoorOpen: boolean;
  exitFirmness: 'soft' | 'moderate' | 'firm' | null;
  offersAlternatives: boolean;
  alternativeExamples: string[];
}

export interface QualificationCriteria {
  greenFlags: GreenFlag[];
  yellowFlags: YellowFlag[];
  redFlags: RedFlag[];
  dealBreakers: DealBreaker[];
  walkAwayStrategy: WalkAwayStrategy;

  overallConfidence: number;
  lastUpdated: string;
}

// ============================================
// DECISION MAKING PATTERNS (Strategic Layer)
// ============================================

export interface DiscoveryPattern {
  firstQuestions: string[];
  discoveryOrder: string[];
  prioritizedInfo: string[];
  moveToValueTrigger: string | null;
}

export interface PainPattern {
  deepensPain: boolean;
  painDepthLevel: 'surface' | 'moderate' | 'deep' | null;
  normalizesProblem: boolean;
  painApproach: 'challenge' | 'comfort' | 'balanced' | null;
}

export interface ValuePositioning {
  primaryValueLens: 'outcome' | 'process' | 'speed' | 'trust' | 'expertise' | 'convenience' | null;
  secondaryValueLens: string[];
  proofSignalsUsed: string[];
}

export interface ClosingPattern {
  asksForNextStep: boolean;
  ctaTiming: 'early' | 'moderate' | 'late' | null;
  ctaDirectness: 'subtle' | 'moderate' | 'direct' | null;
  preferredNextStep: 'call' | 'meeting' | 'quote' | 'demo' | 'audit' | 'proposal' | null;
  createsUrgency: boolean;
  urgencyMethod: string | null;
}

export interface DecisionMakingPatterns {
  discovery: DiscoveryPattern;
  pain: PainPattern;
  valuePositioning: ValuePositioning;
  closing: ClosingPattern;

  overallConfidence: number;
  lastUpdated: string;
}

// ============================================
// PRICING LOGIC
// ============================================

export interface PricingLogic {
  minimumBudget: number | null;
  preferredBudgetRange: string | null;

  flexibleOn: string[];
  notFlexibleOn: string[];

  priceDefenseStrategy: string | null;
  valueAnchorPoints: string[];

  confidence: number;
  lastUpdated: string;
}

// ============================================
// OWNER VOICE EXAMPLES
// ============================================

export interface OwnerVoiceExamples {
  greetings: string[];
  discoveryQuestions: string[];
  empathyStatements: string[];
  valueStatements: string[];
  objectionResponses: string[];
  closingStatements: string[];
  exitStatements: string[];

  fullMessages: Array<{
    context: string;
    message: string;
    scenario: string;
  }>;

  lastUpdated: string;
}

// ============================================
// ADAPTATION TRIGGERS
// ============================================

export interface AdaptationTrigger {
  triggerType: string;
  context: string;
  examples: string[];
  confidence: number;
}

export interface AdaptationPatterns {
  triggers: AdaptationTrigger[];

  overallConfidence: number;
  lastUpdated: string;
}

// ============================================
// EXTRACTED PATTERNS (Per-Simulation Raw Data)
// ============================================

export interface ExtractedPatternData {
  simulationId: string;
  scenarioType: string;
  completedAt: string;

  patterns: {
    communicationStyleUpdates?: Partial<CommunicationStyle>;
    objectionHandlingUpdates?: {
      newPlaybooks?: ObjectionPlaybook[];
      updatedPlaybooks?: ObjectionPlaybook[];
    };
    qualificationUpdates?: {
      newGreenFlags?: GreenFlag[];
      newRedFlags?: RedFlag[];
      newDealBreakers?: DealBreaker[];
    };
    decisionMakingUpdates?: Partial<DecisionMakingPatterns>;
    pricingUpdates?: Partial<PricingLogic>;
  };

  overallQuality: number;
  extractionConfidence: number;
}

// ============================================
// RAW EXTRACTION RESPONSE FROM AI
// ============================================

export interface RawExtractionResponse {
  communicationStyle: Partial<CommunicationStyle>;
  objectionHandling: { playbooks: ObjectionPlaybook[]; overallConfidence: number };
  qualificationCriteria: Partial<QualificationCriteria>;
  decisionMakingPatterns: Partial<DecisionMakingPatterns>;
  pricingLogic: Partial<PricingLogic>;
  ownerVoiceExamples: Partial<OwnerVoiceExamples>;
  adaptationPatterns?: Partial<AdaptationPatterns>;
  overallQuality: number;
  extractionConfidence: number;
}
