'use client';

import ProfilePreview from './ProfilePreview';
import ReadinessChecklist from './ReadinessChecklist';
import ProfileProgress from './ProfileProgress';
import { ReadinessCheckResult } from '@/lib/utils/profile-readiness';

interface ApprovalSummaryProps {
  profile: Record<string, any>;
  readiness: ReadinessCheckResult;
}

export default function ApprovalSummary({ profile, readiness }: ApprovalSummaryProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h2>
        <ProfileProgress breakdown={readiness.breakdown} showDetails />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Readiness Checklist</h2>
        <ReadinessChecklist readiness={readiness} />
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
