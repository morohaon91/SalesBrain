"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/hooks/useI18n";
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
  ChevronRight,
  Loader2,
  Zap,
  CheckCircle,
  X,
  Circle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { authFetch } from "@/lib/api/auth-fetch";
import { rtlMirrorIcon } from "@/lib/i18n/rtl-icons";

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

function SetupProgressBar({
  profile,
  simulations,
  onDismiss,
}: {
  profile: Record<string, unknown> | null;
  simulations: unknown[];
  onDismiss: () => void;
}) {
  const hasSimulations = simulations.length > 0;
  const hasProfile = !!(profile?.businessName || profile?.serviceDescription);
  const isLive =
    profile?.profileApprovalStatus === "APPROVED" ||
    profile?.profileApprovalStatus === "LIVE";

  const steps = [
    { label: "Fill your profile", done: hasProfile, href: "/profile/edit" },
    { label: "Run a simulation", done: hasSimulations, href: "/simulations/new" },
    { label: "Approve & go live", done: isLive, href: "/profile/approve" },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  if (pct === 100) return null;

  return (
    <div
      className="relative rounded-xl border p-5"
      style={{
        backgroundColor: "hsl(38 92% 50% / 0.04)",
        borderColor: "hsl(38 92% 50% / 0.2)",
      }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 end-3 p-1 rounded transition-colors hover:bg-black/5"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
      </button>

      <div className="flex items-center gap-3 mb-3">
        <Zap className="w-4 h-4" style={{ color: "hsl(38, 92%, 50%)" }} />
        <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
          Get your AI concierge live — {pct}% complete
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden mb-4"
        style={{ backgroundColor: "hsl(var(--border))" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "hsl(38, 92%, 50%)" }}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.done ? "#" : step.href}
            className={`flex items-center gap-2 text-sm transition-opacity ${step.done ? "opacity-50 pointer-events-none" : "hover:opacity-80"}`}
          >
            {step.done ? (
              <CheckCircle
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "hsl(142, 76%, 36%)" }}
              />
            ) : (
              <Circle
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "hsl(38, 92%, 50%)" }}
              />
            )}
            <span style={{ color: step.done ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))" }}>
              {step.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  if (score === 0) return null;
  const isHot = score >= 75;
  const isWarm = score >= 45;
  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
      style={
        isHot
          ? { backgroundColor: "hsl(21 90% 48% / 0.12)", color: "hsl(21, 90%, 40%)" }
          : isWarm
          ? { backgroundColor: "hsl(38 92% 50% / 0.12)", color: "hsl(38, 92%, 40%)" }
          : { backgroundColor: "hsl(215 20% 65% / 0.12)", color: "hsl(215, 20%, 45%)" }
      }
    >
      {score}
    </span>
  );
}

