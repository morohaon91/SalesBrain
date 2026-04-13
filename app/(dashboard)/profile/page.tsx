'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api/client';
import { INDUSTRY_LIST, getIndustryTemplate } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/hooks/useI18n';
import { rtlMirrorIcon } from '@/lib/i18n/rtl-icons';

type TabType = 'basic-info' | 'extracted-patterns';

interface ProfileData {
  id: string;
  isComplete: boolean;
  completionScore: number;
  industry?: string | null;
  serviceDescription?: string | null;
  targetClientType?: string | null;
  typicalBudgetRange?: string | null;
  commonClientQuestions?: string[];
  communicationStyle?: any;
  pricingLogic?: any;
  qualificationCriteria?: any;
  objectionHandling?: any;
  decisionMakingPatterns?: any;
  ownerVoiceExamples?: any;
  profileApprovalStatus?: string | null;
  completionPercentage?: number;
  completionBreakdown?: Record<string, number>;
  simulationCount?: number;
  lastExtractedAt?: string | null;
  embeddingsCount: number;
  widgetApiKey?: string | null;
  leadChatPath?: string | null;
  leadConversationsActive?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t, isHebrew } = useI18n(['profile', 'common']);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('basic-info');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'info' | 'error'; text: string } | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '');
  }, []);

  // Form State
  const [industry, setIndustry] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [targetClientType, setTargetClientType] = useState('');
  const [typicalBudgetRange, setTypicalBudgetRange] = useState('');
  const [commonQuestions, setCommonQuestions] = useState<string[]>([]);

  // Fetch profile
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.profile.get(),
    enabled: !!user,
  });

  const profile = response?.data as ProfileData | undefined;

  // Populate form state when profile loads
  useEffect(() => {
    if (profile) {
      setIndustry(profile.industry || '');
      setServiceDescription(profile.serviceDescription || '');
      setTargetClientType(profile.targetClientType || '');
      setTypicalBudgetRange(profile.typicalBudgetRange || '');
      setCommonQuestions(profile.commonClientQuestions || []);
    }
  }, [profile]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<ProfileData>) => api.profile.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const resetProfileMutation = useMutation({
    mutationFn: () => api.profile.reset(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const reExtractMutation = useMutation({
    mutationFn: () => api.profile.reExtract(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      if (data?.data?.simulationsProcessed > 0) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        // No simulations yet
        setAlertMessage({
          type: 'info',
          text: t('messages.noSimulationsInfo'),
        });
        setTimeout(() => setAlertMessage(null), 5000);
      }
    },
  });

  // Handlers
  const handleAddQuestion = () => {
    setCommonQuestions([...commonQuestions, '']);
  };

  const handleRemoveQuestion = (index: number) => {
    setCommonQuestions(commonQuestions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, value: string) => {
    const updated = [...commonQuestions];
    updated[index] = value;
    setCommonQuestions(updated);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        industry,
        serviceDescription,
        targetClientType,
        typicalBudgetRange,
        commonClientQuestions: commonQuestions.filter(q => q.trim()),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm(t('messages.resetConfirm'))) return;
    try {
      await resetProfileMutation.mutateAsync();
    } catch (err) {
      console.error('Failed to reset profile:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-danger-900">{t('messages.loadError')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('businessProfile.title')}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            {t('businessProfile.subtitle')}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap flex-shrink-0">
          <Button variant="outline" className="flex items-center gap-2 text-sm whitespace-nowrap">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('businessProfile.export')}</span>
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4 flex gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-success-900">{t('messages.saveSuccess')}</p>
        </div>
      )}

      {/* Alert Message */}
      {alertMessage && (
        <div
          className={`rounded-lg p-4 flex gap-3 animate-in fade-in ${
            alertMessage.type === 'info'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-danger-50 border border-danger-200'
          }`}
        >
          {alertMessage.type === 'info' ? (
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              alertMessage.type === 'info' ? 'text-blue-900' : 'text-danger-900'
            }`}
          >
            {alertMessage.text}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('basic-info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'basic-info'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('businessProfile.tabBasic')}
          </button>
          <button
            onClick={() => setActiveTab('extracted-patterns')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'extracted-patterns'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('businessProfile.tabExtracted')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'basic-info' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t('businessProfile.businessInfoTitle')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('businessProfile.businessInfoHint')}
              </p>
            </div>

            <div className="space-y-6 mt-6">
              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('businessProfile.industry')}
                </label>
                <Select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  options={INDUSTRY_LIST}
                  disabled={isSaving}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('businessProfile.industryHint')}
                </p>
              </div>

              {/* Service Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('businessProfile.serviceDescription')}
                </label>
                <Textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder={t('businessProfile.servicePlaceholder')}
                  rows={4}
                  disabled={isSaving}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('businessProfile.serviceHint')}
                </p>
              </div>

              {/* Target Client Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('businessProfile.targetClient')}
                </label>
                <Input
                  value={targetClientType}
                  onChange={(e) => setTargetClientType(e.target.value)}
                  placeholder={t('businessProfile.targetPlaceholder')}
                  disabled={isSaving}
                />
              </div>

              {/* Typical Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('businessProfile.budgetRange')}
                </label>
                <Input
                  value={typicalBudgetRange}
                  onChange={(e) => setTypicalBudgetRange(e.target.value)}
                  placeholder={t('businessProfile.budgetPlaceholder')}
                  disabled={isSaving}
                />
              </div>

              {/* Common Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('businessProfile.commonQuestions')}
                </label>
                <div className="space-y-2">
                  {commonQuestions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={question}
                        onChange={(e) => handleUpdateQuestion(index, e.target.value)}
                        placeholder={t('businessProfile.questionPlaceholder')}
                        disabled={isSaving}
                      />
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveQuestion(index)}
                        disabled={isSaving}
                        className="flex-shrink-0"
                      >
                        {t('businessProfile.remove')}
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={handleAddQuestion}
                  disabled={isSaving}
                  className="mt-2 w-full"
                >
                  {t('businessProfile.addQuestion')}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-6 border-t border-gray-200">
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('businessProfile.saving')}
                  </>
                ) : (
                  t('actions.save')
                )}
              </Button>
              <Button
                onClick={handleResetToDefaults}
                variant="outline"
                disabled={isSaving}
              >
                {t('businessProfile.resetDefaults')}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'extracted-patterns' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t('businessProfile.extractedTitle')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('businessProfile.extractedIntro')}
              </p>
            </div>

            {/* 70%+ Go-Live CTA Banner */}
            {/* Shareable lead chat link (after go-live) */}
            {profile?.leadConversationsActive && profile?.leadChatPath && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{t('businessProfile.leadChatTitle')}</h3>
                <p className="text-xs text-slate-600 mb-2">
                  {t('businessProfile.leadChatHint')}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <code className="flex-1 text-xs bg-white border rounded px-2 py-1.5 break-all">
                    {origin ? `${origin}${profile.leadChatPath}` : profile.leadChatPath}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      const url = origin ? `${origin}${profile.leadChatPath}` : profile.leadChatPath ?? '';
                      void navigator.clipboard.writeText(url);
                    }}
                  >
                    {t('businessProfile.copyLink')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      const url = origin ? `${origin}${profile.leadChatPath}` : profile.leadChatPath ?? '';
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    {t('businessProfile.open')}
                  </Button>
                </div>
              </div>
            )}

            {(() => {
              const pct = profile?.completionPercentage ?? 0;
              const status = profile?.profileApprovalStatus;
              const isLive = status === 'APPROVED' || status === 'LIVE';
              if (pct >= 70 && !isLive) {
                return (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">{t('businessProfile.readinessTitle', { pct })}</p>
                      <p className="text-sm text-blue-700 mt-0.5">{t('businessProfile.readinessBody')}</p>
                    </div>
                    <Link href="/profile/approve">
                      <Button size="sm" className="whitespace-nowrap inline-flex items-center gap-1.5">
                        <span>{t('businessProfile.reviewApprove')}</span>
                        <ArrowRight className={rtlMirrorIcon(isHebrew, 'h-4 w-4 shrink-0')} aria-hidden />
                      </Button>
                    </Link>
                  </div>
                );
              }
              if (isLive) {
                return (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-green-900">{t('businessProfile.liveBanner')}</p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Completion Progress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">{t('businessProfile.completionLabel')}</span>
                <span className="text-2xl font-bold text-primary-600">
                  {profile?.completionPercentage ?? 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all ${
                    (profile?.completionPercentage ?? 0) >= 70
                      ? 'bg-green-500'
                      : 'bg-primary-600'
                  }`}
                  style={{ width: `${profile?.completionPercentage ?? 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {(profile?.simulationCount ?? 0) === 1
                    ? t('businessProfile.oneSimDone')
                    : t('businessProfile.manySimDone', { count: profile?.simulationCount ?? 0 })}
                  {profile?.lastExtractedAt
                    ? t('businessProfile.lastExtracted', {
                        date: new Date(profile.lastExtractedAt).toLocaleDateString(),
                      })
                    : ''}
                </span>
                {(profile?.completionPercentage ?? 0) < 70 && (
                  <span className="text-blue-600 font-medium">
                    {t('businessProfile.toGoLive', {
                      pct: 70 - (profile?.completionPercentage ?? 0),
                    })}
                  </span>
                )}
              </div>
              {/* Section breakdown */}
              {profile?.completionBreakdown && (
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 border-t border-gray-200 pt-3">
                  {[
                    [t('businessProfile.breakdownQuestionnaire'), profile.completionBreakdown.questionnaire, 20],
                    [t('businessProfile.breakdownCommunication'), profile.completionBreakdown.communicationStyle, 15],
                    [t('businessProfile.breakdownPricing'), profile.completionBreakdown.pricingLogic, 15],
                    [t('businessProfile.breakdownQualification'), profile.completionBreakdown.qualificationCriteria, 15],
                    [t('businessProfile.breakdownObjections'), profile.completionBreakdown.objectionHandling, 15],
                    [t('businessProfile.breakdownDecision'), profile.completionBreakdown.decisionMaking, 10],
                    [t('businessProfile.breakdownFacts'), profile.completionBreakdown.businessFacts, 10],
                  ].map(([label, pts, max]) => (
                    <div key={label as string} className="flex justify-between">
                      <span>{label as string}</span>
                      <span className={(pts as number) === 0 ? 'text-red-400' : 'text-green-600 font-medium'}>
                        {pts as number}/{max as number}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patterns or Empty State */}
            {(profile?.completionPercentage || 0) > 20 ? (
              <div className="space-y-6">
                {/* Communication Style */}
                {profile?.communicationStyle && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t('businessProfile.commStyle')}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {profile.communicationStyle.tone && (
                        <div>
                          <span className="text-sm text-gray-600">{t('businessProfile.tone')}</span>
                          <p className="font-medium text-gray-900">
                            {profile.communicationStyle.tone}
                          </p>
                        </div>
                      )}
                      {profile.communicationStyle.style && (
                        <div>
                          <span className="text-sm text-gray-600">{t('businessProfile.style')}</span>
                          <p className="font-medium text-gray-900">
                            {profile.communicationStyle.style}
                          </p>
                        </div>
                      )}
                      {profile.communicationStyle.keyPhrases?.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">{t('businessProfile.keyPhrases')}</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.communicationStyle.keyPhrases.map(
                              (phrase: string, i: number) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                                >
                                  "{phrase}"
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Logic */}
                {profile?.pricingLogic && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">{t('businessProfile.pricingLogic')}</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {profile.pricingLogic.minBudget && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            {t('businessProfile.minBudget', {
                              amount: profile.pricingLogic.minBudget.toLocaleString(),
                            })}
                          </span>
                        </div>
                      )}
                      {profile.pricingLogic.maxBudget && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            {t('businessProfile.maxBudget', {
                              amount: profile.pricingLogic.maxBudget.toLocaleString(),
                            })}
                          </span>
                        </div>
                      )}
                      {profile.pricingLogic.flexibilityFactors?.map(
                        (factor: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">
                              {t('businessProfile.flexibleOn', { factor })}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Qualification Criteria */}
                {profile?.qualificationCriteria && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t('businessProfile.qualificationTitle')}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {profile.qualificationCriteria.dealBreakers?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {t('businessProfile.dealBreakers')}
                          </h4>
                          <ul className="space-y-1">
                            {profile.qualificationCriteria.dealBreakers.map(
                              (db: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{db}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {profile.qualificationCriteria.greenFlags?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {t('businessProfile.greenFlags')}
                          </h4>
                          <ul className="space-y-1">
                            {profile.qualificationCriteria.greenFlags.map(
                              (gf: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{gf}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Objection Handling */}
                {profile?.objectionHandling && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t('businessProfile.objectionTitle')}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {Object.entries(profile.objectionHandling).map(
                        ([type, response], i) => (
                          <div key={i}>
                            <span className="text-sm font-medium text-gray-700">
                              {type.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {response as string}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Decision Making Patterns */}
                {profile?.decisionMakingPatterns && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t('businessProfile.decisionTitle')}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {profile.decisionMakingPatterns.whenToSayYes?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {t('businessProfile.whenYes')}
                          </h4>
                          <ul className="space-y-1">
                            {profile.decisionMakingPatterns.whenToSayYes.map(
                              (item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {profile.decisionMakingPatterns.whenToSayNo?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {t('businessProfile.whenNo')}
                          </h4>
                          <ul className="space-y-1">
                            {profile.decisionMakingPatterns.whenToSayNo.map(
                              (item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {profile.decisionMakingPatterns.warningSignsToWatch?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {t('businessProfile.warningSigns')}
                          </h4>
                          <ul className="space-y-1">
                            {profile.decisionMakingPatterns.warningSignsToWatch.map(
                              (item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => reExtractMutation.mutateAsync()}
                    disabled={reExtractMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {reExtractMutation.isPending
                      ? t('businessProfile.reextracting')
                      : t('businessProfile.reextract')}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {t('businessProfile.exportProfile')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('businessProfile.notBuiltTitle')}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-4">
                  {t('businessProfile.notBuiltBody')}
                </p>
                <ul className="text-left inline-block text-gray-600 space-y-1">
                  <li>• {t('businessProfile.bullet1')}</li>
                  <li>• {t('businessProfile.bullet2')}</li>
                  <li>• {t('businessProfile.bullet3')}</li>
                  <li>• {t('businessProfile.bullet4')}</li>
                </ul>
                <div className="flex flex-col gap-3 items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => reExtractMutation.mutateAsync()}
                    disabled={reExtractMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {reExtractMutation.isPending
                      ? t('businessProfile.checkingUpdates')
                      : t('businessProfile.checkUpdates')}
                  </Button>
                  <Button
                    onClick={() => router.push('/simulations/new')}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {t('businessProfile.startFirstSim')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
