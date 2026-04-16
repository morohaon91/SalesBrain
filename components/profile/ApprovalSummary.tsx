'use client';

import ProfilePreview from './ProfilePreview';
import ReadinessChecklist from './ReadinessChecklist';
import type { ReadinessReport } from '@/lib/learning/readiness-calculator';

interface ApprovalSummaryProps {
  profile: Record<string, any>;
  report: ReadinessReport;
}

export default function ApprovalSummary({ profile, report }: ApprovalSummaryProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Go-Live Gates</h2>
        <p className="text-sm text-gray-600 mb-4">
          {report.gates.passed}/{report.gates.total} gates passed ·{' '}
          {report.competencies.achieved}/{report.competencies.total} competencies achieved ·{' '}
          {report.scenarios.completed}/{report.scenarios.total} scenarios completed
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
