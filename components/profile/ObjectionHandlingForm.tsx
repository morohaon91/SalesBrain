'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import MultiInputField from '@/components/onboarding/MultiInputField';
import { useI18n } from '@/lib/hooks/useI18n';

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
  const { t } = useI18n(['profile']);
  const fe = 'profile:formEditor.objection';
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
      <p className="text-xs text-gray-500">{t(`${fe}.intro`)}</p>

      {playbooks.map((pb, i) => (
        <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <Label>{t(`${fe}.objectionType`)}</Label>
              <Select
                value={pb.objectionType}
                onChange={(e) => updatePlaybook(i, { objectionType: e.target.value })}
                options={TYPES.map((ty) => ({
                  value: ty,
                  label: t(`profile:enumLabels.objectionType.${ty}`),
                }))}
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} className="mt-6">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label>{t(`${fe}.signalExamples`)}</Label>
            <p className="text-xs text-gray-500 mb-1">{t(`${fe}.hintSignals`)}</p>
            <MultiInputField
              values={pb.signalExamples}
              onChange={(v) => updatePlaybook(i, { signalExamples: v })}
              placeholder={t(`${fe}.phSignal`)}
              maxItems={8}
              addButtonText={t(`${fe}.addSignal`)}
            />
          </div>

          <div>
            <Label>{t(`${fe}.responseStrategy`)}</Label>
            <Textarea
              value={pb.responseStrategy}
              onChange={(e) => updatePlaybook(i, { responseStrategy: e.target.value })}
              placeholder={t(`${fe}.phStrategy`)}
              rows={3}
            />
          </div>

          <div>
            <Label>{t(`${fe}.reframing`)}</Label>
            <Input
              value={pb.reframingMethod ?? ''}
              onChange={(e) => updatePlaybook(i, { reframingMethod: e.target.value || null })}
              placeholder={t(`${fe}.phReframing`)}
            />
          </div>

          <div>
            <Label>{t(`${fe}.responseExamples`)}</Label>
            <p className="text-xs text-gray-500 mb-1">{t(`${fe}.hintResponses`)}</p>
            <MultiInputField
              values={pb.responseExamples}
              onChange={(v) => updatePlaybook(i, { responseExamples: v })}
              placeholder={t(`${fe}.phResponse`)}
              maxItems={8}
              addButtonText={t(`${fe}.addResponse`)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t(`${fe}.escalation`)}</Label>
              <Input
                value={pb.escalationLogic ?? ''}
                onChange={(e) => updatePlaybook(i, { escalationLogic: e.target.value || null })}
                placeholder={t(`${fe}.phEscalation`)}
              />
            </div>
            <div>
              <Label>{t(`${fe}.exitLogic`)}</Label>
              <Input
                value={pb.exitLogic ?? ''}
                onChange={(e) => updatePlaybook(i, { exitLogic: e.target.value || null })}
                placeholder={t(`${fe}.phExit`)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{t('profile:formEditor.shared.confidence')}</span>
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
              <span className="text-gray-500">{t('profile:formEditor.shared.evidence')}</span>
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
        <Plus className="h-4 w-4 mr-1" /> {t(`${fe}.addPlaybook`)}
      </Button>
    </div>
  );
}
