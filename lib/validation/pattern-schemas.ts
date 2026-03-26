/**
 * Zod Validation Schemas for Business Profile Patterns
 * Phase 1: Fixed extraction logic with confidence metadata
 */

import { z } from 'zod';

export const CommunicationStyleSchema = z.object({
  tone: z.enum(['professional', 'casual', 'empathetic', 'direct', 'friendly']),
  style: z.enum(['data-driven', 'emotional', 'educational', 'consultative']),
  keyPhrases: z.array(z.string()),
  formality: z.enum(['formal', 'conversational', 'casual']),
  responsePattern: z.string().optional()
});

export const PricingLogicSchema = z.object({
  minBudget: z.number().optional().nullable(),
  maxBudget: z.number().optional().nullable(),
  typicalRange: z.string().optional(),
  flexibilityFactors: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  pricingConfidence: z.string().optional()
});

export const QualificationCriteriaSchema = z.object({
  mustHaves: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  greenFlags: z.array(z.string()),
  redFlags: z.array(z.string()),
  confidence: z.object({
    mustHaves: z.enum(['high', 'medium', 'low', 'not_demonstrated']),
    dealBreakers: z.enum(['high', 'medium', 'low', 'not_demonstrated']),
    greenFlags: z.enum(['high', 'medium', 'low', 'not_demonstrated']),
    redFlags: z.enum(['high', 'medium', 'low', 'not_demonstrated'])
  }).optional()
});

export const ObjectionHandlingSchema = z.object({
  priceObjection: z.string().optional(),
  timelineObjection: z.string().optional(),
  competitorObjection: z.string().optional(),
  qualityObjection: z.string().optional(),
  scopeObjection: z.string().optional(),
  criticismHandling: z.string().optional(),
  unansweredObjections: z.array(z.string()).optional()
}).passthrough();  // Allow additional objection types

export const DecisionMakingPatternsSchema = z.object({
  whenToSayYes: z.array(z.string()),
  whenToSayNo: z.array(z.string()),
  warningSignsToWatch: z.array(z.string()),
  decisionSpeed: z.string().optional(),
  confidence: z.object({
    whenToSayYes: z.enum(['high', 'medium', 'low', 'not_demonstrated']),
    whenToSayNo: z.enum(['high', 'medium', 'low', 'not_demonstrated'])
  }).optional()
});

export const KnowledgeBaseSchema = z.object({
  expertiseAreas: z.array(z.string()),
  commonAnswers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().optional()
  }))
}).optional();

export const ConversationQualitySchema = z.object({
  unansweredQuestions: z.array(z.string()),
  hasResolution: z.boolean(),
  resolutionType: z.enum(['accepted', 'rejected', 'scheduled_followup', 'none']),
  completenessScore: z.coerce.number().min(0).max(100),
  missingPatterns: z.array(z.string()).optional(),
  conversationFlow: z.enum(['smooth', 'interrupted', 'one_sided', 'incomplete']),
  overallConfidence: z.enum(['high', 'medium', 'low'])
}).optional();

export const ExtractionNotesSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string())
}).optional();

export const ExtractedPatternsSchema = z.object({
  communicationStyle: CommunicationStyleSchema,
  pricingLogic: PricingLogicSchema,
  qualificationCriteria: QualificationCriteriaSchema,
  objectionHandling: ObjectionHandlingSchema,
  decisionMakingPatterns: DecisionMakingPatternsSchema,
  conversationQuality: ConversationQualitySchema,
  extractionNotes: ExtractionNotesSchema,
  knowledgeBase: KnowledgeBaseSchema
});

export type ExtractedPatternsType = z.infer<typeof ExtractedPatternsSchema>;
