'use client';

import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import MultiInputField from '@/components/onboarding/MultiInputField';
import { useI18n } from '@/lib/hooks/useI18n';

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
  const { t } = useI18n(['profile']);
  const update = (field: string, v: unknown) => onChange({ ...value, [field]: v });

  const enumOpt = (group: string, values: string[]) =>
    values.map((v) => ({
      value: v,
      label: t(`profile:enumLabels.${group}.${v}`),
    }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t('profile:formEditor.communication.tone')}</Label>
          <Select
            value={value.tone ?? ''}
            onChange={(e) => update('tone', e.target.value || null)}
            placeholder={t('profile:formEditor.communication.phTone')}
            options={enumOpt('tone', TONE_OPTIONS)}
          />
        </div>
        <div>
          <Label>{t('profile:formEditor.communication.energyLevel')}</Label>
          <Select
            value={value.energyLevel ?? ''}
            onChange={(e) => update('energyLevel', e.target.value || null)}
            placeholder={t('profile:formEditor.communication.phEnergy')}
            options={enumOpt('energy', ENERGY_OPTIONS)}
          />
        </div>
        <div>
          <Label>{t('profile:formEditor.communication.verbosity')}</Label>
          <Select
            value={value.verbosityPattern ?? ''}
            onChange={(e) => update('verbosityPattern', e.target.value || null)}
            placeholder={t('profile:formEditor.communication.phVerbosity')}
            options={enumOpt('verbosity', VERBOSITY_OPTIONS)}
          />
        </div>
        <div>
          <Label>{t('profile:formEditor.communication.sentenceLength')}</Label>
          <Select
            value={value.sentenceLength ?? ''}
            onChange={(e) => update('sentenceLength', e.target.value || null)}
            placeholder={t('profile:formEditor.communication.phSentence')}
            options={enumOpt('sentence', SENTENCE_OPTIONS)}
          />
        </div>
        <div>
          <Label>{t('profile:formEditor.communication.pressureLevel')}</Label>
          <Select
            value={value.pressureLevel ?? ''}
            onChange={(e) => update('pressureLevel', e.target.value || null)}
            placeholder={t('profile:formEditor.communication.phPressure')}
            options={enumOpt('pressure', PRESSURE_OPTIONS)}
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
            {t('profile:formEditor.communication.usesHumor')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!value.usesEmpathy}
              onChange={(e) => update('usesEmpathy', e.target.checked)}
            />
            {t('profile:formEditor.communication.usesEmpathy')}
          </label>
        </div>
      </div>

      <div>
        <Label>{t('profile:formEditor.communication.commonPhrases')}</Label>
        <p className="text-xs text-gray-500 mb-1">{t('profile:formEditor.communication.hintCommonPhrases')}</p>
        <MultiInputField
          values={value.commonPhrases ?? []}
          onChange={(v) => update('commonPhrases', v)}
          placeholder={t('profile:formEditor.communication.phCommonPhrase')}
          maxItems={15}
          addButtonText={t('profile:formEditor.communication.addPhrase')}
        />
      </div>

      <div>
        <Label>{t('profile:formEditor.communication.commonOpenings')}</Label>
        <p className="text-xs text-gray-500 mb-1">{t('profile:formEditor.communication.hintOpenings')}</p>
        <MultiInputField
          values={value.commonOpenings ?? []}
          onChange={(v) => update('commonOpenings', v)}
          placeholder={t('profile:formEditor.communication.phOpening')}
          maxItems={10}
          addButtonText={t('profile:formEditor.communication.addOpening')}
        />
      </div>

      <div>
        <Label>{t('profile:formEditor.communication.commonClosings')}</Label>
        <p className="text-xs text-gray-500 mb-1">{t('profile:formEditor.communication.hintClosings')}</p>
        <MultiInputField
          values={value.commonClosings ?? []}
          onChange={(v) => update('commonClosings', v)}
          placeholder={t('profile:formEditor.communication.phClosing')}
          maxItems={10}
          addButtonText={t('profile:formEditor.communication.addClosing')}
        />
      </div>

      {value.usesHumor && (
        <div>
          <Label>{t('profile:formEditor.communication.humorExamples')}</Label>
          <MultiInputField
            values={value.humorExamples ?? []}
            onChange={(v) => update('humorExamples', v)}
            placeholder={t('profile:formEditor.communication.phHumor')}
            maxItems={10}
            addButtonText={t('profile:formEditor.communication.addHumor')}
          />
        </div>
      )}

      {value.usesEmpathy && (
        <div>
          <Label>{t('profile:formEditor.communication.empathyExamples')}</Label>
          <MultiInputField
            values={value.empathyExamples ?? []}
            onChange={(v) => update('empathyExamples', v)}
            placeholder={t('profile:formEditor.communication.phEmpathy')}
            maxItems={10}
            addButtonText={t('profile:formEditor.communication.addEmpathy')}
          />
        </div>
      )}

      <div>
        <Label>{t('profile:formEditor.communication.favoriteWords')}</Label>
        <MultiInputField
          values={value.favoriteWords ?? []}
          onChange={(v) => update('favoriteWords', v)}
          placeholder={t('profile:formEditor.communication.phFavorite')}
          maxItems={15}
          addButtonText={t('profile:formEditor.communication.addWord')}
        />
      </div>
    </div>
  );
}
