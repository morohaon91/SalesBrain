'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/lib/hooks/useI18n';
import { api } from '@/lib/api/client';
import { Loader2, TrendingUp, MessageSquare, Users, Zap, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  totalConversations?: number;
  qualifiedLeads?: number;
  unqualifiedLeads?: number;
  maybeLeads?: number;
  averageScore?: number;
  conversionRate?: number;
}

function SegmentBar({
  label,
  value,
  max,
  barColor,
  textColor,
}: {
  label: string;
  value: number;
  max: number;
  barColor: string;
  textColor: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: 'hsl(var(--foreground))' }}>{label}</span>
        <span className="font-semibold tabular-nums" style={{ color: textColor }}>{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--border))' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div
      className="rounded-xl p-5 card-hover"
      style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-2 tabular-nums" style={{ color: 'hsl(var(--foreground))' }}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{sub}</p>
          )}
        </div>
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');
  const { user } = useAuth();
  const { t } = useI18n('analytics');

  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => api.analytics.getOverview(),
    enabled: !!user,
  });

  const data = (analyticsResponse?.data as AnalyticsData) ?? {};

  const totalConversations = data.totalConversations ?? 0;
  const qualifiedLeads = data.qualifiedLeads ?? 0;
  const unqualifiedLeads = data.unqualifiedLeads ?? 0;
  const maybeLeads = data.maybeLeads ?? 0;
  const totalLeads = qualifiedLeads + unqualifiedLeads + maybeLeads;
  const averageScore = data.averageScore ?? 0;
  const conversionRate = data.conversionRate ? (data.conversionRate * 100) : 0;

  const periodLabels: Record<string, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days' };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {t('title')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Period selector */}
        <div
          className="flex rounded-lg border overflow-hidden self-start"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={
                period === p
                  ? { backgroundColor: 'hsl(38, 92%, 50%)', color: 'hsl(0,0%,100%)' }
                  : { backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--muted-foreground))' }
              }
            >
              {p === '7d' ? '7d' : p === '30d' ? '30d' : '90d'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={t('metrics.conversations')}
          value={isLoading ? '…' : totalConversations}
          icon={MessageSquare}
          iconColor="hsl(38,84%,61%)"
          iconBg="rgba(200,136,26,0.12)"
        />
        <MetricCard
          label={t('metrics.qualified')}
          value={isLoading ? '…' : qualifiedLeads}
          sub={`${conversionRate.toFixed(1)}% conversion`}
          icon={Users}
          iconColor="#4ade80"
          iconBg="rgba(74,222,128,0.1)"
        />
        <MetricCard
          label={t('metrics.avgScoreShort')}
          value={isLoading ? '…' : averageScore > 0 ? averageScore : '—'}
          icon={TrendingUp}
          iconColor="hsl(38,84%,61%)"
          iconBg="rgba(200,136,26,0.12)"
        />
        <MetricCard
          label={t('metrics.responseTime')}
          value="0.8s"
          sub="avg AI response"
          icon={Zap}
          iconColor="#4ade80"
          iconBg="rgba(74,222,128,0.1)"
        />
      </div>

      {/* ── Lead score distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className="rounded-xl p-6 card-hover"
          style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {t('distribution.title')}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
          ) : totalLeads === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                No leads yet. Conversations appear here after leads chat with your AI.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <SegmentBar
                label={`🔥 ${t('distribution.hot')}`}
                value={qualifiedLeads}
                max={totalLeads}
                barColor="hsl(21, 90%, 48%)"
                textColor="#fb923c"
              />
              <SegmentBar
                label={`✦ ${t('distribution.warm')}`}
                value={maybeLeads}
                max={totalLeads}
                barColor="hsl(38, 92%, 50%)"
                textColor="hsl(38,84%,61%)"
              />
              <SegmentBar
                label={`◦ ${t('distribution.cold')}`}
                value={unqualifiedLeads}
                max={totalLeads}
                barColor="hsl(215, 20%, 65%)"
                textColor="hsl(228,12%,55%)"
              />
            </div>
          )}
        </div>

        {/* Conversion funnel */}
        <div
          className="rounded-xl p-6 card-hover"
          style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Conversion Funnel
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Total Conversations', value: totalConversations, width: '100%', color: 'hsl(215, 20%, 75%)' },
                { label: 'Leads Created', value: totalLeads, width: `${totalConversations > 0 ? (totalLeads / totalConversations) * 100 : 0}%`, color: 'hsl(38, 92%, 60%)' },
                { label: 'Qualified Leads', value: qualifiedLeads, width: `${totalConversations > 0 ? (qualifiedLeads / totalConversations) * 100 : 0}%`, color: 'hsl(142, 76%, 46%)' },
              ].map(({ label, value, width, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'hsl(var(--foreground))' }}>{label}</span>
                    <span className="font-semibold tabular-nums" style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--border))' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width, backgroundColor: color }} />
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Conversion Rate</span>
                  <span className="text-2xl font-bold tabular-nums" style={{ color: conversionRate >= 50 ? '#4ade80' : 'hsl(38,84%,61%)' }}>
                    {conversionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty state hint */}
      {!isLoading && totalConversations === 0 && (
        <div
          className="rounded-xl border p-6 text-center"
          style={{
            backgroundColor: 'hsl(38 92% 50% / 0.04)',
            borderColor: 'hsl(38 92% 50% / 0.15)',
          }}
        >
          <BarChart3 className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(38, 92%, 50%)' }} />
          <p className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>
            Analytics will populate as leads engage
          </p>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Add the widget to your site to start capturing conversations.
          </p>
        </div>
      )}
    </div>
  );
}
