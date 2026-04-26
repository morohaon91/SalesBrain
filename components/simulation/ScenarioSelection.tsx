'use client';

import ScenarioCard, { ScenarioCardData } from './ScenarioCard';
import { Lightbulb } from 'lucide-react';

export interface ScenarioSuggestionPayload {
  scenarioId: string;
  scenarioName: string;
  reason: string;
}

interface ScenarioSelectionProps {
  scenarios: ScenarioCardData[];
  suggestion: ScenarioSuggestionPayload | null;
  completedScenarios: string[];
  onSelect: (scenarioId: string) => void;
}

export default function ScenarioSelection({ scenarios, suggestion, completedScenarios, onSelect }: ScenarioSelectionProps) {
  const suggestedScenario = suggestion ? scenarios.find((s) => s.id === suggestion.scenarioId) : null;
  const sorted = [...scenarios].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  return (
    <div className="space-y-6">
      {suggestion && suggestedScenario && (
        <div className="rounded-xl p-6"
          style={{ background: 'rgba(200,136,26,0.06)', border: '1px solid rgba(200,136,26,0.2)' }}>
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: 'hsl(38,84%,61%)' }} />
            <div className="flex-1">
              <h2 className="text-base font-semibold mb-2" style={{ color: 'hsl(38,25%,90%)' }}>
                Recommended Next Scenario
              </h2>
              <p className="text-sm mb-4" style={{ color: 'hsl(228,12%,47%)' }}>{suggestion.reason}</p>
              <ScenarioCard
                scenario={suggestedScenario}
                onSelect={() => onSelect(suggestedScenario.id)}
                isRecommended
                isCompleted={completedScenarios.includes(suggestedScenario.id)}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(38,25%,90%)' }}>All Available Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted
            .filter((s) => s.id !== suggestion?.scenarioId)
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
