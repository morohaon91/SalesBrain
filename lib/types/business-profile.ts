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
  responsePattern?: string; // How owner typically structures responses
  confidence?: {
    tone: 'high' | 'medium' | 'low' | 'not_demonstrated';
    style: 'high' | 'medium' | 'low' | 'not_demonstrated';
    formality: 'high' | 'medium' | 'low' | 'not_demonstrated';
  };
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
  pricingConfidence?: string;    // How confidently owner discusses pricing
  confidence?: {
    minBudget: 'high' | 'medium' | 'low' | 'not_demonstrated';
    maxBudget: 'high' | 'medium' | 'low' | 'not_demonstrated';
    dealBreakers: 'high' | 'medium' | 'low' | 'not_demonstrated';
    flexibilityFactors: 'high' | 'medium' | 'low' | 'not_demonstrated';
  };
}

/**
 * Qualification Criteria - What makes a good/bad client
 */
export interface QualificationCriteria {
  mustHaves: string[];     // Requirements for working together
  dealBreakers: string[];  // Absolute no-gos
  greenFlags: string[];    // Signals of ideal client
  redFlags: string[];      // Warning signs
  confidence?: {
    mustHaves: 'high' | 'medium' | 'low' | 'not_demonstrated';
    dealBreakers: 'high' | 'medium' | 'low' | 'not_demonstrated';
    greenFlags: 'high' | 'medium' | 'low' | 'not_demonstrated';
    redFlags: 'high' | 'medium' | 'low' | 'not_demonstrated';
  };
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
  confidence?: {
    priceObjection: 'high' | 'medium' | 'low' | 'not_demonstrated';
    timelineObjection: 'high' | 'medium' | 'low' | 'not_demonstrated';
    competitorObjection: 'high' | 'medium' | 'low' | 'not_demonstrated';
    qualityObjection: 'high' | 'medium' | 'low' | 'not_demonstrated';
    scopeObjection: 'high' | 'medium' | 'low' | 'not_demonstrated';
  };
  [key: string]: any;  // Allow custom objection types
}

/**
 * Decision Making Patterns - When to say yes/no
 */
export interface DecisionMakingPatterns {
  whenToSayYes: string[];
  whenToSayNo: string[];
  warningSignsToWatch: string[];
  decisionSpeed?: string; // How quickly owner makes yes/no decisions
  confidence?: {
    whenToSayYes: 'high' | 'medium' | 'low' | 'not_demonstrated';
    whenToSayNo: 'high' | 'medium' | 'low' | 'not_demonstrated';
  };
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
  confidence?: {
    expertiseAreas: 'high' | 'medium' | 'low' | 'not_demonstrated';
    commonAnswers: 'high' | 'medium' | 'low' | 'not_demonstrated';
  };
}

/**
 * Conversation Quality Assessment - Quality metrics from the simulation
 */
export interface ConversationQuality {
  unansweredQuestions: string[]; // Specific questions customer asked that owner didn't answer
  hasResolution: boolean;
  resolutionType: 'accepted' | 'rejected' | 'scheduled_followup' | 'none';
  completenessScore: number; // 0-100 score
  missingPatterns?: string[]; // Expected patterns that weren't demonstrated
  conversationFlow: 'smooth' | 'interrupted' | 'one_sided' | 'incomplete';
  overallConfidence: 'high' | 'medium' | 'low';
}

/**
 * Extraction Notes - Feedback about the owner's performance
 */
export interface ExtractionNotes {
  strengths: string[]; // What the owner handled well
  weaknesses: string[]; // What the owner struggled with
  suggestions: string[]; // What owner should practice
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
  conversationQuality?: ConversationQuality;
  extractionNotes?: ExtractionNotes;
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
