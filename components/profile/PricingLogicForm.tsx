'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultiInputField from '@/components/onboarding/MultiInputField';

interface PricingLogicFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

export default function PricingLogicForm({ value, onChange }: PricingLogicFormProps) {
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Budget ($)</Label>
          <Input type="number" value={value.minBudget ?? ''} onChange={(e) => update('minBudget', e.target.value ? Number(e.target.value) : null)} placeholder="5000" />
        </div>
        <div>
          <Label>Max Budget ($)</Label>
          <Input type="number" value={value.maxBudget ?? ''} onChange={(e) => update('maxBudget', e.target.value ? Number(e.target.value) : null)} placeholder="50000" />
        </div>
      </div>
      <div>
        <Label>Flexibility Factors</Label>
        <p className="text-xs text-gray-500 mb-1">What makes you consider adjusting your price?</p>
        <MultiInputField values={value.flexibilityFactors ?? []} onChange={(v) => update('flexibilityFactors', v)} placeholder="e.g., Long-term client relationship" maxItems={10} addButtonText="Add Factor" />
      </div>
      <div>
        <Label>Deal-Breakers</Label>
        <p className="text-xs text-gray-500 mb-1">Budget-related reasons you decline a client</p>
        <MultiInputField values={value.dealBreakers ?? []} onChange={(v) => update('dealBreakers', v)} placeholder="e.g., Budget below $5k for this scope" maxItems={10} addButtonText="Add Deal-Breaker" />
      </div>
    </div>
  );
}
