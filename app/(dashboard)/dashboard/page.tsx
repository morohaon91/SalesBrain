"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/stats-card";
import {
  MessageSquare,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

/**
 * Activity Item Component
 */
function ActivityItem({
  title,
  description,
  time,
  type,
}: {
  title: string;
  description: string;
  time: string;
  type: "conversation" | "lead" | "simulation";
}) {
  const typeColors = {
    conversation: "bg-primary-100 text-primary-700",
    lead: "bg-success-100 text-success-700",
    simulation: "bg-accent-100 text-accent-700",
  };

  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <p className="text-xs text-gray-500 flex-shrink-0">{time}</p>
    </div>
  );
}

/**
 * Dashboard overview page
 */
export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch analytics data
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.analytics.getOverview(),
    enabled: !!user,
  });

  const analyticsData = analyticsResponse?.data as any;
  const totalConversations = analyticsData?.totalConversations ?? 0;
  const qualifiedLeads = analyticsData?.qualifiedLeads ?? 0;
  const averageScore = analyticsData?.averageScore ?? 0;

  // Get current hour for greeting
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 18) greeting = "Good afternoon";
  if (hour >= 18) greeting = "Good evening";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your lead qualification AI.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/simulations/new">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            Start Simulation
          </Button>
        </Link>
        <Link href="/conversations">
          <Button variant="outline">
            View Conversations
          </Button>
        </Link>
        <Link href="/settings/widget">
          <Button variant="outline">
            Setup Widget
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Conversations"
          value={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalConversations}
          icon={MessageSquare}
          iconVariant="primary"
          trend={{ value: "0%", positive: true }}
        />
        <StatsCard
          label="Qualified Leads"
          value={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : qualifiedLeads}
          icon={Users}
          iconVariant="success"
          trend={{ value: "0%", positive: true }}
        />
        <StatsCard
          label="Avg. Lead Score"
          value={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (averageScore > 0 ? averageScore : "—")}
          icon={TrendingUp}
          iconVariant="primary"
        />
        <StatsCard
          label="Leads Created"
          value={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (qualifiedLeads + (analyticsData?.unqualifiedLeads ?? 0) + (analyticsData?.contactedLeads ?? 0))}
          icon={AlertCircle}
          iconVariant="warning"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Get Started Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Getting Started Card */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Your Business Brain
            </h2>
            <p className="text-gray-700 mb-6">
              Your AI-powered lead qualification system is ready. Here's how to get started:
            </p>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Run Practice Simulations</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Have conversations with AI clients to train your profile
                  </p>
                  <Link href="/simulations/new" className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1">
                    Start simulation <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Setup Your Widget</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure and embed the chat widget on your website
                  </p>
                  <Link href="/settings/widget" className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1">
                    Configure widget <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Review Qualified Leads</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    AI will automatically qualify incoming leads
                  </p>
                  <Link href="/leads" className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1">
                    View leads <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Preview */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              This Week's Activity
            </h3>

            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No data yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start simulations to see analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>

            {totalConversations === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No activity yet</p>
                <p className="text-xs text-gray-400 mt-1">Start simulations to see activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ActivityItem
                  title="Conversations Started"
                  description={`${totalConversations} conversation${totalConversations !== 1 ? 's' : ''} in progress`}
                  time="Today"
                  type="conversation"
                />
                <ActivityItem
                  title="Leads Qualified"
                  description={`${qualifiedLeads} lead${qualifiedLeads !== 1 ? 's' : ''} qualified`}
                  time="Today"
                  type="lead"
                />
                {analyticsData?.contactedLeads > 0 && (
                  <ActivityItem
                    title="Leads Contacted"
                    description={`${analyticsData.contactedLeads} lead${analyticsData.contactedLeads !== 1 ? 's' : ''} contacted`}
                    time="Today"
                    type="simulation"
                  />
                )}
              </div>
            )}

            <Link href="/analytics">
              <Button variant="outline" className="w-full mt-4">
                View all activity
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>

            <div className="space-y-2">
              <Link
                href="/settings/widget"
                className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                → Get Widget Code
              </Link>
              <Link
                href="/settings/subscription"
                className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                → Upgrade Plan
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                → Account Settings
              </Link>
              <a
                href="https://docs.yourbusinessbrain.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                → Documentation
              </a>
            </div>
          </div>

          {/* Trial Banner */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-primary-900">
              ✨ 14-day trial active
            </p>
            <p className="text-xs text-primary-700 mt-1">
              Upgrade anytime to unlock advanced features
            </p>
            <Button className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white">
              Explore Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
