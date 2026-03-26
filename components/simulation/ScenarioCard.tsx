'use client';

import { IndustryScenario } from '@/lib/types/scenarios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Target } from 'lucide-react';

interface ScenarioCardProps {
  scenario: IndustryScenario;
  onSelect: () => void;
  isRecommended?: boolean;
  isCompleted?: boolean;
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export default function ScenarioCard({ scenario, onSelect, isRecommended, isCompleted }: ScenarioCardProps) {
  return (
    <Card
      className={[
        'p-6 transition-shadow',
        isCompleted ? 'opacity-60' : 'hover:shadow-lg',
        isRecommended ? 'ring-2 ring-blue-500' : '',
      ].join(' ')}
    >
      {isRecommended && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
            Recommended
          </span>
        </div>
      )}
      {isCompleted && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded-full">
            Completed
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{scenario.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{scenario.teaser}</p>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {scenario.estimatedDuration}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${DIFFICULTY_COLORS[scenario.difficulty]}`}>
          {scenario.difficulty}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <Target className="h-4 w-4" />
          <span className="font-medium">What you'll practice:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {scenario.focusAreas.slice(0, 3).map((area, i) => (
            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {area.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <Button
        onClick={onSelect}
        className="w-full"
        variant={isRecommended ? 'default' : 'outline'}
        disabled={isCompleted}
      >
        {isCompleted ? 'Already Completed' : 'Start Simulation'}
      </Button>
    </Card>
  );
}
