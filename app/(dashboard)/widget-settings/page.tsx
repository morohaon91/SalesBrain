'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/hooks/useI18n';
import { Copy, Check } from 'lucide-react';

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  muted2: 'hsl(228,12%,55%)',
  gold: 'hsl(38,84%,61%)',
};

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${C.border}`,
  color: C.fg,
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
};

export default function WidgetSettingsPage() {
  const { t } = useI18n('widget');
  const [config, setConfig] = useState({
    apiKey: 'sb_abc123xyz',
    position: 'bottom-right',
    primaryColor: '#c8881a',
    greeting: 'Hi! How can I help you today?',
  });
  const [copied, setCopied] = useState(false);

  const positionLabel = (pos: string) => {
    const map: Record<string, string> = {
      'bottom-right': t('settingsPage.posBottomRight'),
      'bottom-left': t('settingsPage.posBottomLeft'),
      'top-right': t('settingsPage.posTopRight'),
      'top-left': t('settingsPage.posTopLeft'),
    };
    return map[pos] ?? pos;
  };

  const embedCode = `<script>
  (function() {
    window.SalesBrainConfig = {
      apiKey: '${config.apiKey}',
      position: '${config.position}',
      primaryColor: '${config.primaryColor}',
      greeting: '${config.greeting}'
    };
    var script = document.createElement('script');
    script.src = 'https://widget.salesbrain.ai/v1/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectStyle = {
    ...inputStyle,
    colorScheme: 'dark' as const,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant', Georgia, serif", fontSize: '28px', color: C.fg }}>
          {t('settingsPage.title')}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: C.muted }}>{t('settingsPage.subtitle')}</p>
      </div>

      {/* Config */}
      <div className="rounded-xl p-6 space-y-5 max-w-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
          {t('settingsPage.configTitle')}
        </h3>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: C.fg }}>{t('settingsPage.position')}</label>
          <select
            value={config.position}
            onChange={(e) => setConfig({ ...config, position: e.target.value })}
            style={selectStyle}
          >
            <option value="bottom-right">{t('settingsPage.posBottomRight')}</option>
            <option value="bottom-left">{t('settingsPage.posBottomLeft')}</option>
            <option value="top-right">{t('settingsPage.posTopRight')}</option>
            <option value="top-left">{t('settingsPage.posTopLeft')}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: C.fg }}>{t('settingsPage.primaryColor')}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
              style={{ border: `1px solid ${C.border}`, background: 'transparent' }}
            />
            <code className="text-sm font-mono" style={{ color: C.muted2 }}>{config.primaryColor}</code>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: C.fg }}>{t('settingsPage.greetingLabel')}</label>
          <input
            type="text"
            value={config.greeting}
            onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
            maxLength={100}
            style={inputStyle}
            placeholder={t('settingsPage.greetingPlaceholder')}
          />
          <p className="text-xs" style={{ color: C.muted }}>
            {t('settingsPage.charCount', { count: config.greeting.length })}
          </p>
        </div>
      </div>

      {/* Embed code */}
      <div className="rounded-xl p-6 space-y-4 max-w-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
            {t('settingsPage.embedTitle')}
          </h3>
          <p className="text-xs mt-1" style={{ color: C.muted }}>{t('settingsPage.embedDescription')}</p>
        </div>

        <div className="relative rounded-lg overflow-hidden" style={{ background: 'hsl(228,42%,5%)', border: `1px solid ${C.border}` }}>
          <pre className="p-4 text-xs font-mono overflow-x-auto" style={{ color: '#4ade80' }}>
            {embedCode}
          </pre>
          <button
            className="absolute top-2 end-2 p-1.5 rounded transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.07)', color: C.muted2 }}
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#4ade80' }} /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <Button onClick={copyToClipboard} className="w-full">
          {copied ? t('settingsPage.copied') : t('settingsPage.copy')}
        </Button>

        {copied && (
          <div className="rounded-lg p-3 text-xs" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
            {t('settingsPage.copiedHint')}
          </div>
        )}
      </div>

      {/* Install steps */}
      <div className="rounded-xl p-6 space-y-4 max-w-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
          {t('settingsPage.installTitle')}
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: C.muted2 }}>
          <li>{t('settingsPage.step1')}</li>
          <li>{t('settingsPage.step2')}</li>
          <li>{t('settingsPage.step3')}</li>
          <li>{t('settingsPage.step4')}</li>
          <li>{t('settingsPage.step5')}</li>
          <li>{t('settingsPage.step6')}</li>
        </ol>
        <div className="rounded-lg p-4" style={{ background: 'rgba(200,136,26,0.06)', border: '1px solid rgba(200,136,26,0.15)' }}>
          <p className="text-sm" style={{ color: C.gold }}>{t('settingsPage.helpBox')}</p>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl p-6 max-w-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
            {t('settingsPage.previewTitle')}
          </h3>
          <p className="text-xs mt-1" style={{ color: C.muted }}>{t('settingsPage.previewDescription')}</p>
        </div>
        <div className="relative w-full h-64 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: `2px dashed ${C.border}` }}>
          <div className="text-center">
            <p style={{ color: C.muted }}>{t('settingsPage.previewPlaceholder')}</p>
            <p className="text-xs mt-1" style={{ color: C.muted }}>
              {t('settingsPage.positionHint', { position: positionLabel(config.position) })}
            </p>
            <div
              className="inline-flex items-center justify-center mt-4 w-12 h-12 rounded-full"
              style={{ backgroundColor: config.primaryColor }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
