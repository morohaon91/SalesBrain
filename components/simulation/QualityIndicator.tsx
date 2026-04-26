'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface QualityIndicatorProps {
  messageCount: number;
  answeredQuestions: number;
  totalQuestions: number;
  hasResolution: boolean;
  balanceScore: number; // 0-100, 50 is ideal
}

export function QualityIndicator({
  messageCount,
  answeredQuestions,
  totalQuestions,
  hasResolution,
  balanceScore
}: QualityIndicatorProps) {
  const baseScore = 50;
  const messageScore = messageCount >= 12 ? 20 : Math.floor((messageCount / 12) * 20);
  const answeredScore = totalQuestions > 0
    ? Math.floor((answeredQuestions / totalQuestions) * 20)
    : 20;
  const resolutionScore = hasResolution ? 20 : 0;
  const balanceScorePart = Math.min(10, Math.floor((balanceScore / 100) * 10));

  const completenessScore = Math.min(
    100,
    baseScore + messageScore + answeredScore + resolutionScore + balanceScorePart
  );

  const getStatus = () => {
    if (completenessScore >= 60) return { label: 'Ready to Extract', color: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' };
    if (completenessScore >= 40) return { label: 'Getting There', color: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' };
    return { label: 'Keep Going', color: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)' };
  };

  const status = getStatus();

  return (
    <div className="rounded-lg border p-4" style={{ background: status.color, borderColor: status.border }}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: 'hsl(38,84%,61%)' }} />
            <span className="font-medium" style={{ color: 'hsl(38,25%,90%)' }}>Completeness Score</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: 'hsl(38,25%,90%)' }}>{completenessScore}%</div>
            <Badge className="mt-1" variant={completenessScore >= 60 ? 'default' : 'secondary'}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${completenessScore}%`,
              background: completenessScore >= 60 ? '#4ade80' : completenessScore >= 40 ? '#60a5fa' : '#fb923c'
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            {messageCount >= 8 ? (
              <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />
            ) : (
              <AlertTriangle className="w-4 h-4" style={{ color: '#fb923c' }} />
            )}
            <div>
              <span className="text-sm" style={{ color: 'hsl(228,12%,55%)' }}>Messages: </span>
              <span className="font-medium" style={{ color: 'hsl(38,25%,90%)' }}>{messageCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalQuestions === 0 || answeredQuestions / totalQuestions >= 0.5 ? (
              <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />
            ) : (
              <AlertTriangle className="w-4 h-4" style={{ color: '#fb923c' }} />
            )}
            <div>
              <span className="text-sm" style={{ color: 'hsl(228,12%,55%)' }}>Questions: </span>
              <span className="font-medium" style={{ color: 'hsl(38,25%,90%)' }}>
                {answeredQuestions}/{totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasResolution ? (
              <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />
            ) : (
              <AlertTriangle className="w-4 h-4" style={{ color: '#fb923c' }} />
            )}
            <div>
              <span className="text-sm" style={{ color: 'hsl(228,12%,55%)' }}>Resolution: </span>
              <span className="font-medium" style={{ color: 'hsl(38,25%,90%)' }}>{hasResolution ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {balanceScore >= 40 && balanceScore <= 60 ? (
              <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />
            ) : (
              <AlertTriangle className="w-4 h-4" style={{ color: '#fb923c' }} />
            )}
            <div>
              <span className="text-sm" style={{ color: 'hsl(228,12%,55%)' }}>Balance: </span>
              <span className="font-medium" style={{ color: 'hsl(38,25%,90%)' }}>{Math.round(balanceScore)}%</span>
            </div>
          </div>
        </div>

        {completenessScore < 60 && (
          <div className="text-xs pt-2" style={{ color: 'hsl(228,12%,60%)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {messageCount < 8 && <p>• Keep the conversation going - aim for 8+ messages</p>}
            {totalQuestions > 0 && answeredQuestions / totalQuestions < 0.5 && (
              <p>• Answer more of the customer&apos;s questions</p>
            )}
            {!hasResolution && <p>• Guide toward a clear next step or decision</p>}
            {(balanceScore < 40 || balanceScore > 60) && (
              <p>• Engage more equally - listen and respond in balance</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
