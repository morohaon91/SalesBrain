'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ObjectionHandlingFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

const OBJECTIONS = [
  { key: 'priceObjection', label: 'Price Objection', placeholder: 'How do you respond when a client says you\'re too expensive?' },
  { key: 'timelineObjection', label: 'Timeline Objection', placeholder: 'How do you respond to unrealistic timeline requests?' },
  { key: 'qualityObjection', label: 'Quality Objection', placeholder: 'How do you justify your quality vs. cheaper alternatives?' },
  { key: 'competitorObjection', label: 'Competitor Objection', placeholder: 'How do you respond when a client mentions a cheaper competitor?' },
  { key: 'scopeObjection', label: 'Scope Objection', placeholder: 'How do you handle scope creep or "while you\'re at it" requests?' },
];

export default function ObjectionHandlingForm({ value, onChange }: ObjectionHandlingFormProps) {
  const update = (field: string, v: string) => onChange({ ...value, [field]: v });

  return (
    <div className="space-y-4">
      {OBJECTIONS.map(({ key, label, placeholder }) => (
        <div key={key}>
          <Label>{label}</Label>
          <Textarea
            value={value[key] ?? ''}
            onChange={(e) => update(key, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="mt-1"
          />
        </div>
      ))}
    </div>
  );
}
