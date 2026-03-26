'use client';

import { IndustryScenario, ScenarioSuggestion } from '@/lib/types/scenarios';
import ScenarioCard from './ScenarioCard';
import { Lightbulb } from 'lucide-react';

interface ScenarioSelectionProps {
  scenarios: IndustryScenario[];
  suggestion: ScenarioSuggestion | null;
  completedScenarios: string[];
  onSelect: (scenarioId: string) => void;
}

export default function ScenarioSelection({
  scenarios,
  suggestion,
  completedScenarios,
  onSelect,
}: ScenarioSelectionProps) {
  return (
    <div className="space-y-6">
      {suggestion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Recommended Next Scenario</h2>
              <p className="text-blue-800 mb-4">{suggestion.reason}</p>
              <ScenarioCard
                scenario={suggestion.scenario}
                onSelect={() => onSelect(suggestion.scenario.id)}
                isRecommended
                isCompleted={completedScenarios.includes(suggestion.scenario.id)}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Available Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios
            .filter((s) => s.id !== suggestion?.scenario.id)
            .map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={() => onSelect(scenario.id)}
                isCompleted={completedScenarios.includes(scenario.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
