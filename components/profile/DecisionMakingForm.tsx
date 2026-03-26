'use client';

import { Label } from '@/components/ui/label';
import MultiInputField from '@/components/onboarding/MultiInputField';

interface DecisionMakingFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

export default function DecisionMakingForm({ value, onChange }: DecisionMakingFormProps) {
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });

  return (
    <div className="space-y-4">
      <div>
        <Label>When You Say Yes</Label>
        <p className="text-xs text-gray-500 mb-1">Conditions under which you accept a client/project</p>
        <MultiInputField values={value.whenToSayYes ?? []} onChange={(v) => update('whenToSayYes', v)} placeholder="e.g., Client has clear goals and realistic budget" maxItems={10} addButtonText="Add Condition" />
      </div>
      <div>
        <Label>When You Say No</Label>
        <p className="text-xs text-gray-500 mb-1">Conditions under which you decline a client/project</p>
        <MultiInputField values={value.whenToSayNo ?? []} onChange={(v) => update('whenToSayNo', v)} placeholder="e.g., Client wants to start but has no budget confirmed" maxItems={10} addButtonText="Add Condition" />
      </div>
      <div>
        <Label>Warning Signs</Label>
        <p className="text-xs text-gray-500 mb-1">Things that make you pause and ask more questions</p>
        <MultiInputField values={value.warningSignsToWatch ?? []} onChange={(v) => update('warningSignsToWatch', v)} placeholder="e.g., Client dismisses every question about budget" maxItems={10} addButtonText="Add Warning Sign" />
      </div>
    </div>
  );
}
