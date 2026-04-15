'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
          <Label>Minimum Budget ($)</Label>
          <Input
            type="number"
            value={value.minimumBudget ?? ''}
            onChange={(e) => update('minimumBudget', e.target.value ? Number(e.target.value) : null)}
            placeholder="5000"
          />
        </div>
        <div>
          <Label>Preferred Budget Range</Label>
          <Input
            value={value.preferredBudgetRange ?? ''}
            onChange={(e) => update('preferredBudgetRange', e.target.value || null)}
            placeholder="e.g., $10k - $50k"
          />
        </div>
      </div>

      <div>
        <Label>Flexible On</Label>
        <p className="text-xs text-gray-500 mb-1">What you'll negotiate (timeline, scope, payment terms)</p>
        <MultiInputField
          values={value.flexibleOn ?? []}
          onChange={(v) => update('flexibleOn', v)}
          placeholder="e.g., Payment schedule"
          maxItems={10}
          addButtonText="Add Item"
        />
      </div>

      <div>
        <Label>Not Flexible On</Label>
        <p className="text-xs text-gray-500 mb-1">Non-negotiables in pricing</p>
        <MultiInputField
          values={value.notFlexibleOn ?? []}
          onChange={(v) => update('notFlexibleOn', v)}
          placeholder="e.g., Hourly rate"
          maxItems={10}
          addButtonText="Add Item"
        />
      </div>

      <div>
        <Label>Price Defense Strategy</Label>
        <p className="text-xs text-gray-500 mb-1">How you justify your price when questioned</p>
        <Textarea
          value={value.priceDefenseStrategy ?? ''}
          onChange={(e) => update('priceDefenseStrategy', e.target.value || null)}
          placeholder="e.g., Anchor on outcomes and ROI, not hours"
          rows={3}
        />
      </div>

      <div>
        <Label>Value Anchor Points</Label>
        <p className="text-xs text-gray-500 mb-1">Specific value points you reference to justify pricing</p>
        <MultiInputField
          values={value.valueAnchorPoints ?? []}
          onChange={(v) => update('valueAnchorPoints', v)}
          placeholder="e.g., 10+ years of experience, proven case studies"
          maxItems={10}
          addButtonText="Add Anchor"
        />
      </div>
    </div>
  );
}
