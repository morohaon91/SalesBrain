'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/hooks/useI18n';
import { authFetch } from '@/lib/api/auth-fetch';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApprovalSummary from '@/components/profile/ApprovalSummary';
import ApprovalConfirmation from '@/components/profile/ApprovalConfirmation';
import type { ActivationStatusResponse } from '@/lib/api/client';

export default function ProfileApprovePage() {
  const { t } = useI18n(['profile', 'common']);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [report, setReport] = useState<ActivationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, activationRes] = await Promise.all([
        authFetch('/api/v1/profile'),
        authFetch('/api/v1/profiles/activation-status'),
      ]);
      if (!profileRes.ok) throw new Error(t('profile:patternApprove.loadFailed'));
      if (!activationRes.ok) throw new Error(t('profile:patternApprove.loadActivationFailed'));

      const profileData = await profileRes.json();
      const activationData = (await activationRes.json()) as ActivationStatusResponse;
      setProfile(profileData.data ?? profileData);
      setReport(activationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile:patternApprove.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const res = await authFetch('/api/v1/profile/approve', { method: 'POST' });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error?.message ?? 'Approval failed');
    }
    router.push('/dashboard?approval=success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !profile || !report) {
    return <div className="text-center text-red-600 py-12">{error ?? t('profile:patternApprove.couldNotLoad')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="inline-flex items-center gap-1.5" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <span>{t('common:buttons.back')}</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('profile:patternApprove.title')}</h1>
          <p className="text-gray-600 text-sm">{t('profile:patternApprove.subtitle')}</p>
        </div>
      </div>

      <ApprovalSummary profile={profile} report={report} />

      <ApprovalConfirmation isReady={report.canRequestGoLive} onApprove={handleApprove} />
    </div>
  );
}
