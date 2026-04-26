'use client';

import { Button } from '@/components/ui/button';
import { Clock, CheckCircle } from 'lucide-react';

export interface ScenarioCardData {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
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

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string }> = {
  beginner: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80' },
  intermediate: { bg: 'rgba(200,136,26,0.12)', color: 'hsl(38,84%,61%)' },
  advanced: { bg: 'rgba(249,115,22,0.12)', color: '#fb923c' },
};

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
};

export default function ScenarioCard({ scenario, onSelect, isRecommended, isCompleted }: ScenarioCardProps) {
  const completed = isCompleted ?? scenario.isCompleted;
  const diffStyle = DIFFICULTY_STYLE[scenario.difficulty] ?? { bg: 'rgba(255,255,255,0.06)', color: C.muted };

  return (
    <div
      className="rounded-xl p-6 transition-all duration-150"
      style={{
        background: C.card,
        border: `1px solid ${isRecommended ? 'rgba(200,136,26,0.3)' : C.border}`,
        opacity: completed ? 0.65 : 1,
      }}
    >
      {isRecommended && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(200,136,26,0.15)', color: 'hsl(38,84%,61%)' }}>
            ✦ Recommended
          </span>
        </div>
      )}
      {completed && (
        <div className="mb-3 flex items-center gap-1">
          <CheckCircle className="h-4 w-4" style={{ color: '#4ade80' }} />
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
            Completed
          </span>
        </div>
      )}

      <h3 className="text-base font-semibold mb-2" style={{ color: C.fg }}>{scenario.name}</h3>
      <p className="text-sm mb-4" style={{ color: C.muted }}>{scenario.description}</p>

      <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: C.muted }}>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          ~{scenario.estimatedDuration} min
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-medium" style={diffStyle}>
          {scenario.difficulty}
        </span>
        {scenario.isMandatory && (
          <span className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: 'rgba(200,136,26,0.1)', color: 'hsl(38,84%,61%)' }}>
            Required
          </span>
        )}
      </div>

      <Button onClick={onSelect} className="w-full" variant={completed ? 'outline' : 'default'} disabled={completed}>
        {completed ? 'Already Completed' : 'Start Simulation'}
      </Button>
    </div>
  );
}
