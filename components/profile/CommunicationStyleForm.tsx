'use client';

import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import MultiInputField from '@/components/onboarding/MultiInputField';

interface CommunicationStyleFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

const TONE_OPTIONS = ['friendly', 'direct', 'formal', 'warm', 'assertive', 'consultative'];
const ENERGY_OPTIONS = ['low', 'medium', 'high'];
const VERBOSITY_OPTIONS = ['concise', 'balanced', 'detailed'];
const SENTENCE_OPTIONS = ['short', 'mixed', 'long'];
const PRESSURE_OPTIONS = ['low', 'medium', 'high'];

export default function CommunicationStyleForm({ value, onChange }: CommunicationStyleFormProps) {
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tone</Label>
          <Select
            value={value.tone ?? ''}
            onChange={(e) => update('tone', e.target.value || null)}
            placeholder="Select tone"
            options={TONE_OPTIONS.map((t) => ({ value: t, label: t }))}
          />
        </div>
        <div>
          <Label>Energy Level</Label>
          <Select
            value={value.energyLevel ?? ''}
            onChange={(e) => update('energyLevel', e.target.value || null)}
            placeholder="Select energy"
            options={ENERGY_OPTIONS.map((t) => ({ value: t, label: t }))}
          />
        </div>
        <div>
          <Label>Verbosity</Label>
          <Select
            value={value.verbosityPattern ?? ''}
            onChange={(e) => update('verbosityPattern', e.target.value || null)}
            placeholder="Select verbosity"
            options={VERBOSITY_OPTIONS.map((t) => ({ value: t, label: t }))}
          />
        </div>
        <div>
          <Label>Sentence Length</Label>
          <Select
            value={value.sentenceLength ?? ''}
            onChange={(e) => update('sentenceLength', e.target.value || null)}
            placeholder="Select length"
            options={SENTENCE_OPTIONS.map((t) => ({ value: t, label: t }))}
          />
        </div>
        <div>
          <Label>Pressure Level</Label>
          <Select
            value={value.pressureLevel ?? ''}
            onChange={(e) => update('pressureLevel', e.target.value || null)}
            placeholder="Select pressure"
            options={PRESSURE_OPTIONS.map((t) => ({ value: t, label: t }))}
          />
        </div>
        <div className="flex items-end gap-4 pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!value.usesHumor}
              onChange={(e) => update('usesHumor', e.target.checked)}
            />
            Uses Humor
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!value.usesEmpathy}
              onChange={(e) => update('usesEmpathy', e.target.checked)}
            />
            Uses Empathy
          </label>
        </div>
      </div>

      <div>
        <Label>Common Phrases</Label>
        <p className="text-xs text-gray-500 mb-1">Recurring phrases you use</p>
        <MultiInputField
          values={value.commonPhrases ?? []}
          onChange={(v) => update('commonPhrases', v)}
          placeholder="e.g., 'Let's make sure we're on the same page'"
          maxItems={15}
          addButtonText="Add Phrase"
        />
      </div>

      <div>
        <Label>Common Openings</Label>
        <p className="text-xs text-gray-500 mb-1">How you typically start a message</p>
        <MultiInputField
          values={value.commonOpenings ?? []}
          onChange={(v) => update('commonOpenings', v)}
          placeholder="e.g., 'Thanks for reaching out'"
          maxItems={10}
          addButtonText="Add Opening"
        />
      </div>

      <div>
        <Label>Common Closings</Label>
        <p className="text-xs text-gray-500 mb-1">How you typically end a message</p>
        <MultiInputField
          values={value.commonClosings ?? []}
          onChange={(v) => update('commonClosings', v)}
          placeholder="e.g., 'Talk soon'"
          maxItems={10}
          addButtonText="Add Closing"
        />
      </div>

      {value.usesHumor && (
        <div>
          <Label>Humor Examples</Label>
          <MultiInputField
            values={value.humorExamples ?? []}
            onChange={(v) => update('humorExamples', v)}
            placeholder="An actual humorous line you've used"
            maxItems={10}
            addButtonText="Add Example"
          />
        </div>
      )}

      {value.usesEmpathy && (
        <div>
          <Label>Empathy Examples</Label>
          <MultiInputField
            values={value.empathyExamples ?? []}
            onChange={(v) => update('empathyExamples', v)}
            placeholder="An empathetic line you've used"
            maxItems={10}
            addButtonText="Add Example"
          />
        </div>
      )}

      <div>
        <Label>Favorite Words</Label>
        <MultiInputField
          values={value.favoriteWords ?? []}
          onChange={(v) => update('favoriteWords', v)}
          placeholder="e.g., 'aligned', 'partnership'"
          maxItems={15}
          addButtonText="Add Word"
        />
      </div>
    </div>
  );
}
