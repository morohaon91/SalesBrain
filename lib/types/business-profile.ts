/**
 * Business Profile Pattern Types
 * Defines TypeScript interfaces for extracted business patterns
 */

/**
 * Communication Style - How the business owner communicates with clients
 */
export interface CommunicationStyle {
  tone: 'professional' | 'casual' | 'empathetic' | 'direct' | 'friendly';
  style: 'data-driven' | 'emotional' | 'educational' | 'consultative';
  keyPhrases: string[];
  formality: 'formal' | 'conversational' | 'casual';
}

/**
 * Pricing Logic - Budget boundaries and flexibility
 */
export interface PricingLogic {
  minBudget?: number;
  maxBudget?: number;
  typicalRange?: string;
  flexibilityFactors: string[];  // e.g., ["timeline", "scope", "payment_terms"]
  dealBreakers: string[];        // e.g., ["budget_below_X", "unrealistic_timeline"]
}

/**
 * Qualification Criteria - What makes a good/bad client
 */
export interface QualificationCriteria {
  mustHaves: string[];     // Requirements for working together
  dealBreakers: string[];  // Absolute no-gos
  greenFlags: string[];    // Signals of ideal client
  redFlags: string[];      // Warning signs
}

/**
 * Objection Handling - How they respond to common objections
 */
export interface ObjectionHandling {
  priceObjection?: string;
  timelineObjection?: string;
  competitorObjection?: string;
  qualityObjection?: string;
  scopeObjection?: string;
  [key: string]: string | undefined;  // Allow custom objection types
}

/**
 * Decision Making Patterns - When to say yes/no
 */
export interface DecisionMakingPatterns {
  whenToSayYes: string[];
  whenToSayNo: string[];
  warningSignsToWatch: string[];
}

/**
 * Knowledge Base - Common questions and answers (optional for now)
 */
export interface KnowledgeBase {
  expertiseAreas: string[];
  commonAnswers: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
}

/**
 * Complete extracted patterns from a simulation
 */
export interface ExtractedPatterns {
  communicationStyle: CommunicationStyle;
  pricingLogic: PricingLogic;
  qualificationCriteria: QualificationCriteria;
  objectionHandling: ObjectionHandling;
  decisionMakingPatterns: DecisionMakingPatterns;
  knowledgeBase?: KnowledgeBase;
}

/**
 * Metadata about the extraction
 */
export interface ExtractionMetadata {
  simulationId: string;
  extractedAt: Date;
  messageCount: number;
  scenarioType: string;
  confidence: 'high' | 'medium' | 'low';
}
