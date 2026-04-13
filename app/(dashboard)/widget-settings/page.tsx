'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WidgetSettingsPage() {
  const [config, setConfig] = useState({
    apiKey: 'sb_abc123xyz',
    position: 'bottom-right',
    primaryColor: '#4F46E5',
    greeting: 'Hi! How can I help you today?'
  });

  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);

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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Widget Settings</h1>
        <p className="text-gray-600 mt-2">Configure and embed the chat widget on your website</p>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Configuration</CardTitle>
          <CardDescription>Customize how the widget appears on your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Position */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Position</label>
            <select
              value={config.position}
              onChange={(e) => setConfig({ ...config, position: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>

          {/* Primary Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Primary Color</label>
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

          {/* Greeting Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Greeting Message</label>
            <input
              type="text"
              value={config.greeting}
              onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Hi! How can I help you today?"
            />
            <p className="text-xs text-gray-500">{config.greeting.length}/100 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code Card */}
      <Card>
        <CardHeader>
          <CardTitle>Embed Code</CardTitle>
          <CardDescription>
            Copy and paste this code before the closing &lt;/body&gt; tag on your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-words">
              {embedCode}
            </pre>
          </div>

          <Button
            onClick={copyToClipboard}
            className="w-full"
            variant={copied ? 'default' : 'default'}
          >
            {copied ? '✓ Copied to clipboard' : 'Copy to Clipboard'}
          </Button>

          {copied && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Embed code copied! Paste it on your website to enable the chat widget.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Copy the embed code above</li>
            <li>Go to your website's HTML code</li>
            <li>Find the closing &lt;/body&gt; tag (usually at the very end of the page)</li>
            <li>Paste the code just before &lt;/body&gt;</li>
            <li>Save and publish your changes</li>
            <li>The chat widget will appear on your website in seconds</li>
          </ol>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-900">
              <strong>Need help?</strong> The widget will automatically adapt to any screen size,
              from large desktop monitors to small mobile phones.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how the widget will look with your current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Widget Preview</p>
              <p className="text-sm text-gray-400 mt-2">
                The chat bubble will appear at the {config.position.replace('-', ' ')}
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
