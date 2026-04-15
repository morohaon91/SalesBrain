'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import MultiInputField from '@/components/onboarding/MultiInputField';

interface ObjectionHandlingFormProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

interface Playbook {
  objectionType: string;
  signalExamples: string[];
  responseStrategy: string;
  reframingMethod: string | null;
  responseExamples: string[];
  escalationLogic: string | null;
  exitLogic: string | null;
  confidenceScore: number;
  evidenceCount: number;
  lastSeenAt: string;
  scenariosEncountered: string[];
}

const TYPES = ['price', 'trust', 'time', 'competitor', 'complexity', 'risk'];

function blankPlaybook(): Playbook {
  return {
    objectionType: 'price',
    signalExamples: [],
    responseStrategy: '',
    reframingMethod: null,
    responseExamples: [],
    escalationLogic: null,
    exitLogic: null,
    confidenceScore: 0.7,
    evidenceCount: 1,
    lastSeenAt: new Date().toISOString(),
    scenariosEncountered: [],
  };
}

export default function ObjectionHandlingForm({ value, onChange }: ObjectionHandlingFormProps) {
  const playbooks: Playbook[] = value.playbooks ?? [];

  const updatePlaybook = (i: number, patch: Partial<Playbook>) => {
    const next = [...playbooks];
    next[i] = { ...next[i], ...patch };
    onChange({ ...value, playbooks: next });
  };
  const remove = (i: number) => onChange({ ...value, playbooks: playbooks.filter((_, idx) => idx !== i) });
  const add = () => onChange({ ...value, playbooks: [...playbooks, blankPlaybook()] });

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">One playbook per objection type. Each playbook captures signals, strategy, and real responses.</p>

      {playbooks.map((pb, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <Label>Objection Type</Label>
              <Select
                value={pb.objectionType}
                onChange={(e) => updatePlaybook(i, { objectionType: e.target.value })}
                options={TYPES.map((t) => ({ value: t, label: t }))}
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} className="mt-6">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label>Signal Examples</Label>
            <p className="text-xs text-gray-500 mb-1">How clients voice this objection</p>
            <MultiInputField
              values={pb.signalExamples}
              onChange={(v) => updatePlaybook(i, { signalExamples: v })}
              placeholder="e.g., 'That's more than we budgeted for'"
              maxItems={8}
              addButtonText="Add Signal"
            />
          </div>

          <div>
            <Label>Response Strategy</Label>
            <Textarea
              value={pb.responseStrategy}
              onChange={(e) => updatePlaybook(i, { responseStrategy: e.target.value })}
              placeholder="Your overall approach for handling this objection"
              rows={3}
            />
          </div>

          <div>
            <Label>Reframing Method</Label>
            <Input
              value={pb.reframingMethod ?? ''}
              onChange={(e) => updatePlaybook(i, { reframingMethod: e.target.value || null })}
              placeholder="e.g., 'Shift from cost to ROI'"
            />
          </div>

          <div>
            <Label>Response Examples</Label>
            <p className="text-xs text-gray-500 mb-1">Actual lines you use</p>
            <MultiInputField
              values={pb.responseExamples}
              onChange={(v) => updatePlaybook(i, { responseExamples: v })}
              placeholder="An actual response you'd give"
              maxItems={8}
              addButtonText="Add Response"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Escalation Logic</Label>
              <Input
                value={pb.escalationLogic ?? ''}
                onChange={(e) => updatePlaybook(i, { escalationLogic: e.target.value || null })}
                placeholder="When to push harder"
              />
            </div>
            <div>
              <Label>Exit Logic</Label>
              <Input
                value={pb.exitLogic ?? ''}
                onChange={(e) => updatePlaybook(i, { exitLogic: e.target.value || null })}
                placeholder="When to walk away"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Confidence:</span>
              <Input
                type="number"
                step={0.1}
                min={0}
                max={1}
                value={pb.confidenceScore}
                onChange={(e) => updatePlaybook(i, { confidenceScore: Number(e.target.value) })}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Evidence:</span>
              <Input
                type="number"
                min={0}
                value={pb.evidenceCount}
                onChange={(e) => updatePlaybook(i, { evidenceCount: Number(e.target.value) })}
                className="w-20"
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Add Playbook
      </Button>
    </div>
  );
}
