'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { TFunction } from 'i18next';
import { useI18n } from '@/lib/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import instance from '@/lib/api/client';
import type { RawExtractionResponse } from '@/lib/extraction/schemas';

type PendingPayload = (RawExtractionResponse & {
  simulationId: string;
  scenarioType: string;
}) | null;

interface PendingPatterns {
  success: boolean;
  data: PendingPayload;
}

interface ApprovalStatus {
  [key: string]: 'approved' | 'rejected' | 'pending';
}

const CATEGORY_DEFS = [
  { id: 'communication', key: 'communicationStyle' },
  { id: 'pricing', key: 'pricingLogic' },
  { id: 'qualification', key: 'qualificationCriteria' },
  { id: 'objections', key: 'objectionHandling' },
  { id: 'decision', key: 'decisionMakingPatterns' },
  { id: 'voice', key: 'ownerVoiceExamples' },
] as const;

export default function ValidatePatternsPage() {
  const { t } = useI18n(['profile', 'common']);
  const router = useRouter();
  const [patterns, setPatterns] = useState<RawExtractionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({});
  const [savingAll, setSavingAll] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('communication');

  useEffect(() => {
    fetchPendingPatterns();
  }, []);

  const fetchPendingPatterns = async () => {
    try {
      setLoading(true);
      const response = await instance.get<PendingPatterns>('/profile/validate');
      const data = response.data;

      if (data.data) {
        setPatterns(data.data);
        const initial: ApprovalStatus = {};
        CATEGORY_DEFS.forEach((c) => {
          if ((data.data as any)[c.key]) initial[c.key] = 'pending';
        });
        setApprovalStatus(initial);
      } else {
        setError(t('profile:patternValidate.noPending'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile:patternValidate.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const approveField = async (field: string) => {
    if (!patterns) return;
    try {
      setSavingField(field);
      const value = (patterns as any)[field];
      await instance.post('/profile/validate/approve', { field, value });
      setApprovalStatus((prev) => ({ ...prev, [field]: 'approved' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile:patternValidate.approveFailed'));
    } finally {
      setSavingField(null);
    }
  };

  const rejectField = async (field: string) => {
    try {
      setSavingField(field);
      await instance.post('/profile/validate/reject', { field });
      setApprovalStatus((prev) => ({ ...prev, [field]: 'rejected' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile:patternValidate.rejectFailed'));
    } finally {
      setSavingField(null);
    }
  };

  const approveAll = async () => {
    try {
      setSavingAll(true);
      await instance.post('/profile/validate/approve-all', {});
      const newStatus: ApprovalStatus = {};
      Object.keys(approvalStatus).forEach((k) => (newStatus[k] = 'approved'));
      setApprovalStatus(newStatus);
      setTimeout(() => router.push('/profile'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile:patternValidate.approveAllFailed'));
    } finally {
      setSavingAll(false);
    }
  };

  const approvedCount = Object.values(approvalStatus).filter((s) => s === 'approved').length;
  const totalCount = Object.keys(approvalStatus).length;
  const allApproved = approvedCount === totalCount && totalCount > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('profile:patternValidate.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !patterns) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
          <span>{t('common:buttons.back')}</span>
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patterns) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
          <span>{t('common:buttons.back')}</span>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{t('profile:patternValidate.emptyTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{t('profile:patternValidate.emptyBody')}</p>
            <Button onClick={() => router.push('/profile')}>{t('profile:patternValidate.returnProfile')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = CATEGORY_DEFS.filter((cat) => (patterns as any)[cat.key]);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('profile:patternValidate.pageTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('profile:patternValidate.pageSubtitle')}</p>
        </div>
        <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
          <span>{t('common:buttons.back')}</span>
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {t('profile:patternValidate.progress', { approved: approvedCount, total: totalCount })}
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalCount > 0 ? (approvedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
            {allApproved && (
              <Button onClick={approveAll} disabled={savingAll} className="ml-4 bg-green-600 hover:bg-green-700">
                {savingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {t('profile:patternValidate.complete')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(`profile:patternValidate.categories.${cat.id}`)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          if (activeCategory !== cat.id) return null;
          const pattern = (patterns as any)[cat.key];
          const status = approvalStatus[cat.key];
          return (
            <div key={cat.id} className="space-y-4">
              <PatternCard
                title={t(`profile:patternValidate.categories.${cat.id}`)}
                pattern={pattern}
                status={status}
                onApprove={() => approveField(cat.key)}
                onReject={() => rejectField(cat.key)}
                isSaving={savingField === cat.key}
                t={t}
              />
            </div>
          );
        })}
      </div>

      {typeof (patterns as any).overallQuality === 'number' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('profile:patternValidate.extractionQuality')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('profile:patternValidate.overallQuality')}</p>
                <p className="text-2xl font-bold">{(patterns as any).overallQuality}/100</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('profile:patternValidate.extractionConfidence')}</p>
                <p className="text-2xl font-bold">{(patterns as any).extractionConfidence ?? 0}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          {t('profile:patternValidate.cancel')}
        </Button>
        <Button
          onClick={approveAll}
          disabled={!allApproved || savingAll}
          className="bg-green-600 hover:bg-green-700"
        >
          {savingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {allApproved
            ? t('profile:patternValidate.completeReview')
            : t('profile:patternValidate.approveAll', { approved: approvedCount, total: totalCount })}
        </Button>
      </div>
    </div>
  );
}

interface PatternCardProps {
  title: string;
  pattern: any;
  status: string;
  onApprove: () => void;
  onReject: () => void;
  isSaving: boolean;
  t: TFunction;
}

function PatternCard({ title, pattern, status, onApprove, onReject, isSaving, t }: PatternCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> {t('profile:patternValidate.badges.approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> {t('profile:patternValidate.badges.rejected')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="w-3 h-3 mr-1" /> {t('profile:patternValidate.badges.pending')}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded p-4 text-sm border border-gray-200">
          <pre className="whitespace-pre-wrap font-mono text-xs overflow-auto max-h-96">
            {JSON.stringify(pattern, null, 2)}
          </pre>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onReject} disabled={isSaving || status === 'rejected'}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {t('profile:patternValidate.reject')}
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isSaving || status === 'approved'}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {t('profile:patternValidate.approve')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
