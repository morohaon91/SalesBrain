'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import MultiInputField from '@/components/onboarding/MultiInputField';

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
  const discovery = value.discovery ?? { firstQuestions: [], discoveryOrder: [], prioritizedInfo: [], moveToValueTrigger: null };
  const pain = value.pain ?? { deepensPain: false, painDepthLevel: null, normalizesProblem: false, painApproach: null };
  const vp = value.valuePositioning ?? { primaryValueLens: null, secondaryValueLens: [], proofSignalsUsed: [] };
  const closing = value.closing ?? { asksForNextStep: false, ctaTiming: null, ctaDirectness: null, preferredNextStep: null, createsUrgency: false, urgencyMethod: null };

  const updateSub = (key: string, patch: Record<string, unknown>) => {
    onChange({ ...value, [key]: { ...(value[key] ?? {}), ...patch } });
  };

  return (
    <div className="space-y-6">
      {/* Discovery */}
      <section className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">Discovery</h3>
        <div>
          <Label>First Questions</Label>
          <MultiInputField
            values={discovery.firstQuestions ?? []}
            onChange={(v) => updateSub('discovery', { firstQuestions: v })}
            placeholder="e.g., 'What's driving this project now?'"
            maxItems={8}
            addButtonText="Add Question"
          />
        </div>
        <div>
          <Label>Discovery Order</Label>
          <p className="text-xs text-gray-500 mb-1">Topics you cover, in order</p>
          <MultiInputField
            values={discovery.discoveryOrder ?? []}
            onChange={(v) => updateSub('discovery', { discoveryOrder: v })}
            placeholder="e.g., 'timeline', 'budget', 'goals'"
            maxItems={10}
            addButtonText="Add Topic"
          />
        </div>
        <div>
          <Label>Prioritized Info</Label>
          <MultiInputField
            values={discovery.prioritizedInfo ?? []}
            onChange={(v) => updateSub('discovery', { prioritizedInfo: v })}
            placeholder="What you always want to know"
            maxItems={8}
            addButtonText="Add"
          />
        </div>
        <div>
          <Label>Move-to-Value Trigger</Label>
          <Input
            value={discovery.moveToValueTrigger ?? ''}
            onChange={(e) => updateSub('discovery', { moveToValueTrigger: e.target.value || null })}
            placeholder="What makes you shift from discovery to pitching"
          />
        </div>
      </section>

      {/* Pain */}
      <section className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">Pain Exploration</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!pain.deepensPain}
              onChange={(e) => updateSub('pain', { deepensPain: e.target.checked })}
            />
            Deepens pain
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!pain.normalizesProblem}
              onChange={(e) => updateSub('pain', { normalizesProblem: e.target.checked })}
            />
            Normalizes problem
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Pain Depth</Label>
            <Select
              value={pain.painDepthLevel ?? ''}
              onChange={(e) => updateSub('pain', { painDepthLevel: e.target.value || null })}
              placeholder="Select depth"
              options={PAIN_DEPTH.map((o) => ({ value: o, label: o }))}
            />
          </div>
          <div>
            <Label>Pain Approach</Label>
            <Select
              value={pain.painApproach ?? ''}
              onChange={(e) => updateSub('pain', { painApproach: e.target.value || null })}
              placeholder="Select approach"
              options={PAIN_APPROACH.map((o) => ({ value: o, label: o }))}
            />
          </div>
        </div>
      </section>

      {/* Value Positioning */}
      <section className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">Value Positioning</h3>
        <div>
          <Label>Primary Value Lens</Label>
          <Select
            value={vp.primaryValueLens ?? ''}
            onChange={(e) => updateSub('valuePositioning', { primaryValueLens: e.target.value || null })}
            placeholder="Select lens"
            options={VALUE_LENS.map((o) => ({ value: o, label: o }))}
          />
        </div>
        <div>
          <Label>Secondary Value Lenses</Label>
          <MultiInputField
            values={vp.secondaryValueLens ?? []}
            onChange={(v) => updateSub('valuePositioning', { secondaryValueLens: v })}
            placeholder="e.g., 'trust'"
            maxItems={5}
            addButtonText="Add Lens"
          />
        </div>
        <div>
          <Label>Proof Signals Used</Label>
          <MultiInputField
            values={vp.proofSignalsUsed ?? []}
            onChange={(v) => updateSub('valuePositioning', { proofSignalsUsed: v })}
            placeholder="e.g., case studies, testimonials"
            maxItems={8}
            addButtonText="Add Proof"
          />
        </div>
      </section>

      {/* Closing */}
      <section className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">Closing</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!closing.asksForNextStep}
              onChange={(e) => updateSub('closing', { asksForNextStep: e.target.checked })}
            />
            Asks for next step
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!closing.createsUrgency}
              onChange={(e) => updateSub('closing', { createsUrgency: e.target.checked })}
            />
            Creates urgency
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>CTA Timing</Label>
            <Select
              value={closing.ctaTiming ?? ''}
              onChange={(e) => updateSub('closing', { ctaTiming: e.target.value || null })}
              placeholder="Timing"
              options={CTA_TIMING.map((o) => ({ value: o, label: o }))}
            />
          </div>
          <div>
            <Label>CTA Directness</Label>
            <Select
              value={closing.ctaDirectness ?? ''}
              onChange={(e) => updateSub('closing', { ctaDirectness: e.target.value || null })}
              placeholder="Directness"
              options={CTA_DIRECTNESS.map((o) => ({ value: o, label: o }))}
            />
          </div>
          <div>
            <Label>Preferred Next Step</Label>
            <Select
              value={closing.preferredNextStep ?? ''}
              onChange={(e) => updateSub('closing', { preferredNextStep: e.target.value || null })}
              placeholder="Select"
              options={NEXT_STEP.map((o) => ({ value: o, label: o }))}
            />
          </div>
        </div>
        {closing.createsUrgency && (
          <div>
            <Label>Urgency Method</Label>
            <Input
              value={closing.urgencyMethod ?? ''}
              onChange={(e) => updateSub('closing', { urgencyMethod: e.target.value || null })}
              placeholder="How you create urgency"
            />
          </div>
        )}
      </section>
    </div>
  );
}
