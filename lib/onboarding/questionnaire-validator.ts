import { QuestionnaireData, QuestionnaireValidation, QuestionnaireValidationError } from '@/lib/types/onboarding';
import { QuestionnaireDataSchema } from '@/lib/validation/business-profile-schemas';
import { ZodError } from 'zod';

export function validateQuestionnaireData(data: QuestionnaireData): QuestionnaireValidation {
  const errors: QuestionnaireValidationError[] = [];

  try {
    QuestionnaireDataSchema.parse(data);

    if (!data.commonClientQuestions || data.commonClientQuestions.length === 0) {
      errors.push({ field: 'commonClientQuestions', message: 'Please add at least one common client question' });
    }

    const uniqueQuestions = new Set(
      (data.commonClientQuestions || []).map((q) => q.toLowerCase().trim())
    );
    if (uniqueQuestions.size !== (data.commonClientQuestions || []).length) {
      errors.push({ field: 'commonClientQuestions', message: 'Duplicate questions detected' });
    }

    return { isValid: errors.length === 0, errors };
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach((err) => {
        errors.push({
          field: (err.path[0] as keyof QuestionnaireData) || 'industry',
          message: err.message,
        });
      });
    }
    return { isValid: false, errors };
  }
}
