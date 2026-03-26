'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/api/auth-fetch';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import PatternReviewCard from './PatternReviewCard';

interface ValidationModalProps {
  simulationId: string;
  extractedPatterns: Record<string, unknown> | null;
  onClose: () => void;
  onValidated: () => void;
}

const PATTERN_SECTIONS = [
  'communicationStyle',
  'pricingLogic',
  'qualificationCriteria',
  'objectionHandling',
  'decisionMakingPatterns',
];

export default function ValidationModal({
  simulationId,
  extractedPatterns,
  onClose,
  onValidated,
}: ValidationModalProps) {
  const [saving, setSaving] = useState(false);
  const [approvedSections, setApprovedSections] = useState<string[]>(PATTERN_SECTIONS);

  const toggleSection = (section: string) => {
    setApprovedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleSubmit = async (action: 'approve' | 'partial' | 'reject') => {
    setSaving(true);
    try {
      await authFetch(`/api/v1/simulations/${simulationId}/validate-patterns`, {
        method: 'POST',
        body: JSON.stringify({ action, approvedSections }),
      });
      onValidated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review Extracted Patterns</h2>
            <p className="text-sm text-gray-600">Approve or reject the patterns your AI extracted</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {extractedPatterns ? (
            PATTERN_SECTIONS.map((section) => {
              const data = extractedPatterns[section] as Record<string, unknown> | undefined;
              if (!data) return null;
              const isApproved = approvedSections.includes(section);
              return (
                <div key={section} className={`rounded-lg border-2 ${isApproved ? 'border-green-200' : 'border-red-200'}`}>
                  <PatternReviewCard
                    section={section}
                    data={data}
                    onApprove={() => setApprovedSections((prev) => [...new Set([...prev, section])])}
                    onReject={() => toggleSection(section)}
                  />
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Waiting for extraction...</span>
            </div>
          )}
        </div>

        {extractedPatterns && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              {approvedSections.length} of {PATTERN_SECTIONS.length} sections approved
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSubmit('reject')} disabled={saving}>
                Reject All
              </Button>
              <Button
                onClick={() =>
                  handleSubmit(approvedSections.length === PATTERN_SECTIONS.length ? 'approve' : 'partial')
                }
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {approvedSections.length === PATTERN_SECTIONS.length ? 'Approve All' : 'Save Selection'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
