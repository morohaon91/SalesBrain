'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import MultiInputField from '@/components/onboarding/MultiInputField';

interface QualificationFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

interface FlagItem {
  flagType: string;
  description: string;
  signalExamples: string[];
  confidence: number;
  triggersExit?: boolean;
  ownerResponse?: string | null;
}

interface DealBreakerItem {
  rule: string;
  reasoning: string;
  isAbsolute: boolean;
  evidenceCount: number;
  confidence: number;
  scenariosDemonstrated: string[];
}

function blankFlag(): FlagItem {
  return { flagType: '', description: '', signalExamples: [], confidence: 0.7 };
}

function blankDealBreaker(): DealBreakerItem {
  return {
    rule: '',
    reasoning: '',
    isAbsolute: false,
    evidenceCount: 1,
    confidence: 0.7,
    scenariosDemonstrated: [],
  };
}

function FlagEditor({
  title,
  description,
  items,
  onChange,
  variant,
}: {
  title: string;
  description: string;
  items: FlagItem[];
  onChange: (items: FlagItem[]) => void;
  variant: 'green' | 'yellow' | 'red';
}) {
  const update = (i: number, patch: Partial<FlagItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, blankFlag()]);

  const bg = variant === 'green' ? 'border-green-200 bg-green-50/40' : variant === 'yellow' ? 'border-yellow-200 bg-yellow-50/40' : 'border-red-200 bg-red-50/40';

  return (
    <div>
      <Label>{title}</Label>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`rounded-lg border p-3 space-y-2 ${bg}`}>
            <div className="flex justify-between items-start gap-2">
              <Input
                value={item.flagType}
                onChange={(e) => update(i, { flagType: e.target.value })}
                placeholder="Flag type (e.g., 'budget_aligned')"
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={item.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Description"
              rows={2}
            />
            <MultiInputField
              values={item.signalExamples}
              onChange={(v) => update(i, { signalExamples: v })}
              placeholder="Signal example"
              maxItems={5}
              addButtonText="Add Signal"
            />
            {variant === 'red' && (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!item.triggersExit}
                  onChange={(e) => update(i, { triggersExit: e.target.checked })}
                />
                Triggers exit
              </label>
            )}
            {variant === 'yellow' && (
              <Input
                value={item.ownerResponse ?? ''}
                onChange={(e) => update(i, { ownerResponse: e.target.value || null })}
                placeholder="Owner response (how you'd handle it)"
              />
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Confidence:</span>
              <Input
                type="number"
                step={0.1}
                min={0}
                max={1}
                value={item.confidence}
                onChange={(e) => update(i, { confidence: Number(e.target.value) })}
                className="w-24"
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add {title.replace(/s$/, '')}
        </Button>
      </div>
    </div>
  );
}

function DealBreakerEditor({ items, onChange }: { items: DealBreakerItem[]; onChange: (items: DealBreakerItem[]) => void }) {
  const update = (i: number, patch: Partial<DealBreakerItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, blankDealBreaker()]);

  return (
    <div>
      <Label>Deal-Breakers</Label>
      <p className="text-xs text-gray-500 mb-2">Absolute rules for declining a client</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <Input
                value={item.rule}
                onChange={(e) => update(i, { rule: e.target.value })}
                placeholder="Rule (e.g., 'No projects under $5k')"
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={item.reasoning}
              onChange={(e) => update(i, { reasoning: e.target.value })}
              placeholder="Why this rule exists"
              rows={2}
            />
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={item.isAbsolute}
                  onChange={(e) => update(i, { isAbsolute: e.target.checked })}
                />
                Absolute (no exceptions)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Evidence:</span>
                <Input
                  type="number"
                  min={0}
                  value={item.evidenceCount}
                  onChange={(e) => update(i, { evidenceCount: Number(e.target.value) })}
                  className="w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Confidence:</span>
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  max={1}
                  value={item.confidence}
                  onChange={(e) => update(i, { confidence: Number(e.target.value) })}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add Deal-Breaker
        </Button>
      </div>
    </div>
  );
}

const FIRMNESS_OPTIONS = ['soft', 'moderate', 'firm'];

export default function QualificationForm({ value, onChange }: QualificationFormProps) {
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });
  const walk = value.walkAwayStrategy ?? {
    exitLanguage: [],
    leavesDoorOpen: true,
    exitFirmness: null,
    offersAlternatives: false,
    alternativeExamples: [],
  };
  const updateWalk = (patch: Record<string, unknown>) => update('walkAwayStrategy', { ...walk, ...patch });

  return (
    <div className="space-y-6">
      <FlagEditor
        title="Green Flags"
        description="Positive client signals"
        items={value.greenFlags ?? []}
        onChange={(v) => update('greenFlags', v)}
        variant="green"
      />

      <FlagEditor
        title="Yellow Flags"
        description="Client signals that warrant caution"
        items={value.yellowFlags ?? []}
        onChange={(v) => update('yellowFlags', v)}
        variant="yellow"
      />

      <FlagEditor
        title="Red Flags"
        description="Strong warning signs"
        items={value.redFlags ?? []}
        onChange={(v) => update('redFlags', v)}
        variant="red"
      />

      <DealBreakerEditor items={value.dealBreakers ?? []} onChange={(v) => update('dealBreakers', v)} />

      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3">
        <Label>Walk-Away Strategy</Label>
        <MultiInputField
          values={walk.exitLanguage ?? []}
          onChange={(v) => updateWalk({ exitLanguage: v })}
          placeholder="e.g., 'We're not the right fit for this project'"
          maxItems={10}
          addButtonText="Add Exit Phrase"
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={walk.exitFirmness ?? ''}
            onChange={(e) => updateWalk({ exitFirmness: e.target.value || null })}
            placeholder="Exit firmness"
            options={FIRMNESS_OPTIONS.map((o) => ({ value: o, label: o }))}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!walk.leavesDoorOpen}
                onChange={(e) => updateWalk({ leavesDoorOpen: e.target.checked })}
              />
              Leaves door open
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!walk.offersAlternatives}
                onChange={(e) => updateWalk({ offersAlternatives: e.target.checked })}
              />
              Offers alternatives
            </label>
          </div>
        </div>
        {walk.offersAlternatives && (
          <MultiInputField
            values={walk.alternativeExamples ?? []}
            onChange={(v) => updateWalk({ alternativeExamples: v })}
            placeholder="e.g., 'Try our scaled-down package'"
            maxItems={10}
            addButtonText="Add Alternative"
          />
        )}
      </div>
    </div>
  );
}
