'use client';

import { useState } from 'react';
import { QuestionnaireData } from '@/lib/types/onboarding';
import { validateQuestionnaireData } from '@/lib/onboarding/questionnaire-validator';
import IndustrySelect from './IndustrySelect';
import MultiInputField from './MultiInputField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface QuestionnaireFormProps {
  onSubmit: (data: QuestionnaireData) => void;
  isSubmitting: boolean;
}

export default function QuestionnaireForm({ onSubmit, isSubmitting }: QuestionnaireFormProps) {
  const [formData, setFormData] = useState<Partial<QuestionnaireData>>({
    commonClientQuestions: [],
    certifications: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof QuestionnaireData, value: unknown) => {
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
    const validation = validateQuestionnaireData(formData as QuestionnaireData);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err) => { errorMap[err.field] = err.message; });
      setErrors(errorMap);
      return;
    }
    onSubmit(formData as QuestionnaireData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Basic Business Info */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Basic Business Information</h2>

        <div>
          <Label>Industry <span className="text-red-500">*</span></Label>
          <p className="text-sm text-gray-500 mb-2">This determines which practice scenarios you'll get</p>
          <IndustrySelect
            value={formData.industry || ''}
            onChange={(v) => handleChange('industry', v)}
            error={errors.industry}
          />
        </div>

        <div>
          <Label htmlFor="serviceDescription">Service Description <span className="text-red-500">*</span></Label>
          <p className="text-sm text-gray-500 mb-2">What services do you provide?</p>
          <Textarea
            id="serviceDescription"
            placeholder="e.g., Kitchen and bathroom remodeling, custom cabinetry, general contracting for residential projects"
            value={formData.serviceDescription || ''}
            onChange={(e) => handleChange('serviceDescription', e.target.value)}
            rows={4}
            className={errors.serviceDescription ? 'border-red-500' : ''}
          />
          {errors.serviceDescription && <p className="text-sm text-red-600 mt-1">{errors.serviceDescription}</p>}
        </div>

        <div>
          <Label htmlFor="targetClientType">Target Client Type <span className="text-red-500">*</span></Label>
          <p className="text-sm text-gray-500 mb-2">Who do you typically work with?</p>
          <Input
            id="targetClientType"
            placeholder="e.g., Homeowners, property investors, commercial clients"
            value={formData.targetClientType || ''}
            onChange={(e) => handleChange('targetClientType', e.target.value)}
            className={errors.targetClientType ? 'border-red-500' : ''}
          />
          {errors.targetClientType && <p className="text-sm text-red-600 mt-1">{errors.targetClientType}</p>}
        </div>

        <div>
          <Label htmlFor="typicalBudgetRange">Typical Budget Range <span className="text-red-500">*</span></Label>
          <p className="text-sm text-gray-500 mb-2">What's your typical project budget range?</p>
          <Input
            id="typicalBudgetRange"
            placeholder="e.g., $20k-$50k, $100k+"
            value={formData.typicalBudgetRange || ''}
            onChange={(e) => handleChange('typicalBudgetRange', e.target.value)}
            className={errors.typicalBudgetRange ? 'border-red-500' : ''}
          />
          {errors.typicalBudgetRange && <p className="text-sm text-red-600 mt-1">{errors.typicalBudgetRange}</p>}
        </div>

        <div>
          <Label>Common Client Questions <span className="text-red-500">*</span></Label>
          <p className="text-sm text-gray-500 mb-2">What do clients usually ask you?</p>
          <MultiInputField
            values={formData.commonClientQuestions || []}
            onChange={(v) => handleChange('commonClientQuestions', v)}
            placeholder="e.g., 'Do you handle permits?', 'How long does a kitchen take?'"
            maxItems={10}
            minItems={1}
            addButtonText="Add Question"
          />
          {errors.commonClientQuestions && <p className="text-sm text-red-600 mt-1">{errors.commonClientQuestions}</p>}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Section 2: Business Facts */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Business Facts</h2>
          <p className="text-sm text-gray-600">This information helps create more realistic practice scenarios</p>
        </div>

        <div>
          <Label htmlFor="yearsExperience">Years of Experience</Label>
          <Input
            id="yearsExperience"
            type="number"
            min="0"
            max="100"
            placeholder="15"
            value={formData.yearsExperience ?? ''}
            onChange={(e) => handleChange('yearsExperience', e.target.value ? parseInt(e.target.value) : null)}
            className={errors.yearsExperience ? 'border-red-500' : ''}
          />
          {errors.yearsExperience && <p className="text-sm text-red-600 mt-1">{errors.yearsExperience}</p>}
        </div>

        <div>
          <Label>Certifications / Licenses</Label>
          <p className="text-sm text-gray-500 mb-2">Optional but helps establish credibility</p>
          <MultiInputField
            values={formData.certifications || []}
            onChange={(v) => handleChange('certifications', v)}
            placeholder="e.g., Licensed General Contractor - California"
            maxItems={20}
            addButtonText="Add Certification"
          />
          {errors.certifications && <p className="text-sm text-red-600 mt-1">{errors.certifications}</p>}
        </div>

        <div>
          <Label htmlFor="serviceArea">Service Area <span className="text-red-500">*</span></Label>
          <Input
            id="serviceArea"
            placeholder="e.g., San Francisco Bay Area"
            value={formData.serviceArea || ''}
            onChange={(e) => handleChange('serviceArea', e.target.value)}
            className={errors.serviceArea ? 'border-red-500' : ''}
          />
          {errors.serviceArea && <p className="text-sm text-red-600 mt-1">{errors.serviceArea}</p>}
        </div>

        <div>
          <Label htmlFor="teamSize">Team Size <span className="text-red-500">*</span></Label>
          <Select
            value={formData.teamSize || ''}
            onChange={(e) => handleChange('teamSize', e.target.value)}
            placeholder="Select team size"
            options={[
              { value: 'Solo', label: 'Solo (just me)' },
              { value: '2-5', label: '2-5 people' },
              { value: '6-10', label: '6-10 people' },
              { value: '10+', label: '10+ people' },
            ]}
            className={errors.teamSize ? 'border-red-500' : ''}
          />
          {errors.teamSize && <p className="text-sm text-red-600 mt-1">{errors.teamSize}</p>}
        </div>
      </div>

      <div className="pt-6">
        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Saving...' : 'Continue to Practice Simulations'}
        </Button>
      </div>
    </form>
  );
}
