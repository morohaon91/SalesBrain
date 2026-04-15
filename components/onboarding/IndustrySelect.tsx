'use client';

import { Select } from '@/components/ui/select';
import { INDUSTRY_LIST } from '@/lib/scenarios/mandatory-scenarios';

interface IndustrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function IndustrySelect({ value, onChange, error }: IndustrySelectProps) {
  return (
    <div>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Select your industry"
        options={INDUSTRY_LIST.map((i) => ({ value: i, label: i }))}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
