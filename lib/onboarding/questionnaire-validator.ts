import {
  QuestionnaireFormPayload,
  QuestionnaireValidation,
  QuestionnaireValidationError,
} from '@/lib/types/onboarding';
import { QuestionnairePayloadSchema } from '@/lib/validation/business-profile-schemas';
import { ZodError, ZodTypeAny } from 'zod';

export type ValidateQuestionnaireOptions = {
  /** Defaults to {@link QuestionnairePayloadSchema} (English API messages). */
  schema?: ZodTypeAny;
  duplicateQuestions?: string;
  addOneQuestion?: string;
};

export type QuestionnaireValidationResult = QuestionnaireValidation & {
  parsed?: QuestionnaireFormPayload;
};

export function validateQuestionnairePayload(
  data: unknown,
  options?: ValidateQuestionnaireOptions
): QuestionnaireValidationResult {
  const errors: QuestionnaireValidationError[] = [];
  const schema = options?.schema ?? QuestionnairePayloadSchema;

  try {
    const parsed = schema.parse(data) as QuestionnaireFormPayload;

    if (!parsed.commonClientQuestions || parsed.commonClientQuestions.length === 0) {
      errors.push({
        field: 'commonClientQuestions',
        message: options?.addOneQuestion ?? 'Please add at least one common client question',
      });
    }

    const uniqueQuestions = new Set(
      (parsed.commonClientQuestions || []).map((q) => q.toLowerCase().trim())
    );
    if (uniqueQuestions.size !== (parsed.commonClientQuestions || []).length) {
      errors.push({
        field: 'commonClientQuestions',
        message: options?.duplicateQuestions ?? 'Duplicate questions detected',
      });
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [], parsed };
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach((err) => {
        errors.push({
          field: (err.path[0] as keyof QuestionnaireFormPayload) || 'serviceDescription',
          message: err.message,
        });
      });
    }
    return { isValid: false, errors };
  }
}

/** @deprecated Use {@link validateQuestionnairePayload} */
export const validateQuestionnaireData = validateQuestionnairePayload;
