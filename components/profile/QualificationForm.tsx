'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import MultiInputField from '@/components/onboarding/MultiInputField';
import { useI18n } from '@/lib/hooks/useI18n';

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
  variant,
  items,
  onChange,
}: {
  variant: 'green' | 'yellow' | 'red';
  items: FlagItem[];
  onChange: (items: FlagItem[]) => void;
}) {
  const { t } = useI18n(['profile']);
  const q = 'profile:formEditor.qualification';
  const title =
    variant === 'green'
      ? t(`${q}.greenTitle`)
      : variant === 'yellow'
        ? t(`${q}.yellowTitle`)
        : t(`${q}.redTitle`);
  const description =
    variant === 'green'
      ? t(`${q}.greenDesc`)
      : variant === 'yellow'
        ? t(`${q}.yellowDesc`)
        : t(`${q}.redDesc`);
  const addItemLabel =
    variant === 'green'
      ? t(`${q}.addGreenFlag`)
      : variant === 'yellow'
        ? t(`${q}.addYellowFlag`)
        : t(`${q}.addRedFlag`);

  const update = (i: number, patch: Partial<FlagItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, blankFlag()]);

  const bg =
    variant === 'green'
      ? 'border-green-200 bg-green-50/40'
      : variant === 'yellow'
        ? 'border-yellow-200 bg-yellow-50/40'
        : 'border-red-200 bg-red-50/40';

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
                placeholder={t(`${q}.phFlagType`)}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={item.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder={t(`${q}.phDescription`)}
              rows={2}
            />
            <MultiInputField
              values={item.signalExamples}
              onChange={(v) => update(i, { signalExamples: v })}
              placeholder={t(`${q}.phSignalExample`)}
              maxItems={5}
              addButtonText={t(`${q}.addSignal`)}
            />
            {variant === 'red' && (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!item.triggersExit}
                  onChange={(e) => update(i, { triggersExit: e.target.checked })}
                />
                {t(`${q}.triggersExit`)}
              </label>
            )}
            {variant === 'yellow' && (
              <Input
                value={item.ownerResponse ?? ''}
                onChange={(e) => update(i, { ownerResponse: e.target.value || null })}
                placeholder={t(`${q}.phOwnerResponse`)}
              />
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t('profile:formEditor.shared.confidence')}</span>
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
          <Plus className="h-4 w-4 mr-1" /> {addItemLabel}
        </Button>
      </div>
    </div>
  );
}

function DealBreakerEditor({ items, onChange }: { items: DealBreakerItem[]; onChange: (items: DealBreakerItem[]) => void }) {
  const { t } = useI18n(['profile']);
  const q = 'profile:formEditor.qualification';
  const update = (i: number, patch: Partial<DealBreakerItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, blankDealBreaker()]);

  return (
    <div>
      <Label>{t(`${q}.dealBreakersTitle`)}</Label>
      <p className="text-xs text-gray-500 mb-2">{t(`${q}.dealBreakersDesc`)}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex justify-between items-start gap-2">
              <Input
                value={item.rule}
                onChange={(e) => update(i, { rule: e.target.value })}
                placeholder={t(`${q}.phRule`)}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={item.reasoning}
              onChange={(e) => update(i, { reasoning: e.target.value })}
              placeholder={t(`${q}.phReasoning`)}
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
                {t(`${q}.absoluteNoExceptions`)}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('profile:formEditor.shared.evidence')}</span>
                <Input
                  type="number"
                  min={0}
                  value={item.evidenceCount}
                  onChange={(e) => update(i, { evidenceCount: Number(e.target.value) })}
                  className="w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('profile:formEditor.shared.confidence')}</span>
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
          <Plus className="h-4 w-4 mr-1" /> {t(`${q}.addDealBreaker`)}
        </Button>
      </div>
    </div>
  );
}

const FIRMNESS_OPTIONS = ['soft', 'moderate', 'firm'];

export default function QualificationForm({ value, onChange }: QualificationFormProps) {
  const { t } = useI18n(['profile']);
  const q = 'profile:formEditor.qualification';
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });
  const walk = value.walkAwayStrategy ?? {
    exitLanguage: [],
    leavesDoorOpen: true,
    exitFirmness: null,
    offersAlternatives: false,
    alternativeExamples: [],
  };
  const updateWalk = (patch: Record<string, unknown>) => update('walkAwayStrategy', { ...walk, ...patch });

  const firmOpts = FIRMNESS_OPTIONS.map((o) => ({
    value: o,
    label: t(`profile:enumLabels.firmness.${o}`),
  }));

  return (
    <div className="space-y-6">
      <FlagEditor variant="green" items={value.greenFlags ?? []} onChange={(v) => update('greenFlags', v)} />

      <FlagEditor variant="yellow" items={value.yellowFlags ?? []} onChange={(v) => update('yellowFlags', v)} />

      <FlagEditor variant="red" items={value.redFlags ?? []} onChange={(v) => update('redFlags', v)} />

      <DealBreakerEditor items={value.dealBreakers ?? []} onChange={(v) => update('dealBreakers', v)} />

      <div className="rounded-xl p-3 space-y-3" style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Label>{t(`${q}.walkAwayTitle`)}</Label>
        <MultiInputField
          values={walk.exitLanguage ?? []}
          onChange={(v) => updateWalk({ exitLanguage: v })}
          placeholder={t(`${q}.phExitLang`)}
          maxItems={10}
          addButtonText={t(`${q}.addExitPhrase`)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={walk.exitFirmness ?? ''}
            onChange={(e) => updateWalk({ exitFirmness: e.target.value || null })}
            placeholder={t(`${q}.phFirmness`)}
            options={firmOpts}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!walk.leavesDoorOpen}
                onChange={(e) => updateWalk({ leavesDoorOpen: e.target.checked })}
              />
              {t(`${q}.leavesDoorOpen`)}
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!walk.offersAlternatives}
                onChange={(e) => updateWalk({ offersAlternatives: e.target.checked })}
              />
              {t(`${q}.offersAlternatives`)}
            </label>
          </div>
        </div>
        {walk.offersAlternatives && (
          <MultiInputField
            values={walk.alternativeExamples ?? []}
            onChange={(v) => updateWalk({ alternativeExamples: v })}
            placeholder={t(`${q}.phAlternative`)}
            maxItems={10}
            addButtonText={t(`${q}.addAlternative`)}
          />
        )}
      </div>
    </div>
  );
}
