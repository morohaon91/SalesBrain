'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import MultiInputField from '@/components/onboarding/MultiInputField';
import { useI18n } from '@/lib/hooks/useI18n';

interface DecisionMakingFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

const PAIN_DEPTH = ['surface', 'moderate', 'deep'];
const PAIN_APPROACH = ['challenge', 'comfort', 'balanced'];
const VALUE_LENS = ['outcome', 'process', 'speed', 'trust', 'expertise', 'convenience'];
const CTA_TIMING = ['early', 'moderate', 'late'];
const CTA_DIRECTNESS = ['subtle', 'moderate', 'direct'];
const NEXT_STEP = ['call', 'meeting', 'quote', 'demo', 'audit', 'proposal'];

export default function DecisionMakingForm({ value, onChange }: DecisionMakingFormProps) {
  const { t } = useI18n(['profile']);
  const fe = 'profile:formEditor.decision';
  const discovery = value.discovery ?? { firstQuestions: [], discoveryOrder: [], prioritizedInfo: [], moveToValueTrigger: null };
  const pain = value.pain ?? { deepensPain: false, painDepthLevel: null, normalizesProblem: false, painApproach: null };
  const vp = value.valuePositioning ?? { primaryValueLens: null, secondaryValueLens: [], proofSignalsUsed: [] };
  const closing = value.closing ?? { asksForNextStep: false, ctaTiming: null, ctaDirectness: null, preferredNextStep: null, createsUrgency: false, urgencyMethod: null };

  const updateSub = (key: string, patch: Record<string, unknown>) => {
    onChange({ ...value, [key]: { ...(value[key] ?? {}), ...patch } });
  };

  const enumOpt = (group: string, values: string[]) =>
    values.map((v) => ({ value: v, label: t(`profile:enumLabels.${group}.${v}`) }));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">{t(`${fe}.discoveryTitle`)}</h3>
        <div>
          <Label>{t(`${fe}.firstQuestions`)}</Label>
          <MultiInputField
            values={discovery.firstQuestions ?? []}
            onChange={(v) => updateSub('discovery', { firstQuestions: v })}
            placeholder={t(`${fe}.phFirstQ`)}
            maxItems={8}
            addButtonText={t(`${fe}.addQuestion`)}
          />
        </div>
        <div>
          <Label>{t(`${fe}.discoveryOrder`)}</Label>
          <p className="text-xs text-gray-500 mb-1">{t(`${fe}.hintOrder`)}</p>
          <MultiInputField
            values={discovery.discoveryOrder ?? []}
            onChange={(v) => updateSub('discovery', { discoveryOrder: v })}
            placeholder={t(`${fe}.phOrder`)}
            maxItems={10}
            addButtonText={t(`${fe}.addTopic`)}
          />
        </div>
        <div>
          <Label>{t(`${fe}.prioritizedInfo`)}</Label>
          <MultiInputField
            values={discovery.prioritizedInfo ?? []}
            onChange={(v) => updateSub('discovery', { prioritizedInfo: v })}
            placeholder={t(`${fe}.phPrioritized`)}
            maxItems={8}
            addButtonText={t(`${fe}.addPrioritized`)}
          />
        </div>
        <div>
          <Label>{t(`${fe}.moveToValue`)}</Label>
          <Input
            value={discovery.moveToValueTrigger ?? ''}
            onChange={(e) => updateSub('discovery', { moveToValueTrigger: e.target.value || null })}
            placeholder={t(`${fe}.phMoveToValue`)}
          />
        </div>
      </section>

      <section className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">{t(`${fe}.painTitle`)}</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!pain.deepensPain}
              onChange={(e) => updateSub('pain', { deepensPain: e.target.checked })}
            />
            {t(`${fe}.deepensPain`)}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!pain.normalizesProblem}
              onChange={(e) => updateSub('pain', { normalizesProblem: e.target.checked })}
            />
            {t(`${fe}.normalizesProblem`)}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t(`${fe}.painDepth`)}</Label>
            <Select
              value={pain.painDepthLevel ?? ''}
              onChange={(e) => updateSub('pain', { painDepthLevel: e.target.value || null })}
              placeholder={t(`${fe}.phDepth`)}
              options={enumOpt('painDepth', PAIN_DEPTH)}
            />
          </div>
          <div>
            <Label>{t(`${fe}.painApproach`)}</Label>
            <Select
              value={pain.painApproach ?? ''}
              onChange={(e) => updateSub('pain', { painApproach: e.target.value || null })}
              placeholder={t(`${fe}.phApproach`)}
              options={enumOpt('painApproach', PAIN_APPROACH)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">{t(`${fe}.valueTitle`)}</h3>
        <div>
          <Label>{t(`${fe}.primaryLens`)}</Label>
          <Select
            value={vp.primaryValueLens ?? ''}
            onChange={(e) => updateSub('valuePositioning', { primaryValueLens: e.target.value || null })}
            placeholder={t(`${fe}.phLens`)}
            options={enumOpt('valueLens', VALUE_LENS)}
          />
        </div>
        <div>
          <Label>{t(`${fe}.secondaryLenses`)}</Label>
          <MultiInputField
            values={vp.secondaryValueLens ?? []}
            onChange={(v) => updateSub('valuePositioning', { secondaryValueLens: v })}
            placeholder={t(`${fe}.phSecondaryLens`)}
            maxItems={5}
            addButtonText={t(`${fe}.addLens`)}
          />
        </div>
        <div>
          <Label>{t(`${fe}.proofSignals`)}</Label>
          <MultiInputField
            values={vp.proofSignalsUsed ?? []}
            onChange={(v) => updateSub('valuePositioning', { proofSignalsUsed: v })}
            placeholder={t(`${fe}.phProof`)}
            maxItems={8}
            addButtonText={t(`${fe}.addProof`)}
          />
        </div>
      </section>

      <section className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">{t(`${fe}.closingTitle`)}</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!closing.asksForNextStep}
              onChange={(e) => updateSub('closing', { asksForNextStep: e.target.checked })}
            />
            {t(`${fe}.asksNextStep`)}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!closing.createsUrgency}
              onChange={(e) => updateSub('closing', { createsUrgency: e.target.checked })}
            />
            {t(`${fe}.createsUrgency`)}
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>{t(`${fe}.ctaTiming`)}</Label>
            <Select
              value={closing.ctaTiming ?? ''}
              onChange={(e) => updateSub('closing', { ctaTiming: e.target.value || null })}
              placeholder={t(`${fe}.phTiming`)}
              options={enumOpt('ctaTiming', CTA_TIMING)}
            />
          </div>
          <div>
            <Label>{t(`${fe}.ctaDirectness`)}</Label>
            <Select
              value={closing.ctaDirectness ?? ''}
              onChange={(e) => updateSub('closing', { ctaDirectness: e.target.value || null })}
              placeholder={t(`${fe}.phDirectness`)}
              options={enumOpt('ctaDirectness', CTA_DIRECTNESS)}
            />
          </div>
          <div>
            <Label>{t(`${fe}.preferredNext`)}</Label>
            <Select
              value={closing.preferredNextStep ?? ''}
              onChange={(e) => updateSub('closing', { preferredNextStep: e.target.value || null })}
              placeholder={t(`${fe}.phNextStep`)}
              options={enumOpt('nextStep', NEXT_STEP)}
            />
          </div>
        </div>
        {closing.createsUrgency && (
          <div>
            <Label>{t(`${fe}.urgencyMethod`)}</Label>
            <Input
              value={closing.urgencyMethod ?? ''}
              onChange={(e) => updateSub('closing', { urgencyMethod: e.target.value || null })}
              placeholder={t(`${fe}.phUrgency`)}
            />
          </div>
        )}
      </section>
    </div>
  );
}
