'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface PatternReviewCardProps {
  section: string;
  data: Record<string, unknown>;
  onApprove?: () => void;
  onReject?: () => void;
}

function extractLabel(obj: Record<string, unknown>): string {
  const labelKeys = ['rule', 'objectionType', 'flagType', 'type', 'name', 'signal', 'phrase'];
  for (const k of labelKeys) {
    if (typeof obj[k] === 'string') return obj[k] as string;
  }
  const firstStr = Object.values(obj).find((v) => typeof v === 'string');
  return typeof firstStr === 'string' ? firstStr : '—';
}

function renderValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) {
    if (val.length === 0) return '—';
    return val
      .map((item) =>
        item !== null && typeof item === 'object'
          ? extractLabel(item as Record<string, unknown>)
          : String(item)
      )
      .join(', ');
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && (v as unknown[]).length === 0))
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, ' $1').toLowerCase();
        let display: string;
        if (typeof v === 'boolean') display = v ? 'yes' : 'no';
        else if (Array.isArray(v)) display = (v as unknown[]).map(String).join(', ');
        else display = String(v);
        return `${label}: ${display}`;
      });
    return entries.join(' · ') || '—';
  }
  return String(val);
}

const SECTION_LABELS: Record<string, string> = {
  communicationStyle: 'Communication Style',
  pricingLogic: 'Pricing Logic',
  qualificationCriteria: 'Qualification Criteria',
  objectionHandling: 'Objection Handling',
  decisionMakingPatterns: 'Decision Making',
};

export default function PatternReviewCard({ section, data, onApprove, onReject }: PatternReviewCardProps) {
  const relevantKeys = Object.entries(data).filter(
    ([key]) => !['confidence', 'conversationQuality', 'extractionNotes'].includes(key)
  );

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{SECTION_LABELS[section] ?? section}</h3>
        {(onApprove || onReject) && (
          <div className="flex gap-2">
            {onApprove && (
              <Button size="sm" variant="outline" className="text-green-600 border-green-300" onClick={onApprove}>
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={onReject}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {relevantKeys.map(([key, val]) => (
          <div key={key} className="flex gap-3">
            <span className="text-xs text-gray-500 capitalize w-32 flex-shrink-0 pt-0.5">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
            <span className="text-sm text-gray-800">{renderValue(val)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
