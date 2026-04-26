'use client';

import { CheckCircle } from 'lucide-react';

interface PatternDemonstratedProps {
  patterns: string[];
}

const PATTERN_LABELS: Record<string, string> = {
  pricing_flexibility: 'Pricing Flexibility',
  timeline_handling: 'Timeline Management',
  objection_price: 'Price Objection Handling',
  qualification_budget: 'Budget Qualification',
  communication_educational: 'Clear Communication',
  scope_boundaries: 'Scope Management',
  qualification_criteria: 'Qualification Criteria',
  decision_making: 'Decision Making',
};

export default function PatternDemonstrated({ patterns }: PatternDemonstratedProps) {
  if (patterns.length === 0) {
    return <p className="text-sm" style={{ color: 'hsl(228,12%,47%)' }}>No specific patterns were detected in this simulation.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {patterns.map((pattern, i) => (
        <div key={i} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-900 font-medium">
            {PATTERN_LABELS[pattern] ?? pattern.replace(/_/g, ' ')}
          </span>
        </div>
      ))}
    </div>
  );
}
