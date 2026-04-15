'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle } from 'lucide-react';

export interface ScenarioCardData {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  isMandatory?: boolean;
  isCompleted?: boolean;
  orderIndex?: number;
  scenarioType?: string;
}

interface ScenarioCardProps {
  scenario: ScenarioCardData;
  onSelect: () => void;
  isRecommended?: boolean;
  isCompleted?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export default function ScenarioCard({ scenario, onSelect, isRecommended, isCompleted }: ScenarioCardProps) {
  const completed = isCompleted ?? scenario.isCompleted;
  return (
    <Card
      className={[
        'p-6 transition-shadow',
        completed ? 'opacity-60' : 'hover:shadow-lg',
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
      {completed && (
        <div className="mb-3 flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-gray-500" />
          <span className="inline-block px-3 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded-full">
            Completed
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{scenario.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          ~{scenario.estimatedDuration} min
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${DIFFICULTY_COLORS[scenario.difficulty] ?? ''}`}>
          {scenario.difficulty}
        </span>
        {scenario.isMandatory && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">Required</span>
        )}
      </div>

      <Button
        onClick={onSelect}
        className="w-full"
        variant={isRecommended ? 'default' : 'outline'}
        disabled={completed}
      >
        {completed ? 'Already Completed' : 'Start Simulation'}
      </Button>
    </Card>
  );
}
