'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Users, User } from 'lucide-react';

interface SimulationMessageBubbleProps {
  role: 'AI_CLIENT' | 'BUSINESS_OWNER';
  content: string;
  timestamp?: string | Date;
}

export function SimulationMessageBubble({
  role,
  content,
  timestamp,
}: SimulationMessageBubbleProps) {
  const isOwner = role === 'BUSINESS_OWNER';

  return (
    <div className={cn('flex gap-3', isOwner ? 'justify-end' : 'justify-start')}>
      {!isOwner && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-accent-700" />
        </div>
      )}

      <div
        className={cn(
          'max-w-sm rounded-lg px-4 py-3 text-sm',
          isOwner
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>

        {timestamp && (
          <p
            className={cn(
              'mt-2 text-xs',
              isOwner ? 'text-primary-100' : 'text-gray-500'
            )}
          >
            {typeof timestamp === 'string'
              ? format(new Date(timestamp), 'HH:mm')
              : format(timestamp, 'HH:mm')}
          </p>
        )}
      </div>

      {isOwner && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="w-5 h-5 text-primary-700" />
        </div>
      )}
    </div>
  );
}
