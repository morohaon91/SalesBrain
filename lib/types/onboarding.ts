/**
 * Onboarding Types
 * Used for the initial questionnaire and onboarding flow
 */

export interface QuestionnaireData {
  industry: string;
  serviceDescription: string;
  targetClientType: string;
  typicalBudgetRange: string;
  commonClientQuestions: string[];
  yearsExperience?: number | null;
  certifications: string[];
  serviceArea: string;
  teamSize: string;
}

export interface QuestionnaireValidationError {
  field: keyof QuestionnaireData;
  message: string;
}

export interface QuestionnaireValidation {
  isValid: boolean;
  errors: QuestionnaireValidationError[];
}

export type OnboardingStep = 'questionnaire' | 'simulations' | 'approval';
