'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/lib/hooks/useI18n';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Search,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
  Clock,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  id: string;
  leadName: string;
  leadEmail: string;
  status: string;
  qualificationStatus: string;
  leadScore: number;
  messageCount: number;
  duration: number;
  createdAt: string;
  summary: string;
}

function ScorePill({ score, qualification }: { score: number; qualification: string }) {
  const isHot = score >= 75;
  const isWarm = score >= 45;

  const style = isHot
    ? { bg: 'rgba(249,115,22,0.12)', color: '#fb923c', border: 'rgba(249,115,22,0.25)' }
    : isWarm
    ? { bg: 'rgba(200,136,26,0.12)', color: 'hsl(38,84%,61%)', border: 'rgba(200,136,26,0.25)' }
    : { bg: 'rgba(255,255,255,0.06)', color: 'hsl(228,12%,55%)', border: 'rgba(255,255,255,0.1)' };

  const label = isHot ? 'Hot' : isWarm ? 'Warm' : 'Cold';

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: style.bg, color: style.color, borderColor: style.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
      />
      {score > 0 ? `${score} · ${label}` : label}
    </span>
  );
}

function QualBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    QUALIFIED: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', label: 'Qualified' },
    UNQUALIFIED: { bg: 'rgba(244,63,94,0.1)', color: '#fb7185', label: 'Unqualified' },
    MAYBE: { bg: 'rgba(200,136,26,0.1)', color: 'hsl(38,84%,61%)', label: 'Maybe' },
    UNKNOWN: { bg: 'rgba(255,255,255,0.06)', color: 'hsl(228,12%,55%)', label: 'Unknown' },
  };
  const s = map[status] ?? map.UNKNOWN;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function RelativeTime({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return <span>{mins}m</span>;
  if (hours < 24) return <span>{hours}h</span>;
  return <span>{days}d</span>;
}

export default function ConversationsPage() {
  const { user } = useAuth();
  const { t } = useI18n(['conversations', 'common']);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterQualification, setFilterQualification] = useState<string>('ALL');
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);

  const handleReanalyze = async (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setReanalyzingId(convId);
    try {
      await api.conversations.reanalyze(convId);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } finally {
      setReanalyzingId(null);
    }
  };

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['conversations', filterStatus, filterQualification],
    queryFn: () =>
      api.conversations.list({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        qualificationStatus: filterQualification !== 'ALL' ? filterQualification : undefined,
      }),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const conversations = (response?.data as Conversation[]) || [];
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.leadEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || conv.status === filterStatus;
    const matchesQualification =
      filterQualification === 'ALL' || conv.qualificationStatus === filterQualification;
    return matchesSearch && matchesStatus && matchesQualification;
  });

  const totalConversations = conversations.length;
  const activeConversations = conversations.filter((c) => c.status === 'ACTIVE').length;
  const qualifiedConversations = conversations.filter(
    (c) => c.qualificationStatus === 'QUALIFIED'
  ).length;
  const avgScore =
    conversations.length > 0
      ? Math.round(
          conversations.reduce((acc, c) => acc + c.leadScore, 0) / conversations.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          {t('conversations:title')}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {t('conversations:subtitle')}
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="rounded-xl border p-4 flex gap-3"
          style={{
            backgroundColor: 'hsl(350 89% 50% / 0.05)',
            borderColor: 'hsl(350 89% 50% / 0.2)',
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(350, 89%, 44%)' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {t('conversations:list.failedLoad')}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {error instanceof Error ? error.message : t('conversations:list.tryAgain')}
            </p>
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('conversations:stats.total'), value: totalConversations, color: 'hsl(var(--foreground))' },
          { label: t('conversations:stats.active'), value: activeConversations, color: '#4ade80' },
          { label: t('conversations:stats.qualified'), value: qualifiedConversations, color: 'hsl(38,84%,61%)' },
          { label: t('conversations:stats.avgScore'), value: avgScore || '—', color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-4 card-hover"
            style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {label}
            </p>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mt-2" style={{ color: 'hsl(var(--border))' }} />
            ) : (
              <p className="text-2xl font-bold mt-2 tabular-nums" style={{ color }}>
                {value}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div
        className="rounded-xl p-4 flex flex-col md:flex-row gap-3"
        style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="relative flex-1">
          <Search
            className="absolute inset-y-0 start-3 my-auto w-4 h-4 pointer-events-none"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          />
          <input
            type="text"
            placeholder={t('conversations:list.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors"
            style={{
              borderColor: 'hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-44 px-4 py-2.5 border rounded-lg text-sm focus:outline-none"
          style={{
            borderColor: 'hsl(var(--border))',
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          }}
        >
          <option value="ALL">{t('common:filters.allStatus')}</option>
          <option value="ACTIVE">{t('conversations:conversationStatus.ACTIVE')}</option>
          <option value="ENDED">{t('conversations:conversationStatus.ENDED')}</option>
          <option value="ABANDONED">{t('conversations:conversationStatus.ABANDONED')}</option>
        </select>

        <select
          value={filterQualification}
          onChange={(e) => setFilterQualification(e.target.value)}
          className="w-full md:w-44 px-4 py-2.5 border rounded-lg text-sm focus:outline-none"
          style={{
            borderColor: 'hsl(var(--border))',
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          }}
        >
          <option value="ALL">{t('common:filters.allQualifications')}</option>
          <option value="QUALIFIED">{t('conversations:qualification.QUALIFIED')}</option>
          <option value="MAYBE">{t('conversations:qualification.MAYBE')}</option>
          <option value="UNQUALIFIED">{t('conversations:qualification.UNQUALIFIED')}</option>
        </select>
      </div>

      {/* ── List ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {filteredConversations.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: 'hsl(var(--border))' }}
            />
            <p className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {t('conversations:list.noneFound')}
            </p>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {searchTerm || filterStatus !== 'ALL' || filterQualification !== 'ALL'
                ? t('conversations:list.adjustFilters')
                : t('conversations:list.startSimulation')}
            </p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div
              className="grid grid-cols-12 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hidden md:grid"
              style={{
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
                borderBottom: '1px solid hsl(var(--border))',
              }}
            >
              <div className="col-span-4">Lead</div>
              <div className="col-span-3">Summary</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-end">Time</div>
            </div>

            <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
              {filteredConversations.map((conv) => (
                <Link key={conv.id} href={`/conversations/${conv.id}`}>
                  <div
                    className="grid grid-cols-1 md:grid-cols-12 px-4 py-3.5 gap-2 md:gap-0 md:items-center transition-colors"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--muted))';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '';
                    }}
                  >
                    {/* Lead name + email */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(200,136,26,0.12)',
                          color: 'hsl(38,84%,61%)',
                        }}
                      >
                        {conv.leadName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>
                          {conv.leadName}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {conv.leadEmail}
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="col-span-3 min-w-0 hidden md:block">
                      <p className="text-xs line-clamp-2 pe-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {conv.summary || '—'}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="col-span-2">
                      {conv.leadScore > 0 ? (
                        <ScorePill score={conv.leadScore} qualification={conv.qualificationStatus} />
                      ) : (
                        <button
                          onClick={(e) => handleReanalyze(e, conv.id)}
                          disabled={reanalyzingId === conv.id}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors disabled:opacity-50"
                          style={{
                            borderColor: 'hsl(38 92% 50% / 0.3)',
                            color: 'hsl(38, 92%, 44%)',
                          }}
                        >
                          {reanalyzingId === conv.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          {t('conversations:actions.analyze')}
                        </button>
                      )}
                    </div>

                    {/* Status badges */}
                    <div className="col-span-2 flex flex-wrap gap-1.5">
                      <QualBadge status={conv.qualificationStatus} />
                    </div>

                    {/* Time + chevron */}
                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        <RelativeTime date={conv.createdAt} />
                      </span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
