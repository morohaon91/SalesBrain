'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import instance from '@/lib/api/client';
import type { ExtractedPatterns } from '@/lib/types/business-profile';

interface PendingPatterns {
  success: boolean;
  data: (ExtractedPatterns & {
    simulationId: string;
    scenarioType: string;
  }) | null;
}

interface ApprovalStatus {
  [key: string]: 'approved' | 'rejected' | 'pending';
}

export default function ValidatePatternsPage() {
  const router = useRouter();
  const [patterns, setPatterns] = useState<ExtractedPatterns | null>(null);
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
        // Initialize all patterns as pending
        const initial: ApprovalStatus = {};
        Object.keys(data.data).forEach(key => {
          if (key !== 'simulationId' && key !== 'scenarioType') {
            initial[key] = 'pending';
          }
        });
        setApprovalStatus(initial);
      } else {
        setError('No pending patterns found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patterns');
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

      setApprovalStatus(prev => ({
        ...prev,
        [field]: 'approved'
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve field');
    } finally {
      setSavingField(null);
    }
  };

  const rejectField = async (field: string) => {
    try {
      setSavingField(field);

      await instance.post('/profile/validate/reject', { field });

      setApprovalStatus(prev => ({
        ...prev,
        [field]: 'rejected'
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject field');
    } finally {
      setSavingField(null);
    }
  };

  const approveAll = async () => {
    try {
      setSavingAll(true);

      await instance.post('/profile/validate/approve-all', {});

      // Mark all as approved
      const newStatus: ApprovalStatus = {};
      Object.keys(approvalStatus).forEach(key => {
        newStatus[key] = 'approved';
      });
      setApprovalStatus(newStatus);

      // Redirect after success
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve all patterns');
    } finally {
      setSavingAll(false);
    }
  };

  const approvedCount = Object.values(approvalStatus).filter(s => s === 'approved').length;
  const totalCount = Object.keys(approvalStatus).length;
  const allApproved = approvedCount === totalCount && totalCount > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading pending patterns...</p>
        </div>
      </div>
    );
  }

  if (error && !patterns) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
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
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>No Pending Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">All extracted patterns have been reviewed</p>
            <Button onClick={() => router.push('/profile')}>Return to Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = [
    { id: 'communication', label: 'Communication', key: 'communicationStyle' },
    { id: 'pricing', label: 'Pricing', key: 'pricingLogic' },
    { id: 'qualification', label: 'Qualification', key: 'qualificationCriteria' },
    { id: 'objections', label: 'Objections', key: 'objectionHandling' },
    { id: 'decision', label: 'Decision Making', key: 'decisionMakingPatterns' }
  ].filter(cat => (patterns as any)[cat.key]);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Extracted Patterns</h1>
          <p className="text-gray-600 mt-1">Approve or reject patterns from your simulation</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Progress: {approvedCount}/{totalCount} approved</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalCount > 0 ? (approvedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
            {allApproved && (
              <Button
                onClick={approveAll}
                disabled={savingAll}
                className="ml-4 bg-green-600 hover:bg-green-700"
              >
                {savingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Complete
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

      {/* Category Navigation */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Active Category Content */}
      <div className="space-y-4">
        {categories.map(cat => {
          if (activeCategory !== cat.id) return null;
          const pattern = (patterns as any)[cat.key];
          const status = approvalStatus[cat.key];
          return (
            <div key={cat.id} className="space-y-4">
              <PatternCard
                title={cat.label}
                pattern={pattern}
                status={status}
                onApprove={() => approveField(cat.key)}
                onReject={() => rejectField(cat.key)}
                isSaving={savingField === cat.key}
              />
            </div>
          );
        })}
      </div>

      {/* Quality and Notes */}
      {patterns.conversationQuality && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Completeness Score</p>
                <p className="text-2xl font-bold">{patterns.conversationQuality.completenessScore}/100</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversation Flow</p>
                <p className="text-sm font-medium">{patterns.conversationQuality.conversationFlow || 'Not assessed'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {patterns.extractionNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patterns.extractionNotes.strengths && patterns.extractionNotes.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">✓ Strengths</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {patterns.extractionNotes.strengths.map((s, i) => (
                    <li key={i} className="text-green-700">{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {patterns.extractionNotes.weaknesses && patterns.extractionNotes.weaknesses.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2">⚠ Areas for Improvement</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {patterns.extractionNotes.weaknesses.map((w, i) => (
                    <li key={i} className="text-orange-700">{w}</li>
                  ))}
                </ul>
              </div>
            )}
            {patterns.extractionNotes.suggestions && patterns.extractionNotes.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">💡 Suggestions</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {patterns.extractionNotes.suggestions.map((s, i) => (
                    <li key={i} className="text-blue-700">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button
          onClick={approveAll}
          disabled={!allApproved || savingAll}
          className="bg-green-600 hover:bg-green-700"
        >
          {savingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {allApproved ? 'Complete Review' : `Approve All (${approvedCount}/${totalCount})`}
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
}

function PatternCard({ title, pattern, status, onApprove, onReject, isSaving }: PatternCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" /> Pending</Badge>;
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
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            disabled={isSaving || status === 'rejected'}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Reject
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isSaving || status === 'approved'}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
