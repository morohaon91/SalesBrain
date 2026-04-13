'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/hooks/useI18n';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');
  const { t } = useI18n('analytics');

  const metrics = {
    totalConversations: 142,
    qualifiedLeads: 89,
    avgScore: 68,
    hotLeads: 34,
    warmLeads: 45,
    coldLeads: 63,
    conversionRate: 62.7,
  };

  const periodLabel = (p: string) =>
    p === '7d' ? t('period.7d') : p === '30d' ? t('period.30d') : t('period.90d');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              onClick={() => setPeriod(p)}
              size="sm"
            >
              {periodLabel(p)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('metrics.conversations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalConversations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('metrics.qualified')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.qualifiedLeads}</div>
            <p className="text-xs text-green-600">{metrics.conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('metrics.avgScoreShort')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.avgScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('metrics.responseTime')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0.8s</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('distribution.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">
                {t('distribution.hot')}
              </span>
              <span>{metrics.hotLeads}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{t('distribution.warm')}</span>
              <span>{metrics.warmLeads}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{t('distribution.cold')}</span>
              <span>{metrics.coldLeads}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
