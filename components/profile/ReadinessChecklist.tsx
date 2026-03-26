'use client';

import { Check, X, AlertCircle } from 'lucide-react';
import { ReadinessCheckResult } from '@/lib/utils/profile-readiness';

interface ReadinessChecklistProps {
  readiness: ReadinessCheckResult;
}

export default function ReadinessChecklist({ readiness }: ReadinessChecklistProps) {
  return (
    <div className="space-y-3">
      {!readiness.isReady && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Your profile needs {70 - readiness.completionPercentage}% more completion to go live.
            Complete more simulations to unlock approval.
          </p>
        </div>
      )}

      {readiness.checklist.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div
            className={[
              'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
              item.completed ? 'bg-green-500' : 'bg-gray-200',
            ].join(' ')}
          >
            {item.completed ? (
              <Check className="h-3.5 w-3.5 text-white" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-400" />
            )}
          </div>
          <span className={`text-sm flex-1 ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
            {item.label}
          </span>
          <span className="text-xs text-gray-400">{item.points}/{item.maxPoints}pts</span>
        </div>
      ))}
    </div>
  );
}
