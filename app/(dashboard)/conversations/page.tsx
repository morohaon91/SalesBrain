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
  ChevronRight,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
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

function StatusBadge({
  status,
  label,
}: {
  status: 'ACTIVE' | 'ENDED' | 'ABANDONED';
  label: string;
}) {
  const styles = {
    ACTIVE: 'bg-success-100 text-success-800',
    ENDED: 'bg-primary-100 text-primary-800',
    ABANDONED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{label}</span>
  );
}

function QualificationBadge({
  status,
  label,
}: {
  status: 'QUALIFIED' | 'UNQUALIFIED' | 'MAYBE' | 'UNKNOWN';
  label: string;
}) {
  const styles = {
    QUALIFIED: 'bg-success-100 text-success-800 border-success-300',
    UNQUALIFIED: 'bg-danger-100 text-danger-800 border-danger-300',
    MAYBE: 'bg-warning-100 text-warning-800 border-warning-300',
    UNKNOWN: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const icons = {
    QUALIFIED: <CheckCircle2 className="w-4 h-4" />,
    UNQUALIFIED: <AlertCircle className="w-4 h-4" />,
    MAYBE: <Zap className="w-4 h-4" />,
    UNKNOWN: <MessageSquare className="w-4 h-4" />,
  };

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {icons[status]}
      {label}
    </div>
  );
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('conversations:title')}</h1>
        <p className="text-gray-600 text-sm sm:text-base mt-1">{t('conversations:subtitle')}</p>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-900">{t('conversations:list.failedLoad')}</p>
            <p className="text-sm text-danger-700 mt-1">
              {error instanceof Error ? error.message : t('conversations:list.tryAgain')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">{t('conversations:stats.total')}</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalConversations}</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">{t('conversations:stats.active')}</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-success-600 mt-2">{activeConversations}</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">{t('conversations:stats.qualified')}</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-primary-600 mt-2">{qualifiedConversations}</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">{t('conversations:stats.avgScore')}</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-accent-600 mt-2">{avgScore}</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex gap-3 sm:gap-4 flex-col md:flex-row">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={t('conversations:list.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">{t('common:filters.allStatus')}</option>
            <option value="ACTIVE">{t('conversations:conversationStatus.ACTIVE')}</option>
            <option value="ENDED">{t('conversations:conversationStatus.ENDED')}</option>
            <option value="ABANDONED">{t('conversations:conversationStatus.ABANDONED')}</option>
          </select>

          <select
            value={filterQualification}
            onChange={(e) => setFilterQualification(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">{t('common:filters.allQualifications')}</option>
            <option value="QUALIFIED">{t('conversations:qualification.QUALIFIED')}</option>
            <option value="MAYBE">{t('conversations:qualification.MAYBE')}</option>
            <option value="UNQUALIFIED">{t('conversations:qualification.UNQUALIFIED')}</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('conversations:list.noneFound')}</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || filterStatus !== 'ALL' || filterQualification !== 'ALL'
                ? t('conversations:list.adjustFilters')
                : t('conversations:list.startSimulation')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conv) => (
              <Link key={conv.id} href={`/conversations/${conv.id}`}>
                <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">{conv.leadName}</h3>
                        <div className="flex gap-2">
                          <StatusBadge
                            status={conv.status as 'ACTIVE' | 'ENDED' | 'ABANDONED'}
                            label={t(`conversations:conversationStatus.${conv.status}` as const)}
                          />
                          <QualificationBadge
                            status={
                              conv.qualificationStatus as
                                | 'QUALIFIED'
                                | 'UNQUALIFIED'
                                | 'MAYBE'
                                | 'UNKNOWN'
                            }
                            label={t(
                              `conversations:qualification.${conv.qualificationStatus}` as const
                            )}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 truncate">{conv.leadEmail}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{conv.summary}</p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {conv.messageCount} {t('common:units.messages')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(conv.duration / 60)} {t('common:units.min')}
                        </span>
                        <span>{new Date(conv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {conv.leadScore > 0 ? (
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{conv.leadScore}</p>
                          <p className="text-xs text-gray-500">{t('common:units.score')}</p>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleReanalyze(e, conv.id)}
                          disabled={reanalyzingId === conv.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 border border-primary-200 rounded-md hover:bg-primary-50 disabled:opacity-50"
                        >
                          {reanalyzingId === conv.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          {t('conversations:actions.analyze')}
                        </button>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {filteredConversations.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" disabled>
            {t('common:pagination.previous')}
          </Button>
          <span className="text-sm text-gray-600">
            {t('common:pagination.pageOf', { current: 1, total: 1 })}
          </span>
          <Button variant="outline" disabled>
            {t('common:pagination.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
