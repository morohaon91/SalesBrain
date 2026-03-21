/**
 * Zod Validation Schemas for Business Profile Patterns
 */

import { z } from 'zod';

export const CommunicationStyleSchema = z.object({
  tone: z.enum(['professional', 'casual', 'empathetic', 'direct', 'friendly']),
  style: z.enum(['data-driven', 'emotional', 'educational', 'consultative']),
  keyPhrases: z.array(z.string()),
  formality: z.enum(['formal', 'conversational', 'casual'])
});

export const PricingLogicSchema = z.object({
  minBudget: z.number().optional().nullable(),
  maxBudget: z.number().optional().nullable(),
  typicalRange: z.string().optional(),
  flexibilityFactors: z.array(z.string()),
  dealBreakers: z.array(z.string())
});

export const QualificationCriteriaSchema = z.object({
  mustHaves: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  greenFlags: z.array(z.string()),
  redFlags: z.array(z.string())
});

export const ObjectionHandlingSchema = z.object({
  priceObjection: z.string().optional(),
  timelineObjection: z.string().optional(),
  competitorObjection: z.string().optional(),
  qualityObjection: z.string().optional(),
  scopeObjection: z.string().optional()
}).passthrough();  // Allow additional objection types

export const DecisionMakingPatternsSchema = z.object({
  whenToSayYes: z.array(z.string()),
  whenToSayNo: z.array(z.string()),
  warningSignsToWatch: z.array(z.string())
});

export const KnowledgeBaseSchema = z.object({
  expertiseAreas: z.array(z.string()),
  commonAnswers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().optional()
  }))
}).optional();

export const ExtractedPatternsSchema = z.object({
  communicationStyle: CommunicationStyleSchema,
  pricingLogic: PricingLogicSchema,
  qualificationCriteria: QualificationCriteriaSchema,
  objectionHandling: ObjectionHandlingSchema,
  decisionMakingPatterns: DecisionMakingPatternsSchema,
  knowledgeBase: KnowledgeBaseSchema
});

export type ExtractedPatternsType = z.infer<typeof ExtractedPatternsSchema>;
