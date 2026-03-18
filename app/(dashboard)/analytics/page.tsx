'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Mock data for charts
const mockChartData = [
  { date: "Mar 11", conversations: 12, leads: 3 },
  { date: "Mar 12", conversations: 15, leads: 4 },
  { date: "Mar 13", conversations: 8, leads: 2 },
  { date: "Mar 14", conversations: 22, leads: 6 },
  { date: "Mar 15", conversations: 18, leads: 5 },
  { date: "Mar 16", conversations: 25, leads: 7 },
  { date: "Mar 17", conversations: 16, leads: 4 },
];

const mockLeadFunnel = [
  { stage: "Visitors", count: 340, percentage: 100 },
  { stage: "Conversations", count: 87, percentage: 25.6 },
  { stage: "Qualified", count: 23, percentage: 26.4 },
];

const mockTopQuestions = [
  { question: "What's your pricing?", count: 34 },
  { question: "How long does it take?", count: 28 },
  { question: "Do you offer customization?", count: 19 },
  { question: "What's included in the package?", count: 15 },
];

/**
 * Simple bar chart component
 */
function SimpleBarChart({
  data,
  dataKey,
  title,
  color,
}: {
  data: any[];
  dataKey: string;
  title: string;
  color: string;
}) {
  const max = Math.max(...data.map((d) => d[dataKey]));

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                {item.date || item.stage}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {item[dataKey]}
              </span>
            </div>
            <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${color}`}
                style={{ width: `${(item[dataKey] / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Analytics page component
 */
export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>('week');

  // Fetch analytics from API
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.analytics.getOverview({ period }),
    enabled: !!user,
  });

  const analyticsData = response?.data as any;

  // Use real data if available, otherwise defaults
  const totalConversations = analyticsData?.totalConversations ?? 0;
  const totalLeads = analyticsData?.qualifiedLeads ?? 0;
  const avgLeadScore = Math.round((analyticsData?.averageScore ?? 0) * 10) / 10;
  const conversionRate = analyticsData?.conversionRate
    ? (analyticsData.conversionRate * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Performance metrics and insights
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["week", "month", "year"].map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
              className="capitalize text-sm"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-900">Failed to load analytics</p>
            <p className="text-sm text-danger-700 mt-1">
              {error instanceof Error ? error.message : 'Please try again'}
            </p>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Conversations</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {totalConversations}
                  </p>
                  <p className="text-xs text-success-600 mt-1">↑ 12% this week</p>
                </>
              )}
            </div>
            <MessageSquare className="w-10 h-10 text-primary-100" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Qualified Leads</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {totalLeads}
                  </p>
                  <p className="text-xs text-success-600 mt-1">↑ 8% this week</p>
                </>
              )}
            </div>
            <Users className="w-10 h-10 text-success-100" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Lead Score</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {avgLeadScore}
                  </p>
                  <p className="text-xs text-success-600 mt-1">↑ 5% this week</p>
                </>
              )}
            </div>
            <TrendingUp className="w-10 h-10 text-accent-100" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Conversion Rate</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {conversionRate}%
                  </p>
                  <p className="text-xs text-success-600 mt-1">↑ 3% this week</p>
                </>
              )}
            </div>
            <Zap className="w-10 h-10 text-warning-100" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations & Leads Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {totalConversations === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>No conversation data yet. Start simulations to see activity.</p>
            </div>
          ) : (
            <SimpleBarChart
              data={mockChartData}
              dataKey="conversations"
              title="Conversations by Day"
              color="bg-primary-500"
            />
          )}
        </div>

        {/* Lead Funnel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Lead Funnel</h3>
          {totalLeads === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-400">
              <p>No lead data yet. Complete conversations to generate leads.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockLeadFunnel.map((stage, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {stage.stage}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {stage.count} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success-500"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Performance & Top Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">AI Performance</h3>
          {totalConversations === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-400">
              <p>No AI performance data yet. Start simulations to see metrics.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Confidence</span>
                  <span className="font-bold text-gray-900">87%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500" style={{ width: "87%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Response Accuracy</span>
                  <span className="font-bold text-gray-900">82%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500" style={{ width: "82%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Escalation Rate</span>
                  <span className="font-bold text-gray-900">8%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-warning-500" style={{ width: "8%" }} />
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded p-3 text-sm text-primary-900 mt-4">
                <p className="font-medium mb-1">Avg Response Time: 1.2s</p>
                <p className="text-xs">Optimal for real-time conversations</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Questions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Questions</h3>
          {totalConversations === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-400">
              <p>No questions yet. Conversations will show top questions here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockTopQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.question}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Asked {item.count} times
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900 ml-2">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Export Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              Download analytics reports as CSV or PDF
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="text-sm">Export CSV</Button>
            <Button variant="outline" className="text-sm">Export PDF</Button>
          </div>
        </div>
      </div>

    </div>
  );
}
