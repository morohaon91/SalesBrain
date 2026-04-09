"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
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
  Zap,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { authFetch } from "@/lib/api/auth-fetch";

interface RecentConversation {
  id: string;
  leadName: string;
  leadEmail: string;
  status: string;
  qualificationStatus: string;
  leadScore: number;
  createdAt: string;
  summary: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const approvalSuccess = searchParams.get('approval') === 'success';

  // Analytics
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.analytics.getOverview(),
    enabled: !!user,
  });

  // Profile
  const { data: profileResponse } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authFetch('/api/v1/profile').then((r) => r.json()),
    enabled: !!user,
  });

  // Recent conversations (up to 5, with messages)
  const { data: conversationsResponse } = useQuery({
    queryKey: ["conversations-recent"],
    queryFn: () => api.conversations.list({ pageSize: 5 }),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const analyticsData = analyticsResponse?.data as any;
  const totalConversations = analyticsData?.totalConversations ?? 0;
  const qualifiedLeads = analyticsData?.qualifiedLeads ?? 0;
  const averageScore = analyticsData?.averageScore ?? 0;
  const totalLeads = qualifiedLeads + (analyticsData?.unqualifiedLeads ?? 0) + (analyticsData?.maybeLeads ?? 0);
  const conversionRate = analyticsData?.conversionRate
    ? (analyticsData.conversionRate * 100).toFixed(1)
    : '0';

  const profile = (profileResponse?.data ?? profileResponse) as any;
  const completionPct = profile?.completionPercentage ?? 0;
  const isLive = profile?.profileApprovalStatus === 'APPROVED' || profile?.profileApprovalStatus === 'LIVE';
  const showReadinessBanner = !isLive && completionPct >= 70;

  const recentConversations = (conversationsResponse?.data as RecentConversation[]) ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Go-Live Success Banner */}
      {approvalSuccess && (
        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">Your AI is now live!</p>
            <p className="text-sm text-green-700">Lead conversations are active. Your AI will start qualifying leads immediately.</p>
          </div>
        </div>
      )}

      {/* Readiness Banner */}
      {showReadinessBanner && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Zap className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900">Your profile is ready to go live! ({completionPct}% complete)</p>
            <p className="text-sm text-blue-700">Review and approve your profile to activate lead conversations.</p>
          </div>
          <Link href="/profile/approve">
            <Button size="sm">
              Review & Approve <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">Here's what's happening with your AI sales rep.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/simulations/new">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            New Simulation
          </Button>
        </Link>
        <Link href="/conversations">
          <Button variant="outline">View Conversations</Button>
        </Link>
        <Link href="/settings/widget">
          <Button variant="outline">Widget Settings</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Conversations"
          value={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalConversations}
          icon={MessageSquare}
          iconVariant="primary"
        />
        <StatsCard
          label="Qualified Leads"
          value={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : qualifiedLeads}
          icon={Users}
          iconVariant="success"
        />
        <StatsCard
          label="Avg Lead Score"
          value={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (averageScore > 0 ? averageScore : "—")}
          icon={TrendingUp}
          iconVariant="primary"
        />
        <StatsCard
          label="Total Leads"
          value={isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalLeads}
          icon={AlertCircle}
          iconVariant="warning"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Getting Started */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-5 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">How SalesBrain Works</h2>
            <p className="text-gray-700 mb-6 text-sm">Complete each step to get your AI sales rep live.</p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Run simulations</h3>
                  <p className="text-sm text-gray-600 mt-1">Chat with an AI client so SalesBrain learns how you sell.</p>
                  <Link href="/simulations/new" className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1">
                    Start a simulation <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Approve your AI profile</h3>
                  <p className="text-sm text-gray-600 mt-1">Review what the AI has learned and go live.</p>
                  <Link href="/profile/approve" className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1">
                    Review profile <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add the widget to your website</h3>
                  <p className="text-sm text-gray-600 mt-1">Embed the chat widget and start capturing leads automatically.</p>
                  <Link href="/settings/widget" className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1">
                    Get widget code <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Rate card */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h3>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : totalLeads === 0 ? (
              <p className="text-sm text-gray-400">No leads yet. Complete conversations to see your conversion rate.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Qualified</span>
                  <span className="font-bold text-success-600">{qualifiedLeads}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500 rounded-full" style={{ width: `${conversionRate}%` }} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{conversionRate}% <span className="text-sm font-normal text-gray-500">conversion rate</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Conversations */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>

            {recentConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">They'll appear here once leads start chatting</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConversations.map((conv) => (
                  <Link key={conv.id} href={`/conversations/${conv.id}`}>
                    <div className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{conv.leadName}</p>
                        {conv.leadScore > 0 && (
                          <span className="text-xs font-bold text-primary-600 ml-2 flex-shrink-0">{conv.leadScore}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.summary !== 'No summary available' ? conv.summary : conv.leadEmail}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(conv.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/conversations">
              <Button variant="outline" className="w-full mt-4">View All</Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/settings/widget" className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                → Widget Settings
              </Link>
              <Link href="/analytics" className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                → Analytics
              </Link>
              <Link href="/leads" className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                → All Leads
              </Link>
              <Link href="/settings" className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                → Settings
              </Link>
            </div>
          </div>

          {/* Trial Banner */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-primary-900">✨ Free Trial</p>
            <p className="text-xs text-primary-700 mt-1">Upgrade to unlock unlimited conversations and leads.</p>
            <Link href="/settings/subscription">
              <Button className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white">Upgrade Plan</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
