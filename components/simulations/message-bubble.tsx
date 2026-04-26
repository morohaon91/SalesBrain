'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Users, User } from 'lucide-react';

interface SimulationMessageBubbleProps {
  role: 'AI_CLIENT' | 'BUSINESS_OWNER';
  content: string;
  timestamp?: string | Date;
}

export function SimulationMessageBubble({ role, content, timestamp }: SimulationMessageBubbleProps) {
  const isOwner = role === 'BUSINESS_OWNER';

  return (
    <div className={cn('flex gap-3', isOwner ? 'justify-end' : 'justify-start')}>
      {!isOwner && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(200,136,26,0.12)', color: 'hsl(38,84%,61%)' }}>
          <Users className="w-5 h-5" />
        </div>
      )}

      <div
        className="max-w-sm rounded-2xl px-4 py-3 text-sm"
        style={isOwner
          ? { background: 'linear-gradient(135deg, hsl(38,78%,46%), hsl(38,84%,61%))', color: '#fff', borderBottomRightRadius: '4px' }
          : { background: 'hsl(228,32%,12%)', color: 'hsl(38,25%,90%)', border: '1px solid rgba(255,255,255,0.07)', borderBottomLeftRadius: '4px' }
        }
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        {timestamp && (
          <p className="mt-2 text-xs opacity-60">
            {typeof timestamp === 'string' ? format(new Date(timestamp), 'HH:mm') : format(timestamp, 'HH:mm')}
          </p>
        )}
      </div>

      {isOwner && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(200,136,26,0.15)', color: 'hsl(38,84%,61%)' }}>
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
