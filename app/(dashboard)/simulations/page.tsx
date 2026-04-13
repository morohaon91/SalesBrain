'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/lib/hooks/useI18n';
import { api } from '@/lib/api/client';
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
} from 'lucide-react';
import Link from 'next/link';

function ScenarioBadge({ type, label }: { type: string; label: string }) {
  return (
    <span className="px-2 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-medium">
      {label}
    </span>
  );
}

function StatusBadge({ status, label }: { status: 'COMPLETED' | 'IN_PROGRESS'; label: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === 'COMPLETED'
          ? 'bg-success-100 text-success-800'
          : 'bg-primary-100 text-primary-800'
      }`}
    >
      {label}
    </span>
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

  const simulations = (response?.data as any[]) || [];

  const filteredSimulations = simulations.filter((sim) => {
    return filterStatus === 'ALL' || sim.status === filterStatus;
  });

  const completedCount = simulations.filter((s) => s.status === 'COMPLETED').length;
  const totalMessages = simulations.reduce((acc, s) => acc + s.messageCount, 0);
  const avgQuality =
    simulations.filter((s) => s.qualityScore).length > 0
      ? Math.round(
          simulations
            .filter((s) => s.qualityScore)
            .reduce((acc, s) => acc + (s.qualityScore || 0), 0) /
            simulations.filter((s) => s.qualityScore).length
        )
      : 0;

  const scenarioLabel = (type: string) =>
    t(`simulations:scenarioTypes.${type}`, { defaultValue: type });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('simulations:title')}</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">{t('simulations:subtitle')}</p>
        </div>
        <Link href="/simulations/new">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t('simulations:actions.new')}</span>
            <span className="sm:hidden">{t('simulations:actions.newShort')}</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-900">{t('simulations:list.failedLoad')}</p>
            <p className="text-sm text-danger-700 mt-1">
              {error instanceof Error ? error.message : t('simulations:list.tryAgain')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">{t('simulations:stats.total')}</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{simulations.length}</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">{t('simulations:stats.completed')}</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-success-600 mt-2">{completedCount}</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">{t('simulations:stats.messages')}</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-primary-600 mt-2">{totalMessages}</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">{t('simulations:stats.avgQuality')}</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-accent-600 mt-2">{avgQuality}%</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="ALL">{t('simulations:filters.all')}</option>
          <option value="COMPLETED">{t('simulations:filters.completed')}</option>
          <option value="IN_PROGRESS">{t('simulations:filters.inProgress')}</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredSimulations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <BrainCircuit className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('simulations:list.noneFound')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('simulations:list.trainHint')}</p>
            <Link href="/simulations/new" className="mt-4 inline-block">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                {t('simulations:actions.start')}
              </Button>
            </Link>
          </div>
        ) : (
          filteredSimulations.map((sim) => (
            <Link key={sim.id} href={`/simulations/${sim.id}`}>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <ScenarioBadge type={sim.scenarioType} label={scenarioLabel(sim.scenarioType)} />
                        <StatusBadge
                          status={sim.status as 'COMPLETED' | 'IN_PROGRESS'}
                          label={t(`simulations:simStatus.${sim.status}`)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs sm:text-sm flex-wrap">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {Math.round(sim.duration / 60)} {t('common:units.min')}
                      </span>
                      <span className="flex items-center gap-2 text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        {sim.messageCount} {t('common:units.msgs')}
                      </span>
                      {sim.qualityScore !== null && (
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success-600" />
                          <span className="font-semibold text-success-600">{sim.qualityScore}%</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {sim.completedAt
                        ? t('simulations:listMeta.completedOn', {
                            date: new Date(sim.completedAt).toLocaleDateString(),
                          })
                        : t('simulations:listMeta.inProgress')}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {simulations.length === 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-primary-900 mb-2">{t('simulations:howTo.title')}</h3>
          <ol className="space-y-2 text-sm text-primary-800 list-decimal list-inside">
            <li>{t('simulations:howTo.step1')}</li>
            <li>{t('simulations:howTo.step2')}</li>
            <li>{t('simulations:howTo.step3')}</li>
            <li>{t('simulations:howTo.step4')}</li>
          </ol>
        </div>
      )}
    </div>
  );
}
