'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/lib/hooks/useI18n';
import { api, type ActivationStatusResponse } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  Plus,
  Clock,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Circle,
} from 'lucide-react';
import Link from 'next/link';

interface Simulation {
  id: string;
  scenarioType: string;
  status: string;
  messageCount: number;
  duration: number;
  qualityScore: number | null;
  completedAt: string | null;
  createdAt: string;
}

const difficultyMap: Record<string, { label: string; bg: string; color: string }> = {
  PRICE_SENSITIVE: {
    label: 'Price Sensitive',
    bg: 'rgba(200,136,26,0.12)',
    color: 'hsl(38,84%,61%)',
  },
  TIME_CONSTRAINED: {
    label: 'Time Constrained',
    bg: 'rgba(74,222,128,0.1)',
    color: '#4ade80',
  },
  BUDGET_FOCUSED: {
    label: 'Budget Focused',
    bg: 'rgba(74,222,128,0.1)',
    color: '#4ade80',
  },
};

function ScenarioBadge({ type }: { type: string }) {
  const style = difficultyMap[type] ?? { label: type, bg: 'rgba(255,255,255,0.06)', color: 'hsl(228,12%,55%)' };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === 'COMPLETED' ? (
    <span
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
    >
      <CheckCircle2 className="w-3 h-3" />
      Completed
    </span>
  ) : (
    <span
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: 'rgba(200,136,26,0.12)', color: 'hsl(38,84%,61%)' }}
    >
      <PlayCircle className="w-3 h-3" />
      In Progress
    </span>
  );
}

function TrainingProgress({ activation }: { activation: ActivationStatusResponse | null }) {
  const totalSlots = 8;
  const completed = activation?.breakdown.scenarios.completed ?? 0;
  const barPct = Math.round((Math.min(completed, totalSlots) / totalSlots) * 100);

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        backgroundColor: 'hsl(222, 47%, 7%)',
        borderColor: 'hsl(222, 30%, 14%)',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'hsl(0, 0%, 92%)' }}>
            AI Training Progress
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 15%, 52%)' }}>
            {completed} of {totalSlots} required scenarios completed
          </p>
        </div>
      </div>

      <div
        className="h-1.5 rounded-full overflow-hidden mb-3"
        style={{ backgroundColor: 'hsl(222, 30%, 16%)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${barPct}%`,
            backgroundColor: 'hsl(38, 92%, 50%)',
          }}
        />
      </div>

      {/* 8 scenario slot indicators */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalSlots }, (_, i) => (
          <div key={i} className="flex items-center gap-1">
            {i < completed ? (
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'hsl(38, 92%, 55%)' }} />
            ) : (
              <Circle className="w-3.5 h-3.5" style={{ color: 'hsl(215, 15%, 38%)' }} />
            )}
            <span className="text-xs" style={{ color: 'hsl(215, 15%, 45%)' }}>
              Sim {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SimulationsPage() {
  const { user } = useAuth();
  const { t } = useI18n(['simulations', 'common']);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['simulations', filterStatus],
    queryFn: () =>
      api.simulations.list({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      }),
    enabled: !!user,
  });

  const { data: activation } = useQuery({
    queryKey: ['activation-status'],
    queryFn: () => api.profile.activationStatus(),
    enabled: !!user,
  });

  const simulations = (response?.data as Simulation[]) || [];
  const filteredSimulations = simulations.filter(
    (sim) => filterStatus === 'ALL' || sim.status === filterStatus
  );

  const completedCount = simulations.filter((s) => s.status === 'COMPLETED').length;
  const avgQuality =
    simulations.filter((s) => s.qualityScore).length > 0
      ? Math.round(
          simulations
            .filter((s) => s.qualityScore)
            .reduce((acc, s) => acc + (s.qualityScore || 0), 0) /
            simulations.filter((s) => s.qualityScore).length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {t('simulations:title')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {t('simulations:subtitle')}
          </p>
        </div>
        <Link href="/simulations/new">
          <Button
            size="sm"
            className="font-medium whitespace-nowrap"
            style={{ backgroundColor: 'hsl(38, 92%, 50%)', color: 'hsl(0,0%,100%)' }}
          >
            <Plus className="w-4 h-4 me-1.5" />
            {t('simulations:actions.new')}
          </Button>
        </Link>
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
          <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
            {t('simulations:list.failedLoad')}
          </p>
        </div>
      )}

      {/* ── Training progress ── */}
      <TrainingProgress activation={activation ?? null} />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('simulations:stats.total'), value: simulations.length, color: 'hsl(var(--foreground))' },
          { label: t('simulations:stats.completed'), value: completedCount, color: '#4ade80' },
          { label: t('simulations:stats.messages'), value: simulations.reduce((acc, s) => acc + s.messageCount, 0), color: 'hsl(38,84%,61%)' },
          { label: t('simulations:stats.avgQuality'), value: avgQuality ? `${avgQuality}%` : '—', color: '#4ade80' },
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

      {/* ── Filter ── */}
      <div
        className="rounded-xl p-3"
        style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex gap-1">
          {['ALL', 'COMPLETED', 'IN_PROGRESS'].map((status) => {
            const labels: Record<string, string> = {
              ALL: t('simulations:filters.all'),
              COMPLETED: t('simulations:filters.completed'),
              IN_PROGRESS: t('simulations:filters.inProgress'),
            };
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={
                  isActive
                    ? {
                        backgroundColor: 'rgba(200,136,26,0.12)',
                        color: 'hsl(38,84%,61%)',
                      }
                    : {
                        color: 'hsl(var(--muted-foreground))',
                      }
                }
              >
                {labels[status]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Simulation cards ── */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </div>
        ) : filteredSimulations.length === 0 ? (
          <div
            className="rounded-xl py-16 text-center"
            style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <BrainCircuit
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: 'hsl(var(--border))' }}
            />
            <p className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {t('simulations:list.noneFound')}
            </p>
            <p className="text-sm mt-1 mb-5" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {t('simulations:list.trainHint')}
            </p>
            <Link href="/simulations/new">
              <Button
                size="sm"
                style={{ backgroundColor: 'hsl(38, 92%, 50%)', color: 'hsl(0,0%,100%)' }}
              >
                {t('simulations:actions.start')}
              </Button>
            </Link>
          </div>
        ) : (
          filteredSimulations.map((sim) => (
            <Link key={sim.id} href={`/simulations/${sim.id}`}>
              <div
                className="rounded-xl p-4 transition-colors card-hover flex items-center gap-4"
                style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,136,26,0.25)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                {/* Status icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor:
                      sim.status === 'COMPLETED'
                        ? 'rgba(74,222,128,0.1)'
                        : 'rgba(200,136,26,0.12)',
                  }}
                >
                  {sim.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: '#4ade80' }} />
                  ) : (
                    <PlayCircle className="w-5 h-5" style={{ color: 'hsl(38,84%,61%)' }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <ScenarioBadge type={sim.scenarioType} />
                    <StatusBadge status={sim.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.round(sim.duration / 60)} {t('common:units.min')}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {sim.messageCount} {t('common:units.msgs')}
                    </span>
                    {sim.qualityScore !== null && (
                      <span className="flex items-center gap-1 font-semibold" style={{ color: '#4ade80' }}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        {sim.qualityScore}% quality
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {sim.completedAt
                      ? t('simulations:listMeta.completedOn', {
                          date: new Date(sim.completedAt).toLocaleDateString(),
                        })
                      : t('simulations:listMeta.inProgress')}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
