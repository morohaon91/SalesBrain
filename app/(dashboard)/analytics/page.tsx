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

/**
 * Analytics page component
 */
export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>('week');

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['analytics', 'overview', period],
    queryFn: () => api.analytics.getOverview({ period }),
    enabled: !!user,
  });

  const analyticsData = response?.data as any;

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
                <p className="text-2xl font-bold text-gray-900 mt-2">{totalConversations}</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-2">{totalLeads}</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-2">{avgLeadScore}</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-2">{conversionRate}%</p>
              )}
            </div>
            <Zap className="w-10 h-10 text-warning-100" />
          </div>
        </div>
      </div>

      {/* Charts — coming soon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center h-48">
          <p className="text-gray-400 text-sm">Conversation trends — coming soon</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center h-48">
          <p className="text-gray-400 text-sm">Lead funnel — coming soon</p>
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
