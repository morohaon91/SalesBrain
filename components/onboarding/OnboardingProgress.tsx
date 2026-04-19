'use client';

import { Check } from 'lucide-react';
import { useMemo } from 'react';
import { useI18n } from '@/lib/hooks/useI18n';

interface OnboardingProgressProps {
  currentStep: 'questionnaire' | 'simulations' | 'approval';
}

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const { t } = useI18n('onboarding');
  const steps = useMemo(
    () =>
      [
        {
          id: 'questionnaire' as const,
          label: t('progress.questionnaireLabel'),
          description: t('progress.questionnaireDesc'),
        },
        {
          id: 'simulations' as const,
          label: t('progress.simulationsLabel'),
          description: t('progress.simulationsDesc'),
        },
        {
          id: 'approval' as const,
          label: t('progress.approvalLabel'),
          description: t('progress.approvalDesc'),
        },
      ] as const,
    [t]
  );

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                    isComplete ? 'bg-success-500 text-white' : '',
                    isCurrent ? 'bg-primary-500 text-white ring-2 ring-primary-200 ring-offset-2' : '',
                    isUpcoming ? 'bg-gray-200 text-gray-500' : '',
                  ].join(' ')}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <div className="mt-2 text-center px-1">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-primary-700' : 'text-gray-800'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 leading-snug">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={[
                    'flex-1 h-1 mx-2 sm:mx-4 -mt-12 rounded-full transition-colors',
                    index < currentIndex ? 'bg-success-500' : 'bg-gray-200',
                  ].join(' ')}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
