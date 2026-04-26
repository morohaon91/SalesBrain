'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/lib/hooks/useI18n';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Search, Users, ChevronRight, Loader2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

const C = {
  card: 'hsl(228, 32%, 8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38, 25%, 90%)',
  muted: 'hsl(228, 12%, 47%)',
  gold: 'hsl(38, 84%, 61%)',
};

interface Lead {
  id: string; name: string; email: string; company?: string; phone?: string;
  status: string; qualificationScore: number; conversationsCount: number;
  firstContactAt?: string; ownerViewed: boolean; budget?: string;
  timeline?: string; ownerNotes?: string;
}

function ScoreBar({ score }: { score: number }) {
  const isHot = score >= 70;
  const isWarm = score >= 45;
  const barColor = isHot ? '#fb923c' : isWarm ? 'hsl(38,84%,61%)' : 'hsl(228,12%,47%)';
  const textColor = isHot ? '#fb923c' : isWarm ? 'hsl(38,84%,61%)' : 'hsl(228,12%,55%)';
  const label = isHot ? 'Hot' : isWarm ? 'Warm' : 'Cold';
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: barColor }} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold tabular-nums" style={{ color: textColor }}>{score}</span>
        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: barColor + '22', color: textColor }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    NEW:       { bg: 'rgba(200,136,26,0.12)', color: 'hsl(38,84%,61%)', label: 'New' },
    CONTACTED: { bg: 'rgba(249,115,22,0.12)', color: '#fb923c',         label: 'Contacted' },
    QUALIFIED: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80',          label: 'Qualified' },
  };
  const s = map[status] ?? map.NEW;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

const selectStyle = {
  background: C.card, border: `1px solid ${C.border}`, color: C.fg,
  borderRadius: '8px', padding: '10px 16px', fontSize: '14px', outline: 'none',
  colorScheme: 'dark' as const,
};

export default function LeadsPage() {
  const { user } = useAuth();
  const { t } = useI18n(['leads', 'common']);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['leads', filterStatus],
    queryFn: () => api.leads.list({ status: filterStatus !== 'ALL' ? filterStatus : undefined }),
    enabled: !!user,
  });

  const leads = (response?.data as Lead[]) || [];
  let filtered = leads.filter((l) =>
    (l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (l.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)) &&
    (filterStatus === 'ALL' || l.status === filterStatus)
  );
  if (sortBy === 'score') filtered.sort((a, b) => b.qualificationScore - a.qualificationScore);
  else if (sortBy === 'date') filtered.sort((a, b) => new Date(b.firstContactAt || 0).getTime() - new Date(a.firstContactAt || 0).getTime());
  else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  const avgScore = leads.length > 0
    ? Math.round(leads.reduce((acc, l) => acc + l.qualificationScore, 0) / leads.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Cormorant', Georgia, serif", fontSize: '28px', color: C.fg }}>
          {t('leads:title')}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: C.muted }}>{t('leads:subtitle')}</p>
      </div>

      {error && (
        <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#fb7185' }} />
          <p className="text-sm" style={{ color: '#fb7185' }}>{t('leads:list.failedLoad')}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('leads:stats.total'),     value: leads.length, color: C.fg },
          { label: t('leads:stats.new'),        value: leads.filter(l => l.status === 'NEW').length,       color: 'hsl(38,84%,61%)' },
          { label: t('leads:stats.contacted'),  value: leads.filter(l => l.status === 'CONTACTED').length, color: '#fb923c' },
          { label: t('leads:stats.avgScore'),   value: avgScore || '—',                                    color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4 transition-all duration-200 card-hover"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,136,26,0.28)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>{label}</p>
            {isLoading
              ? <Loader2 className="w-5 h-5 animate-spin mt-2" style={{ color: C.muted }} />
              : <p className="text-2xl font-semibold mt-2 tabular-nums" style={{ color, fontFamily: "'Cormorant',Georgia,serif", fontSize: '2rem' }}>{value}</p>
            }
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 flex flex-col md:flex-row gap-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 start-3 my-auto w-4 h-4 pointer-events-none" style={{ color: C.muted }} />
          <input
            type="text"
            placeholder={t('leads:list.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.fg, '--tw-ring-color': 'rgba(200,136,26,0.3)' } as React.CSSProperties}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...selectStyle, width: '160px' }}>
          <option value="ALL">{t('common:filters.allStatus')}</option>
          <option value="NEW">{t('leads:leadStatus.NEW')}</option>
          <option value="CONTACTED">{t('leads:leadStatus.CONTACTED')}</option>
          <option value="QUALIFIED">{t('leads:leadStatus.QUALIFIED')}</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...selectStyle, width: '148px' }}>
          <option value="score">{t('leads:sort.score')}</option>
          <option value="date">{t('leads:sort.date')}</option>
          <option value="name">{t('leads:sort.name')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="hidden md:grid grid-cols-12 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
          style={{ background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${C.border}`, color: C.muted }}>
          <div className="col-span-4">Lead</div>
          <div className="col-span-2">Company</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Activity</div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(200,136,26,0.08)', border: '1px solid rgba(200,136,26,0.15)' }}>
              <Users className="w-5 h-5" style={{ color: C.gold }} />
            </div>
            <p className="font-medium" style={{ color: C.fg }}>{t('leads:list.noneFound')}</p>
            <p className="text-sm mt-1" style={{ color: C.muted }}>
              {searchTerm || filterStatus !== 'ALL' ? t('leads:list.adjustFilters') : t('leads:list.startConversations')}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((lead, i) => (
              <Link key={lead.id} href={`/leads/${lead.id}`}>
                <div
                  className="grid grid-cols-1 md:grid-cols-12 px-5 py-4 gap-2 md:gap-0 md:items-center transition-all duration-150 cursor-pointer"
                  style={{ borderTop: i > 0 ? `1px solid ${C.border}` : undefined }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: 'rgba(200,136,26,0.12)', color: C.gold, border: '1px solid rgba(200,136,26,0.2)' }}>
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: C.fg }}>
                        {lead.name}
                        {!lead.ownerViewed && <span className="inline-block w-2 h-2 rounded-full ms-2 align-middle" style={{ background: C.gold }} />}
                      </p>
                      <p className="text-xs truncate" style={{ color: C.muted }}>{lead.email}</p>
                    </div>
                  </div>
                  <div className="col-span-2 hidden md:block">
                    <p className="text-sm truncate" style={{ color: C.muted }}>{lead.company || '—'}</p>
                  </div>
                  <div className="col-span-2"><ScoreBar score={lead.qualificationScore} /></div>
                  <div className="col-span-2"><StatusPill status={lead.status} /></div>
                  <div className="col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: C.muted }}>{lead.conversationsCount} conv.</p>
                      {lead.firstContactAt && (
                        <p className="text-xs" style={{ color: C.muted }}>{new Date(lead.firstContactAt).toLocaleDateString()}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
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
