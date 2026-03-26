'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionnaireForm from '@/components/onboarding/QuestionnaireForm';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { QuestionnaireData } from '@/lib/types/onboarding';
import { Card } from '@/components/ui/card';
import { authFetch } from '@/lib/api/auth-fetch';

export default function QuestionnairePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: QuestionnaireData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch('/api/v1/onboarding/questionnaire', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to save questionnaire');
      }

      const result = await response.json();
      router.push(
        result.suggestedScenario
          ? `/simulations/new?scenario=${result.suggestedScenario}`
          : '/simulations/new'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <OnboardingProgress currentStep="questionnaire" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tell us about your business</h1>
          <p className="mt-2 text-gray-600">
            This helps us create realistic practice scenarios tailored to your industry
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <Card className="p-8">
          <QuestionnaireForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This takes about 3 minutes. You can always update this information later.</p>
        </div>
      </div>
    </div>
  );
}
