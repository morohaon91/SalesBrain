'use client';

import { Progress } from '@/components/ui/progress';
import { TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';
import { getScoreStatus } from '@/lib/simulations/quality-scorer';

interface LiveQualityScoreProps {
  score: number;
  demonstratedPatterns: string[];
  messageCount: number;
}

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  muted2: 'hsl(228,12%,55%)',
  gold: 'hsl(38,84%,61%)',
};

export default function LiveQualityScore({ score, demonstratedPatterns, messageCount }: LiveQualityScoreProps) {
  const scoreColor = score >= 70 ? '#4ade80' : score >= 50 ? C.gold : '#fb923c';
  const scoreVariant = score >= 70 ? 'success' : score >= 50 ? 'gold' : 'default';

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: C.muted }}>Quality Score</span>
          <TrendingUp className="h-4 w-4" style={{ color: C.muted }} />
        </div>
        <span className="text-3xl font-bold tabular-nums" style={{ color: scoreColor, fontFamily: "'Cormorant', Georgia, serif" }}>
          {score}%
        </span>
        <Progress value={score} variant={scoreVariant} className="mt-2 mb-1" />
        <p className="text-xs" style={{ color: C.muted2 }}>{getScoreStatus(score)}</p>
      </div>

      <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: C.muted }}>Exchanges</span>
          <MessageSquare className="h-4 w-4" style={{ color: C.muted }} />
        </div>
        <div className="mb-1">
          <span className="text-2xl font-bold tabular-nums" style={{ color: C.fg }}>{messageCount}</span>
          <span className="text-sm ml-1" style={{ color: C.muted }}> / 15 max</span>
        </div>
        <p className="text-xs" style={{ color: C.muted2 }}>
          {messageCount < 5 ? 'Just getting started' : messageCount < 10 ? 'Good length' : 'Comprehensive'}
        </p>
      </div>

      <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: C.muted }}>Patterns Shown</span>
          <CheckCircle className="h-4 w-4" style={{ color: C.muted }} />
        </div>
        <div className="space-y-2">
          {demonstratedPatterns.length === 0 ? (
            <p className="text-xs" style={{ color: C.muted }}>No patterns demonstrated yet</p>
          ) : (
            demonstratedPatterns.map((pattern, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4ade80' }} />
                <span style={{ color: C.fg }}>{pattern.replace(/_/g, ' ')}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'rgba(200,136,26,0.06)', border: '1px solid rgba(200,136,26,0.15)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: C.gold }}>Tips</p>
        <ul className="text-xs space-y-1" style={{ color: C.muted2 }}>
          <li>Answer the client's questions directly</li>
          <li>Show how you handle price objections</li>
          <li>Demonstrate your qualification process</li>
          <li>Set clear expectations on timeline</li>
        </ul>
      </div>
    </div>
  );
}
