/**
 * Onboarding Types
 * Used for the initial questionnaire and onboarding flow
 */

/** Submitted from the questionnaire UI (industry comes from the tenant, set at registration). */
export interface QuestionnaireFormPayload {
  serviceDescription: string;
  targetClientType: string;
  typicalBudgetRange: string;
  commonClientQuestions: string[];
  yearsExperience?: number | null;
  certifications: string[];
  serviceArea: string;
  teamSize: string;
}

/** Full profile questionnaire input including industry (server merges tenant industry). */
export interface QuestionnaireData extends QuestionnaireFormPayload {
  industry: string;
}

export interface QuestionnaireValidationError {
  field: keyof QuestionnaireFormPayload | keyof QuestionnaireData;
  message: string;
}

export interface QuestionnaireValidation {
  isValid: boolean;
  errors: QuestionnaireValidationError[];
}

export type OnboardingStep = 'questionnaire' | 'simulations' | 'approval';
