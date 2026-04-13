import { z } from 'zod';
import type { TFunction } from 'i18next';

/**
 * Questionnaire data validation schema (English defaults for API / server)
 */
export const QuestionnaireDataSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  serviceDescription: z.string().min(10, 'Service description must be at least 10 characters').max(1000),
  targetClientType: z.string().min(5, 'Target client type must be at least 5 characters').max(200),
  typicalBudgetRange: z.string().min(3, 'Budget range is required').max(100),
  commonClientQuestions: z
    .array(z.string().min(5).max(300))
    .min(1, 'At least one common client question is required')
    .max(10),
  yearsExperience: z.number().min(0).max(100).nullable().optional(),
  certifications: z.array(z.string().min(3).max(200)).max(20).default([]),
  serviceArea: z.string().min(3, 'Service area is required').max(200),
  teamSize: z.enum(['Solo', '2-5', '6-10', '10+'], {
    errorMap: () => ({ message: 'Please select a team size' }),
  }),
});

/**
 * Localized questionnaire schema for client-side forms (onboarding namespace).
 */
/** Pass `t` scoped to the `onboarding` namespace (e.g. from useI18n('onboarding')). */
export function createQuestionnaireDataSchema(t: TFunction) {
  return z.object({
    industry: z.string().min(1, t('validation.industryRequired')),
    serviceDescription: z
      .string()
      .min(10, t('validation.serviceDescriptionMin'))
      .max(1000),
    targetClientType: z
      .string()
      .min(5, t('validation.targetClientMin'))
      .max(200),
    typicalBudgetRange: z.string().min(3, t('validation.budgetRequired')).max(100),
    commonClientQuestions: z
      .array(z.string().min(5).max(300))
      .min(1, t('validation.questionsMin'))
      .max(10),
    yearsExperience: z.number().min(0).max(100).nullable().optional(),
    certifications: z.array(z.string().min(3).max(200)).max(20).default([]),
    serviceArea: z.string().min(3, t('validation.serviceAreaRequired')).max(200),
    teamSize: z.enum(['Solo', '2-5', '6-10', '10+'], {
      errorMap: () => ({ message: t('validation.teamSizeRequired') }),
    }),
  });
}

export type QuestionnaireDataInput = z.infer<typeof QuestionnaireDataSchema>;

/**
 * Business facts schema
 */
export const BusinessFactsSchema = z.object({
  mentionedExperience: z.string().optional(),
  mentionedServices: z.array(z.string()).optional(),
  mentionedCertifications: z.array(z.string()).optional(),
  mentionedServiceArea: z.string().optional(),
  mentionedTeamSize: z.string().optional(),
  specializations: z.array(z.string()).optional(),
});

/**
 * Owner voice example schema
 */
export const OwnerVoiceExampleSchema = z.object({
  phrase: z.string().min(8).max(500),
  context: z.string().min(5).max(300),
  category: z.enum(['pricing', 'qualification', 'objection', 'closing', 'communication', 'other']),
  simulationId: z.string(),
  extractedAt: z.string(),
});

/**
 * Profile approval request schema
 */
export const ProfileApprovalSchema = z.object({
  profileId: z.string().uuid(),
  action: z.enum(['approve', 'pause']),
});

/**
 * Simulation persona schema
 */
export const SimulationPersonaSchema = z.object({
  name: z.string(),
  age: z.number().min(18).max(90),
  budget: z.object({
    min: z.number(),
    max: z.number(),
    flexibility: z.enum(['rigid', 'moderate', 'flexible']),
  }),
  timeline: z.string(),
  painPoints: z.array(z.string()),
  personality: z.array(z.string()),
  openingLine: z.string(),
  backstory: z.string(),
});
