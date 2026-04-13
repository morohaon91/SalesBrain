'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/hooks/useI18n';

export default function WidgetSettingsPage() {
  const { t } = useI18n('widget');
  const [config, setConfig] = useState({
    apiKey: 'sb_abc123xyz',
    position: 'bottom-right',
    primaryColor: '#4F46E5',
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('settingsPage.title')}</h1>
        <p className="text-gray-600 mt-2">{t('settingsPage.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settingsPage.configTitle')}</CardTitle>
          <CardDescription>{t('settingsPage.configDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('settingsPage.position')}</label>
            <select
              value={config.position}
              onChange={(e) => setConfig({ ...config, position: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="bottom-right">{t('settingsPage.posBottomRight')}</option>
              <option value="bottom-left">{t('settingsPage.posBottomLeft')}</option>
              <option value="top-right">{t('settingsPage.posTopRight')}</option>
              <option value="top-left">{t('settingsPage.posTopLeft')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('settingsPage.primaryColor')}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <code className="text-sm font-mono text-gray-600">{config.primaryColor}</code>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('settingsPage.greetingLabel')}</label>
            <input
              type="text"
              value={config.greeting}
              onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder={t('settingsPage.greetingPlaceholder')}
            />
            <p className="text-xs text-gray-500">
              {t('settingsPage.charCount', { count: config.greeting.length })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settingsPage.embedTitle')}</CardTitle>
          <CardDescription>{t('settingsPage.embedDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-words">
              {embedCode}
            </pre>
          </div>

          <Button onClick={copyToClipboard} className="w-full" variant={copied ? 'default' : 'default'}>
            {copied ? t('settingsPage.copied') : t('settingsPage.copy')}
          </Button>

          {copied && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">{t('settingsPage.copiedHint')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settingsPage.installTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>{t('settingsPage.step1')}</li>
            <li>{t('settingsPage.step2')}</li>
            <li>{t('settingsPage.step3')}</li>
            <li>{t('settingsPage.step4')}</li>
            <li>{t('settingsPage.step5')}</li>
            <li>{t('settingsPage.step6')}</li>
          </ol>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-900">{t('settingsPage.helpBox')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settingsPage.previewTitle')}</CardTitle>
          <CardDescription>{t('settingsPage.previewDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">{t('settingsPage.previewPlaceholder')}</p>
              <p className="text-sm text-gray-400 mt-2">
                {t('settingsPage.positionHint', { position: positionLabel(config.position) })}
              </p>
              <div
                className="inline-block mt-4 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.primaryColor }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
