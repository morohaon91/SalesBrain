'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, AlertCircle } from 'lucide-react';

const scenarios = [
  {
    id: 'PRICE_SENSITIVE',
    name: 'Price-Sensitive Client',
    description:
      'Client is cost-conscious and always looking for deals. Tests your pricing flexibility and value proposition.',
    characteristics: [
      'Asks about discounts',
      'Compares prices with competitors',
      'Wants payment terms',
      'Budget-focused questions',
    ],
  },
  {
    id: 'INDECISIVE',
    name: 'Indecisive Client',
    description:
      'Client struggles with decision-making and needs reassurance. Tests your ability to build confidence and guide decisions.',
    characteristics: [
      'Asks many "what if" questions',
      'Requests multiple options',
      'Seeks external validation',
      'Fear of commitment',
    ],
  },
  {
    id: 'DEMANDING',
    name: 'Demanding Client',
    description:
      'Client has high expectations and needs constant reassurance. Tests your ability to set boundaries and manage expectations.',
    characteristics: [
      'Wants custom solutions',
      'Questions everything',
      'Requires frequent updates',
      'High maintenance',
    ],
  },
  {
    id: 'TIME_CONSTRAINED',
    name: 'Time-Pressured Client',
    description:
      'Client is in a hurry and needs quick results. Tests your ability to handle urgency and deliver fast.',
    characteristics: [
      'Needs immediate solutions',
      'Tight deadlines',
      'Fast decision-making',
      'Quick implementation',
    ],
  },
  {
    id: 'BUDGET_FOCUSED',
    name: 'High-Budget Client',
    description:
      'Client has significant budget but wants maximum ROI. Tests your ability to deliver premium value and manage expectations.',
    characteristics: [
      'Expects premium service',
      'ROI-focused questions',
      'Higher expectations',
      'Detailed requirements',
    ],
  },
];

/**
 * Scenario Card Component
 */
function ScenarioCard({
  scenario,
  isSelected,
  isLoading,
  onSelect,
}: {
  scenario: (typeof scenarios)[0];
  isSelected: boolean;
  isLoading: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-600 bg-primary-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-primary-300'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{scenario.name}</h3>
      <p className="text-sm text-gray-600 mt-2">{scenario.description}</p>

      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium text-gray-600">Characteristics:</p>
        <ul className="space-y-1">
          {scenario.characteristics.map((char, idx) => (
            <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              {char}
            </li>
          ))}
        </ul>
      </div>

      {isSelected && (
        <div className="mt-4 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full inline-block">
          Selected
        </div>
      )}
    </div>
  );
}

/**
 * New Simulation page
 */
export default function NewSimulationPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start simulation mutation
  const startSimulation = useMutation({
    mutationFn: (scenarioType: string) =>
      api.simulations.start({ scenarioType }),
    onSuccess: (data: any) => {
      const simulationId = data.data?.simulationId || data.data?.id;
      if (simulationId) {
        router.push(`/simulations/${simulationId}`);
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to start simulation';
      setError(message);
    },
  });

  const handleStartSimulation = () => {
    if (selectedScenario) {
      setError(null);
      startSimulation.mutate(selectedScenario);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Start New Simulation</h1>
        <p className="text-gray-600 mt-2">
          Choose a scenario to practice your client handling skills
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-900">
          <strong>How it works:</strong> You'll have a conversation with an AI
          client based on the scenario you choose. The AI will respond to your
          messages naturally, and the system will learn from your responses.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-900">Failed to start simulation</p>
            <p className="text-sm text-danger-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            isSelected={selectedScenario === scenario.id}
            isLoading={startSimulation.isPending}
            onSelect={() => {
              if (!startSimulation.isPending) {
                setSelectedScenario(scenario.id);
              }
            }}
          />
        ))}
      </div>

      {/* Start Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleStartSimulation}
          disabled={!selectedScenario || startSimulation.isPending}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-base h-auto"
        >
          {startSimulation.isPending ? (
            <>
              <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <BrainCircuit className="w-5 h-5 mr-2" />
              Start Simulation
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tips */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="text-primary-600 font-bold">1.</span>
              <span>Be natural and conversational - treat it like a real call</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600 font-bold">2.</span>
              <span>Try different approaches - test your strategies</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600 font-bold">3.</span>
              <span>Don't worry about perfection - the AI will adapt</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600 font-bold">4.</span>
              <span>Complete multiple simulations for better results</span>
            </li>
          </ul>
        </div>

        {/* Duration Estimate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Typical length:</p>
              <p className="text-2xl font-bold text-gray-900">15-20 min</p>
              <p className="text-xs text-gray-500 mt-1">
                (You can take as long as you want)
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Can pause anytime:</p>
              <p className="text-sm text-primary-600 font-medium">Yes, save and resume later</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Will my responses be recorded?
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Yes, all conversations are saved so the system can learn your
              business patterns over time.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              Can I do multiple simulations?
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Yes, and you should! More simulations = better AI training.
              We recommend at least 3-5 per scenario.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              What if I make mistakes?
            </p>
            <p className="text-sm text-gray-600 mt-1">
              That's the point! Use simulations to practice and find what works
              best for your style.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
