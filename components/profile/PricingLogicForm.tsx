'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MultiInputField from '@/components/onboarding/MultiInputField';
import { useI18n } from '@/lib/hooks/useI18n';

interface PricingLogicFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

export default function PricingLogicForm({ value, onChange }: PricingLogicFormProps) {
  const { t } = useI18n(['profile']);
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });
  const fe = 'profile:formEditor.pricing' as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t(`${fe}.minBudget`)}</Label>
          <Input
            type="number"
            value={value.minimumBudget ?? ''}
            onChange={(e) => update('minimumBudget', e.target.value ? Number(e.target.value) : null)}
            placeholder={t(`${fe}.phMinBudget`)}
          />
        </div>
        <div>
          <Label>{t(`${fe}.preferredRange`)}</Label>
          <Input
            value={value.preferredBudgetRange ?? ''}
            onChange={(e) => update('preferredBudgetRange', e.target.value || null)}
            placeholder={t(`${fe}.phPreferredRange`)}
          />
        </div>
      </div>

      <div>
        <Label>{t(`${fe}.flexibleOn`)}</Label>
        <p className="text-xs text-gray-500 mb-1">{t(`${fe}.hintFlexible`)}</p>
        <MultiInputField
          values={value.flexibleOn ?? []}
          onChange={(v) => update('flexibleOn', v)}
          placeholder={t(`${fe}.phFlexible`)}
          maxItems={10}
          addButtonText={t(`${fe}.addFlexible`)}
        />
      </div>

      <div>
        <Label>{t(`${fe}.notFlexibleOn`)}</Label>
        <p className="text-xs text-gray-500 mb-1">{t(`${fe}.hintNotFlexible`)}</p>
        <MultiInputField
          values={value.notFlexibleOn ?? []}
          onChange={(v) => update('notFlexibleOn', v)}
          placeholder={t(`${fe}.phNotFlexible`)}
          maxItems={10}
          addButtonText={t(`${fe}.addNotFlexible`)}
        />
      </div>

      <div>
        <Label>{t(`${fe}.priceDefense`)}</Label>
        <p className="text-xs text-gray-500 mb-1">{t(`${fe}.hintDefense`)}</p>
        <Textarea
          value={value.priceDefenseStrategy ?? ''}
          onChange={(e) => update('priceDefenseStrategy', e.target.value || null)}
          placeholder={t(`${fe}.phDefense`)}
          rows={3}
        />
      </div>

      <div>
        <Label>{t(`${fe}.valueAnchors`)}</Label>
        <p className="text-xs text-gray-500 mb-1">{t(`${fe}.hintAnchors`)}</p>
        <MultiInputField
          values={value.valueAnchorPoints ?? []}
          onChange={(v) => update('valueAnchorPoints', v)}
          placeholder={t(`${fe}.phAnchor`)}
          maxItems={10}
          addButtonText={t(`${fe}.addAnchor`)}
        />
      </div>
    </div>
  );
}
