'use client';

import { Check, X, AlertCircle } from 'lucide-react';
import type { ActivationStatusResponse } from '@/lib/api/client';

interface ReadinessChecklistProps {
  report: ActivationStatusResponse;
}

export default function ReadinessChecklist({ report }: ReadinessChecklistProps) {
  const { canRequestGoLive, gates } = report;
  const gatesPassed = gates.filter((g) => g.status === 'PASSED').length;
  const gatesBlocked = gates.length - gatesPassed;
  const blockingReasons = gates.flatMap((g) => g.blockingReasons);

  return (
    <div className="space-y-3">
      {!canRequestGoLive && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-medium">
              {gatesBlocked} gate{gatesBlocked === 1 ? '' : 's'} remaining before Go Live.
            </p>
            {blockingReasons.length > 0 && (
              <ul className="list-disc list-inside text-xs opacity-90">
                {blockingReasons.slice(0, 5).map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {gates.map((gate) => {
        const passed = gate.status === 'PASSED';
        return (
          <div key={gate.gateId} className="flex items-center gap-3">
            <div
              className={[
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                passed ? 'bg-green-500' : 'bg-gray-200',
              ].join(' ')}
            >
              {passed ? (
                <Check className="h-3.5 w-3.5 text-white" />
              ) : (
                <X className="h-3.5 w-3.5 text-gray-400" />
              )}
            </div>
            <span className="text-sm flex-1" style={{ color: passed ? 'hsl(38,25%,90%)' : 'hsl(228,12%,47%)' }}>
              {gate.name}
            </span>
            <span className="text-xs text-gray-400">{Math.round(gate.progress)}%</span>
          </div>
        );
      })}
    </div>
  );
}
