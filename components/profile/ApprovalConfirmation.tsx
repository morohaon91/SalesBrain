'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Zap, Loader2 } from 'lucide-react';

interface ApprovalConfirmationProps {
  isReady: boolean;
  onApprove: () => Promise<void>;
}

export default function ApprovalConfirmation({ isReady, onApprove }: ApprovalConfirmationProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (!isReady) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          Complete your profile to at least 70% to enable the approval button.
        </p>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">This is your AI's voice for real leads</p>
            <p className="text-sm text-amber-800 mt-1">
              Once approved, your AI will use these patterns to qualify and respond to live leads.
              Make sure you've reviewed the profile preview above.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setConfirming(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleApprove} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Yes, Approve & Go Live
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={() => setConfirming(true)}>
      <Zap className="h-5 w-5 mr-2" />
      Approve & Go Live
    </Button>
  );
}
