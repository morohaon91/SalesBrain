'use client';

import { Check, X } from 'lucide-react';
import { ReadinessItem } from '@/lib/utils/profile-readiness';

interface CompletionChecklistProps {
  checklist: ReadinessItem[];
}

export default function CompletionChecklist({ checklist }: CompletionChecklistProps) {
  return (
    <div className="space-y-2">
      {checklist.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div
            className={[
              'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
              item.completed ? 'bg-green-500' : 'bg-gray-200',
            ].join(' ')}
          >
            {item.completed ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <X className="h-3 w-3 text-gray-400" />
            )}
          </div>
          <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
            {item.label}
          </span>
          <span className="ml-auto text-xs text-gray-400">
            {item.points}/{item.maxPoints}pts
          </span>
        </div>
      ))}
    </div>
  );
}
