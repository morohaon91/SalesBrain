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
import { Label } from '@/components/ui/label';
import MultiInputField from '@/components/onboarding/MultiInputField';

type TabType = 'extracted-patterns' | 'basic-info';

interface ProfileData {
  id: string;
  isComplete: boolean;
  completionScore: number;
  industry?: string | null;
  serviceDescription?: string | null;
  targetClientType?: string | null;
  typicalBudgetRange?: string | null;
  commonClientQuestions?: string[];
  yearsExperience?: number | null;
  certifications?: string[];
  serviceArea?: string | null;
  teamSize?: string | null;
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
  embeddingsCount?: number;
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
  const [activeTab, setActiveTab] = useState<TabType>('extracted-patterns');
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
  const [yearsExperience, setYearsExperience] = useState<number | null>(null);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [serviceArea, setServiceArea] = useState('');
  const [teamSize, setTeamSize] = useState('');

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

  const { data: readiness } = useQuery({
    queryKey: ['activation-status'],
    queryFn: () => api.profile.activationStatus(),
    enabled: !!user,
  });

  const [showGateDetails, setShowGateDetails] = useState(false);

  // Populate form state when profile loads
  useEffect(() => {
    if (profile) {
      setIndustry(profile.industry || '');
      setServiceDescription(profile.serviceDescription || '');
      setTargetClientType(profile.targetClientType || '');
      setTypicalBudgetRange(profile.typicalBudgetRange || '');
      setCommonQuestions(profile.commonClientQuestions || []);
      setYearsExperience(profile.yearsExperience ?? null);
      setCertifications(profile.certifications || []);
      setServiceArea(profile.serviceArea || '');
      setTeamSize(profile.teamSize || '');
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
        yearsExperience,
        certifications: certifications.filter(c => c.trim()),
        serviceArea,
        teamSize,
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
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {t('businessProfile.title')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {t('businessProfile.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* AI Active indicator */}
          {(() => {
            const s = profile?.profileApprovalStatus;
            const isLive = s === 'APPROVED' || s === 'LIVE';
            return isLive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'hsl(142 76% 36% / 0.1)', color: 'hsl(142, 76%, 30%)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(142, 76%, 40%)' }} />
                AI is live
              </div>
            ) : null;
          })()}
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
      <div style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="flex gap-0">
          {([
            { id: 'extracted-patterns' as TabType, label: t('businessProfile.tabExtracted') },
            { id: 'basic-info' as TabType, label: t('businessProfile.tabBasic') },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={activeTab === tab.id
                ? { color: 'hsl(38, 92%, 44%)', borderColor: 'hsl(38, 92%, 50%)' }
                : { color: 'hsl(var(--muted-foreground))', borderColor: 'transparent' }
              }
            >
              {tab.label}
            </button>
          ))}
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

              {/* Service Area */}
              <div>
                <Label htmlFor="serviceArea" className="text-sm font-medium text-gray-700">
                  Service Area
                </Label>
                <Input
                  id="serviceArea"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Greater New York, Remote — US only"
                  disabled={isSaving}
                  className="mt-2"
                />
              </div>

              {/* Team Size */}
              <div>
                <Label htmlFor="teamSize" className="text-sm font-medium text-gray-700">
                  Team Size
                </Label>
                <Select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="Select team size"
                  options={[
                    { value: 'Solo', label: 'Solo (just me)' },
                    { value: '2-5', label: '2–5 people' },
                    { value: '6-10', label: '6–10 people' },
                    { value: '10+', label: '10+ people' },
                  ]}
                  disabled={isSaving}
                  className="mt-2"
                />
              </div>

              {/* Years of Experience */}
              <div>
                <Label htmlFor="yearsExperience" className="text-sm font-medium text-gray-700">
                  Years of Experience
                </Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="100"
                  value={yearsExperience ?? ''}
                  onChange={(e) => setYearsExperience(e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder="e.g. 10"
                  disabled={isSaving}
                  className="mt-2 w-40"
                />
              </div>

              {/* Certifications */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Certifications / Licenses
                </Label>
                <p className="text-sm text-gray-500 mt-0.5 mb-2">
                  Professional certifications relevant to your work
                </p>
                <MultiInputField
                  values={certifications}
                  onChange={setCertifications}
                  placeholder="e.g. PMP, AWS Solutions Architect"
                  maxItems={20}
                  addButtonText="+ Add Certification"
                />
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
              const status = profile?.profileApprovalStatus;
              const isLive = status === 'APPROVED' || status === 'LIVE';
              if (readiness?.canRequestGoLive && !isLive) {
                return (
                  <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'hsl(38 92% 50% / 0.06)', borderColor: 'hsl(38 92% 50% / 0.25)' }}>
                    <Zap className="h-5 w-5 flex-shrink-0" style={{ color: 'hsl(38, 92%, 44%)' }} />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">{t('businessProfile.readinessTitleGates')}</p>
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

            {/* Go-Live Gates */}
            {readiness && !readiness.canRequestGoLive && (
              <div className="bg-gray-50 rounded-lg p-4">
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
                  <button
                    type="button"
                    onClick={() => setShowGateDetails((v) => !v)}
                    className="text-blue-600 font-medium hover:underline cursor-pointer"
                  >
                    {t('businessProfile.gatesPending', {
                      remaining: readiness.gates.filter((g) => g.status === 'BLOCKED').length,
                      total: readiness.gates.length,
                    })}
                    {' '}
                    {showGateDetails ? '▲' : '▼'}
                  </button>
                </div>

                {showGateDetails && (
                  <div className="mt-3 border-t border-gray-200 pt-3 space-y-2">
                    {readiness.gates.map((gate) => (
                      <div key={gate.gateId} className="text-xs">
                        <div className="flex items-center gap-2">
                          {gate.status === 'PASSED' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          )}
                          <span className={gate.status === 'PASSED' ? 'text-gray-900' : 'text-gray-700 font-medium'}>
                            {gate.name}
                          </span>
                          <span className="text-gray-400 ml-auto">{Math.round(gate.progress)}%</span>
                        </div>
                        {gate.blockingReasons.length > 0 && (
                          <ul className="mt-1 ml-6 list-disc list-inside text-gray-500 space-y-0.5">
                            {gate.blockingReasons.slice(0, 3).map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    {readiness.nextScenario && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                        <span className="font-medium">{t('businessProfile.nextScenarioLabel')}:</span>{' '}
                        {readiness.nextScenario.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Extracted Data Coverage */}
            {(() => {
              const bd = profile?.completionBreakdown as any;
              if (!bd) return null;
              const sections: Array<{ label: string; pts: number; max: number; needsSim?: boolean }> = [
                { label: 'Questionnaire', pts: bd.questionnaire ?? 0, max: 10 },
                { label: 'Communication Style', pts: bd.communicationStyle ?? 0, max: 20, needsSim: true },
                { label: 'Objection Handling', pts: bd.objectionHandling ?? 0, max: 20, needsSim: true },
                { label: 'Decision Making', pts: bd.decisionMaking ?? 0, max: 20, needsSim: true },
                { label: 'Qualification Criteria', pts: bd.qualificationCriteria ?? 0, max: 15, needsSim: true },
                { label: 'Pricing Logic', pts: bd.pricingLogic ?? 0, max: 15, needsSim: true },
              ];
              return (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Extracted Data Coverage</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    How much detail has been captured from your simulations.{' '}
                    <span className="italic">This does not affect your go-live readiness score.</span>
                  </p>
                  <div className="space-y-3">
                    {sections.map(({ label, pts, max, needsSim }) => {
                      const pct = Math.round((pts / max) * 100);
                      const full = pts === max;
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">{label}</span>
                            <div className="flex items-center gap-2">
                              {full && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                              <span className={`text-xs font-mono ${full ? 'text-green-600' : pts === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                                {pts}/{max}
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${full ? 'bg-green-500' : pts > 0 ? 'bg-amber-400' : 'bg-gray-200'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {pts === 0 && needsSim && (
                            <p className="text-xs text-gray-400 mt-0.5">Complete more simulations to populate this section.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    {profile?.simulationCount ?? 0} simulation{(profile?.simulationCount ?? 0) !== 1 ? 's' : ''} completed
                    {profile?.lastExtractedAt ? ` · Last extracted ${new Date(profile.lastExtractedAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
              );
            })()}

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
                          <p className="font-medium text-gray-900 capitalize">
                            {profile.communicationStyle.tone}
                          </p>
                        </div>
                      )}
                      {profile.communicationStyle.energyLevel && (
                        <div>
                          <span className="text-sm text-gray-600">Energy</span>
                          <p className="font-medium text-gray-900 capitalize">
                            {profile.communicationStyle.energyLevel}
                          </p>
                        </div>
                      )}
                      {profile.communicationStyle.verbosityPattern && (
                        <div>
                          <span className="text-sm text-gray-600">Verbosity</span>
                          <p className="font-medium text-gray-900 capitalize">
                            {profile.communicationStyle.verbosityPattern}
                          </p>
                        </div>
                      )}
                      {profile.communicationStyle.commonPhrases?.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Common Phrases</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.communicationStyle.commonPhrases.map(
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
                      {profile.pricingLogic.minimumBudget && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            Minimum: ${profile.pricingLogic.minimumBudget.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {profile.pricingLogic.preferredBudgetRange && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            Preferred range: {profile.pricingLogic.preferredBudgetRange}
                          </span>
                        </div>
                      )}
                      {(Array.isArray(profile.pricingLogic.flexibleOn)
                        ? profile.pricingLogic.flexibleOn
                        : []
                      ).map((item: string, i: number) => (
                        <div key={`flex-${i}`} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Flexible on: {item}</span>
                        </div>
                      ))}
                      {(Array.isArray(profile.pricingLogic.notFlexibleOn)
                        ? profile.pricingLogic.notFlexibleOn
                        : []
                      ).map((item: string, i: number) => (
                        <div key={`nf-${i}`} className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Not flexible on: {item}</span>
                        </div>
                      ))}
                      {profile.pricingLogic.priceDefenseStrategy && (
                        <div className="pt-2">
                          <span className="text-xs text-gray-600">Price defense:</span>
                          <p className="text-sm">{profile.pricingLogic.priceDefenseStrategy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Qualification Criteria */}
                {(() => {
                  const qc = profile?.qualificationCriteria;
                  const hasAny =
                    (qc?.dealBreakers?.length ?? 0) > 0 ||
                    (qc?.greenFlags?.length ?? 0) > 0 ||
                    (qc?.redFlags?.length ?? 0) > 0;
                  return (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t('businessProfile.qualificationTitle')}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {!hasAny && (
                        <p className="text-sm text-gray-500 italic">
                          {t('businessProfile.qualificationEmpty')}
                        </p>
                      )}
                      {qc?.dealBreakers?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {t('businessProfile.dealBreakers')}
                          </h4>
                          <ul className="space-y-1">
                            {qc.dealBreakers.map(
                              (db: any, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{db.rule ?? db}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {qc?.greenFlags?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {t('businessProfile.greenFlags')}
                          </h4>
                          <ul className="space-y-1">
                            {qc.greenFlags.map(
                              (gf: any, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{gf.description ?? gf.flagType ?? gf}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {qc?.redFlags?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Red Flags</h4>
                          <ul className="space-y-1">
                            {qc.redFlags.map(
                              (rf: any, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{rf.description ?? rf.flagType ?? rf}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })()}

                {/* Objection Handling */}
                {(() => {
                  const playbooks = profile?.objectionHandling?.playbooks ?? [];
                  return (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t('businessProfile.objectionTitle')}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {playbooks.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          {t('businessProfile.objectionEmpty')}
                        </p>
                      )}
                      {playbooks.map(
                        (pb: any, i: number) => (
                          <div key={i} className="border-b last:border-b-0 pb-2 last:pb-0">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {pb.objectionType}
                            </span>
                            {pb.responseStrategy && (
                              <p className="text-sm text-gray-600 mt-1">{pb.responseStrategy}</p>
                            )}
                            {pb.responseExamples?.length > 0 && (
                              <ul className="mt-1 space-y-1">
                                {pb.responseExamples.slice(0, 2).map((ex: string, j: number) => (
                                  <li key={j} className="text-xs text-gray-500 italic">"{ex}"</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  );
                })()}

                {/* Decision Making Patterns */}
                {(() => {
                  const dm = profile?.decisionMakingPatterns;
                  const hasAny =
                    (dm?.discovery?.firstQuestions?.length ?? 0) > 0 ||
                    !!dm?.valuePositioning?.primaryValueLens ||
                    !!dm?.closing?.preferredNextStep ||
                    !!dm?.pain?.painApproach;
                  return (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {t('businessProfile.decisionTitle')}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {!hasAny && (
                        <p className="text-sm text-gray-500 italic">
                          {t('businessProfile.decisionEmpty')}
                        </p>
                      )}
                      {dm?.discovery?.firstQuestions?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Discovery Questions</h4>
                          <ul className="space-y-1">
                            {dm.discovery.firstQuestions.map(
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

                      {dm?.valuePositioning?.primaryValueLens && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Primary Value Lens</h4>
                          <p className="text-sm capitalize">{dm.valuePositioning.primaryValueLens}</p>
                        </div>
                      )}

                      {dm?.closing?.preferredNextStep && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Preferred Close</h4>
                          <p className="text-sm capitalize">
                            {dm.closing.preferredNextStep}
                            {dm.closing.ctaDirectness && (
                              <span className="text-gray-500"> ({dm.closing.ctaDirectness})</span>
                            )}
                          </p>
                        </div>
                      )}

                      {dm?.pain?.painApproach && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Pain Approach</h4>
                          <p className="text-sm capitalize">{dm.pain.painApproach}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })()}

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
