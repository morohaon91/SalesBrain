'use client';

import { useCallback, useMemo, useState } from 'react';
import { QuestionnaireFormPayload } from '@/lib/types/onboarding';
import { validateQuestionnairePayload } from '@/lib/onboarding/questionnaire-validator';
import { createQuestionnairePayloadSchema } from '@/lib/validation/business-profile-schemas';
import { getQuestionnairePlaceholderSlug } from '@/lib/onboarding/questionnaire-placeholder-slug';
import MultiInputField from './MultiInputField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useI18n } from '@/lib/hooks/useI18n';

type PlaceholderField =
  | 'serviceDescription'
  | 'targetClient'
  | 'budget'
  | 'commonQuestions'
  | 'certifications'
  | 'serviceArea';

interface QuestionnaireFormProps {
  /** From tenant (registration); drives example copy under `placeholders.<slug>.*`. */
  tenantIndustry: string | null;
  onSubmit: (data: QuestionnaireFormPayload) => void;
  isSubmitting: boolean;
}

export default function QuestionnaireForm({
  tenantIndustry,
  onSubmit,
  isSubmitting,
}: QuestionnaireFormProps) {
  const { t } = useI18n('onboarding');
  const placeholderSlug = useMemo(
    () => getQuestionnairePlaceholderSlug(tenantIndustry),
    [tenantIndustry]
  );
  const ph = useCallback(
    (field: PlaceholderField) => t(`placeholders.${placeholderSlug}.${field}`),
    [t, placeholderSlug]
  );
  const [formData, setFormData] = useState<Partial<QuestionnaireFormPayload>>({
    commonClientQuestions: [],
    certifications: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = useMemo(() => createQuestionnairePayloadSchema(t), [t]);

  const handleChange = (field: keyof QuestionnaireFormPayload, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateQuestionnairePayload(formData, {
      schema,
      duplicateQuestions: t('validation.duplicateQuestions'),
      addOneQuestion: t('validation.addOneQuestion'),
    });
    if (!validation.isValid || !validation.parsed) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errorMap[err.field as string] = err.message;
      });
      setErrors(errorMap);
      return;
    }
    onSubmit(validation.parsed);
  };

  const teamOptions = [
    { value: 'Solo', label: t('form.teamSolo') },
    { value: '2-5', label: t('form.team25') },
    { value: '6-10', label: t('form.team610') },
    { value: '10+', label: t('form.team10plus') },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">{t('form.sectionBasic')}</h2>

        <p className="text-sm rounded-lg border border-gray-200 bg-gray-50/90 text-gray-600 px-4 py-3">
          {t('form.industryFromAccount')}
        </p>

        <div>
          <Label htmlFor="serviceDescription">
            {t('form.serviceDescriptionLabel')} <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">{t('form.serviceDescriptionHint')}</p>
          <Textarea
            id="serviceDescription"
            placeholder={ph('serviceDescription')}
            value={formData.serviceDescription || ''}
            onChange={(e) => handleChange('serviceDescription', e.target.value)}
            rows={4}
            className={errors.serviceDescription ? 'border-red-500' : ''}
          />
          {errors.serviceDescription && (
            <p className="text-sm text-red-600 mt-1">{errors.serviceDescription}</p>
          )}
        </div>

        <div>
          <Label htmlFor="targetClientType">
            {t('form.targetClientLabel')} <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">{t('form.targetClientHint')}</p>
          <Input
            id="targetClientType"
            placeholder={ph('targetClient')}
            value={formData.targetClientType || ''}
            onChange={(e) => handleChange('targetClientType', e.target.value)}
            className={errors.targetClientType ? 'border-red-500' : ''}
          />
          {errors.targetClientType && (
            <p className="text-sm text-red-600 mt-1">{errors.targetClientType}</p>
          )}
        </div>

        <div>
          <Label htmlFor="typicalBudgetRange">
            {t('form.budgetLabel')} <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">{t('form.budgetHint')}</p>
          <Input
            id="typicalBudgetRange"
            placeholder={ph('budget')}
            value={formData.typicalBudgetRange || ''}
            onChange={(e) => handleChange('typicalBudgetRange', e.target.value)}
            className={errors.typicalBudgetRange ? 'border-red-500' : ''}
          />
          {errors.typicalBudgetRange && (
            <p className="text-sm text-red-600 mt-1">{errors.typicalBudgetRange}</p>
          )}
        </div>

        <div>
          <Label>
            {t('form.commonQuestionsLabel')} <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">{t('form.commonQuestionsHint')}</p>
          <MultiInputField
            values={formData.commonClientQuestions || []}
            onChange={(v) => handleChange('commonClientQuestions', v)}
            placeholder={ph('commonQuestions')}
            maxItems={10}
            minItems={1}
            addButtonText={t('form.addQuestion')}
          />
          {errors.commonClientQuestions && (
            <p className="text-sm text-red-600 mt-1">{errors.commonClientQuestions}</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('form.sectionFacts')}</h2>
          <p className="text-sm text-gray-600">{t('form.factsIntro')}</p>
        </div>

        <div>
          <Label htmlFor="yearsExperience">{t('form.yearsExperience')}</Label>
          <Input
            id="yearsExperience"
            type="number"
            min="0"
            max="100"
            placeholder={t('form.yearsExperiencePlaceholder')}
            value={formData.yearsExperience ?? ''}
            onChange={(e) =>
              handleChange('yearsExperience', e.target.value ? parseInt(e.target.value, 10) : null)
            }
            className={errors.yearsExperience ? 'border-red-500' : ''}
          />
          {errors.yearsExperience && (
            <p className="text-sm text-red-600 mt-1">{errors.yearsExperience}</p>
          )}
        </div>

        <div>
          <Label>{t('form.certificationsLabel')}</Label>
          <p className="text-sm text-gray-500 mb-2">{t('form.certificationsHint')}</p>
          <MultiInputField
            values={formData.certifications || []}
            onChange={(v) => handleChange('certifications', v)}
            placeholder={ph('certifications')}
            maxItems={20}
            addButtonText={t('form.addCertification')}
          />
          {errors.certifications && (
            <p className="text-sm text-red-600 mt-1">{errors.certifications}</p>
          )}
        </div>

        <div>
          <Label htmlFor="serviceArea">
            {t('form.serviceAreaLabel')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="serviceArea"
            placeholder={ph('serviceArea')}
            value={formData.serviceArea || ''}
            onChange={(e) => handleChange('serviceArea', e.target.value)}
            className={errors.serviceArea ? 'border-red-500' : ''}
          />
          {errors.serviceArea && <p className="text-sm text-red-600 mt-1">{errors.serviceArea}</p>}
        </div>

        <div>
          <Label htmlFor="teamSize">
            {t('form.teamSizeLabel')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.teamSize || ''}
            onChange={(e) => handleChange('teamSize', e.target.value)}
            placeholder={t('form.teamSizePlaceholder')}
            options={teamOptions}
            className={errors.teamSize ? 'border-red-500' : ''}
          />
          {errors.teamSize && <p className="text-sm text-red-600 mt-1">{errors.teamSize}</p>}
        </div>
      </div>

      <div className="pt-6">
        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? t('form.saving') : t('form.continueButton')}
        </Button>
      </div>
    </form>
  );
}
