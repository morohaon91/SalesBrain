'use client';

import { Progress } from '@/components/ui/progress';
import { CompletionBreakdown } from '@/lib/utils/profile-completion';

interface ProfileProgressProps {
  breakdown: CompletionBreakdown;
  showDetails?: boolean;
}

const SECTIONS = [
  { key: 'questionnaire', label: 'Business Info', max: 20 },
  { key: 'communicationStyle', label: 'Communication Style', max: 15 },
  { key: 'pricingLogic', label: 'Pricing Logic', max: 15 },
  { key: 'qualificationCriteria', label: 'Qualification Criteria', max: 15 },
  { key: 'objectionHandling', label: 'Objection Handling', max: 15 },
  { key: 'decisionMaking', label: 'Decision Making', max: 10 },
  { key: 'businessFacts', label: 'Business Facts', max: 10 },
] as const;

export default function ProfileProgress({ breakdown, showDetails = false }: ProfileProgressProps) {
  const total = breakdown.total;
  const color = total >= 70 ? 'text-green-600' : total >= 40 ? 'text-yellow-600' : 'text-orange-600';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
        <span className={`text-2xl font-bold ${color}`}>{total}%</span>
      </div>
      <Progress value={total} className="h-3" />
      {total < 70 && (
        <p className="text-xs text-gray-500">{70 - total}% more needed to go live</p>
      )}
      {total >= 70 && (
        <p className="text-xs text-green-600 font-medium">Ready to review and go live!</p>
      )}

      {showDetails && (
        <div className="space-y-2 mt-4">
          {SECTIONS.map(({ key, label, max }) => {
            const value = breakdown[key];
            const pct = Math.round((value / max) * 100);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-40 flex-shrink-0">{label}</span>
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="text-xs text-gray-500 w-12 text-right">{value}/{max}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
