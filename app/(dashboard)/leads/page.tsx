'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/lib/hooks/useI18n';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Search,
  Users,
  Mail,
  Phone,
  Building2,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: string;
  qualificationScore: number;
  conversationsCount: number;
  firstContactAt?: string;
  ownerViewed: boolean;
  budget?: string;
  timeline?: string;
  ownerNotes?: string;
}

function ScoreBar({ score }: { score: number }) {
  const isHot = score >= 70;
  const isWarm = score >= 45;
  const barColor = isHot
    ? 'hsl(21, 90%, 48%)'
    : isWarm
    ? 'hsl(38, 92%, 50%)'
    : 'hsl(215, 20%, 65%)';
  const textColor = isHot
    ? 'hsl(21, 90%, 38%)'
    : isWarm
    ? 'hsl(38, 92%, 38%)'
    : 'hsl(215, 20%, 42%)';
  const label = isHot ? 'Hot' : isWarm ? 'Warm' : 'Cold';

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--border))' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: barColor }} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold tabular-nums" style={{ color: textColor }}>{score}</span>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: barColor + '1a', color: textColor }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    NEW: { bg: 'hsl(38 92% 50% / 0.1)', color: 'hsl(38, 92%, 38%)', label: 'New' },
    CONTACTED: { bg: 'hsl(21 90% 48% / 0.1)', color: 'hsl(21, 90%, 38%)', label: 'Contacted' },
    QUALIFIED: { bg: 'hsl(142 76% 36% / 0.1)', color: 'hsl(142, 76%, 30%)', label: 'Qualified' },
  };
  const s = map[status] ?? map.NEW;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function LeadsPage() {
  const { user } = useAuth();
  const { t } = useI18n(['leads', 'common']);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('score');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['leads', filterStatus],
    queryFn: () => api.leads.list({ status: filterStatus !== 'ALL' ? filterStatus : undefined }),
    enabled: !!user,
  });

  const leads = (response?.data as Lead[]) || [];

  let filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesSearch && (filterStatus === 'ALL' || lead.status === filterStatus);
  });

  if (sortBy === 'score') filteredLeads.sort((a, b) => b.qualificationScore - a.qualificationScore);
  else if (sortBy === 'date') filteredLeads.sort((a, b) => new Date(b.firstContactAt || 0).getTime() - new Date(a.firstContactAt || 0).getTime());
  else if (sortBy === 'name') filteredLeads.sort((a, b) => a.name.localeCompare(b.name));

  const avgScore = leads.length > 0
    ? Math.round(leads.reduce((acc, l) => acc + l.qualificationScore, 0) / leads.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          {t('leads:title')}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {t('leads:subtitle')}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border p-4 flex gap-3" style={{ backgroundColor: 'hsl(350 89% 50% / 0.05)', borderColor: 'hsl(350 89% 50% / 0.2)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(350, 89%, 44%)' }} />
          <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{t('leads:list.failedLoad')}</p>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('leads:stats.total'), value: leads.length, color: 'hsl(var(--foreground))' },
          { label: t('leads:stats.new'), value: leads.filter((l) => l.status === 'NEW').length, color: 'hsl(38, 92%, 44%)' },
          { label: t('leads:stats.contacted'), value: leads.filter((l) => l.status === 'CONTACTED').length, color: 'hsl(21, 90%, 44%)' },
          { label: t('leads:stats.avgScore'), value: avgScore || '—', color: 'hsl(142, 76%, 32%)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border p-4 card-hover" style={{ borderColor: 'hsl(var(--border))' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</p>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mt-2" style={{ color: 'hsl(var(--border))' }} />
            ) : (
              <p className="text-2xl font-bold mt-2 tabular-nums" style={{ color }}>{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border p-4 flex flex-col md:flex-row gap-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 start-3 my-auto w-4 h-4 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input
            type="text"
            placeholder={t('leads:list.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2.5 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-40 px-4 py-2.5 border rounded-lg text-sm focus:outline-none"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
        >
          <option value="ALL">{t('common:filters.allStatus')}</option>
          <option value="NEW">{t('leads:leadStatus.NEW')}</option>
          <option value="CONTACTED">{t('leads:leadStatus.CONTACTED')}</option>
          <option value="QUALIFIED">{t('leads:leadStatus.QUALIFIED')}</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full md:w-36 px-4 py-2.5 border rounded-lg text-sm focus:outline-none"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
        >
          <option value="score">{t('leads:sort.score')}</option>
          <option value="date">{t('leads:sort.date')}</option>
          <option value="name">{t('leads:sort.name')}</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
        {/* Header */}
        <div
          className="hidden md:grid grid-cols-12 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: 'hsl(var(--muted))', borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
        >
          <div className="col-span-4">Lead</div>
          <div className="col-span-2">Company</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Activity</div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'hsl(var(--border))' }} />
            <p className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{t('leads:list.noneFound')}</p>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {searchTerm || filterStatus !== 'ALL' ? t('leads:list.adjustFilters') : t('leads:list.startConversations')}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
            {filteredLeads.map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`}>
                <div
                  className="grid grid-cols-1 md:grid-cols-12 px-5 py-4 gap-2 md:gap-0 md:items-center transition-colors"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--muted))'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Lead */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                      style={{ backgroundColor: 'hsl(38 92% 50% / 0.1)', color: 'hsl(38, 92%, 42%)' }}
                    >
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>
                        {lead.name}
                        {!lead.ownerViewed && (
                          <span className="inline-block w-2 h-2 rounded-full ms-2 align-middle" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }} />
                        )}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{lead.email}</p>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="col-span-2 hidden md:block">
                    <p className="text-sm truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {lead.company || '—'}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="col-span-2">
                    <ScoreBar score={lead.qualificationScore} />
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <StatusPill status={lead.status} />
                  </div>

                  {/* Activity */}
                  <div className="col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {lead.conversationsCount} conv.
                      </p>
                      {lead.firstContactAt && (
                        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {new Date(lead.firstContactAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
