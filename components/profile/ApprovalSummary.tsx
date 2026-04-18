'use client';

import ProfilePreview from './ProfilePreview';
import ReadinessChecklist from './ReadinessChecklist';
import type { ActivationStatusResponse } from '@/lib/api/client';

interface ApprovalSummaryProps {
  profile: Record<string, any>;
  report: ActivationStatusResponse;
}

export default function ApprovalSummary({ profile, report }: ApprovalSummaryProps) {
  const gatesPassed = report.gates.filter((g) => g.status === 'PASSED').length;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Go-Live Gates</h2>
        <p className="text-sm text-gray-600 mb-4">
          {gatesPassed}/{report.gates.length} gates passed ·{' '}
          {report.breakdown.competencies.achieved}/{report.breakdown.competencies.total} competencies achieved ·{' '}
          {report.breakdown.scenarios.completed}/{report.breakdown.scenarios.total} scenarios completed
        </p>
        <ReadinessChecklist report={report} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Preview</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is how your AI will represent you when talking to leads.
        </p>
        <ProfilePreview profile={profile} />
      </div>
    </div>
  );
}
