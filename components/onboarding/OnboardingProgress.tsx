'use client';

import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: 'questionnaire' | 'simulations' | 'approval';
}

const STEPS = [
  { id: 'questionnaire', label: 'Business Info', description: 'Tell us about yourself' },
  { id: 'simulations', label: 'Practice Scenarios', description: 'Train your AI' },
  { id: 'approval', label: 'Go Live', description: 'Approve and activate' },
];

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
                    isComplete ? 'bg-green-500 text-white' : '',
                    isCurrent ? 'bg-blue-500 text-white' : '',
                    isUpcoming ? 'bg-gray-200 text-gray-500' : '',
                  ].join(' ')}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={[
                    'flex-1 h-1 mx-4 -mt-12',
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200',
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
