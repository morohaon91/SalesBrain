'use client';

import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import MultiInputField from '@/components/onboarding/MultiInputField';

interface CommunicationStyleFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

export default function CommunicationStyleForm({ value, onChange }: CommunicationStyleFormProps) {
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });

  return (
    <div className="space-y-4">
      <div>
        <Label>Tone</Label>
        <Select
          value={value.tone ?? ''}
          onChange={(e) => update('tone', e.target.value)}
          placeholder="Select tone"
          options={['professional', 'casual', 'empathetic', 'direct', 'friendly'].map((t) => ({ value: t, label: t }))}
        />
      </div>
      <div>
        <Label>Style</Label>
        <Select
          value={value.style ?? ''}
          onChange={(e) => update('style', e.target.value)}
          placeholder="Select style"
          options={['data-driven', 'emotional', 'educational', 'consultative'].map((s) => ({ value: s, label: s }))}
        />
      </div>
      <div>
        <Label>Key Phrases</Label>
        <p className="text-xs text-gray-500 mb-1">How you typically describe your value</p>
        <MultiInputField
          values={value.keyPhrases ?? []}
          onChange={(v) => update('keyPhrases', v)}
          placeholder="e.g., 'We prioritize transparency in every project'"
          maxItems={15}
          addButtonText="Add Phrase"
        />
      </div>
    </div>
  );
}
