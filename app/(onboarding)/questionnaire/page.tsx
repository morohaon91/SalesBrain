'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionnaireForm from '@/components/onboarding/QuestionnaireForm';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { QuestionnaireFormPayload } from '@/lib/types/onboarding';
import { Card } from '@/components/ui/card';
import { authFetch } from '@/lib/api/auth-fetch';
import { useI18n } from '@/lib/hooks/useI18n';
import { Loader2 } from 'lucide-react';

export default function QuestionnairePage() {
  const router = useRouter();
  const { t } = useI18n('onboarding');
  const [tenantIndustry, setTenantIndustry] = useState<string | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch('/api/v1/onboarding/status');
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (cancelled || !json?.success) return;
        setTenantIndustry(json.data?.tenantIndustry ?? null);
      } catch {
        if (!cancelled) setTenantIndustry(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (data: QuestionnaireFormPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authFetch('/api/v1/onboarding/questionnaire', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.code === 'MISSING_INDUSTRY') {
          throw new Error(t('questionnaire.missingIndustry'));
        }
        throw new Error(errorData.error?.message || t('questionnaire.submitError'));
      }

      const result = await response.json();
      router.push(
        result.suggestedScenario
          ? `/simulations/new?scenario=${result.suggestedScenario}`
          : '/simulations/new'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('questionnaire.genericError'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <OnboardingProgress currentStep="questionnaire" />

      <div className="text-center mb-8">
        <h1 className="text-display text-gray-900">{t('questionnaire.pageTitle')}</h1>
        <p className="mt-2 text-gray-600 max-w-xl mx-auto">{t('questionnaire.pageSubtitle')}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-sm text-danger-900">{error}</p>
        </div>
      )}

      <Card className="p-6 sm:p-8 shadow-sm border-gray-200/80">
        {tenantIndustry === undefined ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" aria-hidden />
            <span className="text-sm">{t('questionnaire.loadingExamples')}</span>
          </div>
        ) : (
          <QuestionnaireForm
            tenantIndustry={tenantIndustry}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>{t('questionnaire.footer')}</p>
      </div>
    </div>
  );
}
