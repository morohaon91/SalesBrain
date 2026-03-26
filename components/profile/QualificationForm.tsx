'use client';

import { Label } from '@/components/ui/label';
import MultiInputField from '@/components/onboarding/MultiInputField';

interface QualificationFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

export default function QualificationForm({ value, onChange }: QualificationFormProps) {
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });

  return (
    <div className="space-y-4">
      <div>
        <Label>Must-Haves</Label>
        <p className="text-xs text-gray-500 mb-1">Requirements clients must have to work with you</p>
        <MultiInputField values={value.mustHaves ?? []} onChange={(v) => update('mustHaves', v)} placeholder="e.g., Serious about the project timeline" maxItems={10} addButtonText="Add Requirement" />
      </div>
      <div>
        <Label>Green Flags</Label>
        <p className="text-xs text-gray-500 mb-1">Client behaviors that excite you</p>
        <MultiInputField values={value.greenFlags ?? []} onChange={(v) => update('greenFlags', v)} placeholder="e.g., Has clear vision and realistic budget" maxItems={10} addButtonText="Add Green Flag" />
      </div>
      <div>
        <Label>Deal-Breakers</Label>
        <p className="text-xs text-gray-500 mb-1">Reasons you would decline a client</p>
        <MultiInputField values={value.dealBreakers ?? []} onChange={(v) => update('dealBreakers', v)} placeholder="e.g., Wants to cut corners on safety" maxItems={10} addButtonText="Add Deal-Breaker" />
      </div>
      <div>
        <Label>Red Flags</Label>
        <p className="text-xs text-gray-500 mb-1">Warning signs that make you cautious</p>
        <MultiInputField values={value.redFlags ?? []} onChange={(v) => update('redFlags', v)} placeholder="e.g., Unrealistic expectations from the start" maxItems={10} addButtonText="Add Red Flag" />
      </div>
    </div>
  );
}