function RelativeTime({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return <span>{mins}m ago</span>;
  if (hours < 24) return <span>{hours}h ago</span>;
  return <span>{days}d ago</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, isHebrew } = useI18n(["dashboard", "common"]);
  const searchParams = useSearchParams();
  const approvalSuccess = searchParams.get("approval") === "success";
  const [setupDismissed, setSetupDismissed] = useState(false);

  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.analytics.getOverview(),
    enabled: !!user,
  });

  const { data: profileResponse } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authFetch("/api/v1/profile").then((r) => r.json()),
    enabled: !!user,
  });

  const { data: simulationsResponse } = useQuery({
    queryKey: ["simulations-count"],
    queryFn: () => api.simulations.list({}),
    enabled: !!user,
  });

  const { data: conversationsResponse } = useQuery({
    queryKey: ["conversations-recent"],
    queryFn: () => api.conversations.list({ pageSize: 5 }),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const analyticsData = analyticsResponse?.data as Record<string, number> | undefined;
  const totalConversations = analyticsData?.totalConversations ?? 0;
  const qualifiedLeads = analyticsData?.qualifiedLeads ?? 0;
  const averageScore = analyticsData?.averageScore ?? 0;
  const totalLeads =
    qualifiedLeads +
    (analyticsData?.unqualifiedLeads ?? 0) +
    (analyticsData?.maybeLeads ?? 0);
  const conversionRate = analyticsData?.conversionRate
    ? (analyticsData.conversionRate * 100).toFixed(1)
    : "0";

  const profile = (profileResponse?.data ?? profileResponse) as Record<string, unknown> | null;
  const isLive =
    profile?.profileApprovalStatus === "APPROVED" ||
    profile?.profileApprovalStatus === "LIVE";
  const recentConversations = (conversationsResponse?.data as RecentConversation[]) ?? [];
  const simulations = (simulationsResponse?.data as unknown[]) ?? [];

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "greeting.morning" : hour < 18 ? "greeting.afternoon" : "greeting.evening";
  const greeting = t(`dashboard:${greetingKey}`);

  return (
    <div className="space-y-7">
      {/* ── Success banner ── */}
      {approvalSuccess && (
        <div
          className="flex items-center gap-4 p-4 rounded-xl border"
          style={{
            backgroundColor: "hsl(142 76% 36% / 0.06)",
            borderColor: "hsl(142 76% 36% / 0.25)",
          }}
        >
          <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "hsl(142, 76%, 36%)" }} />
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: "hsl(142, 40%, 20%)" }}>
              {t("dashboard:messages.approvalLiveTitle")}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "hsl(142, 30%, 35%)" }}>
              {t("dashboard:messages.approvalLiveBody")}
            </p>
          </div>
        </div>
      )}

      {/* ── Setup progress (dismissable) ── */}
      {!isLive && !setupDismissed && (
        <SetupProgressBar
          profile={profile}
          simulations={simulations}
          onDismiss={() => setSetupDismissed(true)}
        />
      )}

      {/* ── Page header ── */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {greeting}, {user?.name}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("dashboard:tagline")}
        </p>
      </div>

      {/* ── Quick actions ── */}
      <div className="flex flex-wrap gap-2.5">
        <Link href="/simulations/new">
          <Button
            size="sm"
            className="font-medium"
            style={{ backgroundColor: "hsl(38, 92%, 50%)", color: "hsl(0,0%,100%)" }}
          >
            {t("dashboard:actions.newSimulation")}
          </Button>
        </Link>
        <Link href="/conversations">
          <Button size="sm" variant="outline">
            {t("dashboard:actions.viewConversations")}
          </Button>
        </Link>
        <Link href="/settings/widget">
          <Button size="sm" variant="outline">
            {t("dashboard:actions.widgetSettings")}
          </Button>
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label={t("dashboard:stats.totalConversations")}
          value={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalConversations}
          icon={MessageSquare}
          iconVariant="primary"
        />
        <StatsCard
          label={t("dashboard:stats.qualifiedLeads")}
          value={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : qualifiedLeads}
          icon={Users}
          iconVariant="success"
        />
        <StatsCard
          label={t("dashboard:stats.avgLeadScore")}
          value={
            isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : averageScore > 0 ? (
              averageScore
            ) : (
              "—"
            )
          }
          icon={TrendingUp}
          iconVariant="primary"
        />
        <StatsCard
          label={t("dashboard:stats.totalLeadsLabel")}
          value={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalLeads}
          icon={AlertCircle}
          iconVariant="warning"
        />
      </div>

      {/* ── Body grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Conversion card */}
          <div
            className="bg-white rounded-xl border p-6 card-hover"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {t("dashboard:conversionCard.title")}
            </h3>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            ) : totalLeads === 0 ? (
              <div className="py-6 text-center">
                <Activity
                  className="w-8 h-8 mx-auto mb-2"
                  style={{ color: "hsl(var(--border))" }}
                />
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {t("dashboard:messages.conversionEmpty")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <p
                    className="text-4xl font-bold tabular-nums"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    {conversionRate}%
                  </p>
                  <p className="text-sm pb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {qualifiedLeads} / {totalLeads} leads qualified
                  </p>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "hsl(var(--border))" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${conversionRate}%`,
                      backgroundColor: "hsl(142, 76%, 40%)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recent conversations — wide card */}
          <div
            className="bg-white rounded-xl border p-6 card-hover"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {t("dashboard:recentConversations.title")}
              </h3>
              <Link
                href="/conversations"
                className="text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: "hsl(38, 92%, 44%)" }}
              >
                {t("dashboard:actions.viewAll")}
                <ArrowRight className={rtlMirrorIcon(isHebrew, "w-3 h-3")} aria-hidden />
              </Link>
            </div>

            {recentConversations.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare
                  className="w-8 h-8 mx-auto mb-2"
                  style={{ color: "hsl(var(--border))" }}
                />
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {t("dashboard:messages.noConversationsYet")}
                </p>
                <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {t("dashboard:messages.conversationsHint")}
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
                {recentConversations.map((conv) => (
                  <Link key={conv.id} href={`/conversations/${conv.id}`} className="block">
                    <div className="py-3 flex items-center gap-3 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors">
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{
                          backgroundColor: "hsl(38 92% 50% / 0.1)",
                          color: "hsl(38, 92%, 42%)",
                        }}
                      >
                        {conv.leadName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: "hsl(var(--foreground))" }}
                          >
                            {conv.leadName}
                          </p>
                          <ScoreBadge score={conv.leadScore} />
                        </div>
                        <p
                          className="text-xs truncate mt-0.5"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          {conv.summary && conv.summary !== "No summary available"
                            ? conv.summary
                            : conv.leadEmail}
                        </p>
                      </div>
                      <p
                        className="text-xs flex-shrink-0"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        <RelativeTime date={conv.createdAt} />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Quick links */}
          <div
            className="bg-white rounded-xl border p-5 card-hover"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {t("dashboard:quickLinks.title")}
            </h3>
            <div className="space-y-0.5">
              {[
                { href: "/settings/widget", label: t("dashboard:quickLinks.widget") },
                { href: "/analytics", label: t("dashboard:quickLinks.analytics") },
                { href: "/leads", label: t("dashboard:quickLinks.leads") },
                { href: "/settings", label: t("dashboard:quickLinks.settings") },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-slate-50"
                  style={{ color: "hsl(38, 92%, 44%)" }}
                >
                  <span>{link.label}</span>
                  <ChevronRight
                    className={rtlMirrorIcon(isHebrew, "h-4 w-4 opacity-50")}
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Trial upgrade */}
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: "hsl(222, 47%, 7%)",
              borderColor: "hsl(222, 30%, 14%)",
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: "hsl(0, 0%, 95%)" }}
            >
              {t("dashboard:trial.title")}
            </p>
            <p className="text-xs mt-1 mb-4" style={{ color: "hsl(215, 15%, 55%)" }}>
              {t("dashboard:trial.body")}
            </p>
            <Link href="/settings/subscription">
              <button
                className="w-full py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "hsl(38, 92%, 50%)",
                  color: "hsl(0, 0%, 100%)",
                }}
              >
                {t("dashboard:trial.upgrade")}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
