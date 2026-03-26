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
  // Calculate completeness score (mirrors quality-checker logic)
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
    if (completenessScore >= 60) return { label: 'Ready to Extract', color: 'bg-green-50 border-green-200' };
    if (completenessScore >= 40) return { label: 'Getting There', color: 'bg-blue-50 border-blue-200' };
    return { label: 'Keep Going', color: 'bg-orange-50 border-orange-200' };
  };

  const status = getStatus();

  return (
    <div className={`rounded-lg border p-4 ${status.color}`}>
      <div className="space-y-3">
        {/* Score and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Completeness Score</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{completenessScore}%</div>
            <Badge className="mt-1" variant={completenessScore >= 60 ? 'default' : 'secondary'}>
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              completenessScore >= 60
                ? 'bg-green-500'
                : completenessScore >= 40
                  ? 'bg-blue-500'
                  : 'bg-orange-500'
            }`}
            style={{ width: `${completenessScore}%` }}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            {messageCount >= 8 ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            )}
            <div>
              <span className="text-gray-600">Messages: </span>
              <span className="font-medium">{messageCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalQuestions === 0 || answeredQuestions / totalQuestions >= 0.5 ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            )}
            <div>
              <span className="text-gray-600">Questions: </span>
              <span className="font-medium">
                {answeredQuestions}/{totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasResolution ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            )}
            <div>
              <span className="text-gray-600">Resolution: </span>
              <span className="font-medium">{hasResolution ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {balanceScore >= 40 && balanceScore <= 60 ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            )}
            <div>
              <span className="text-gray-600">Balance: </span>
              <span className="font-medium">{Math.round(balanceScore)}%</span>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {completenessScore < 60 && (
          <div className="text-xs text-gray-700 pt-2 border-t border-gray-300">
            {messageCount < 8 && <p>• Keep the conversation going - aim for 8+ messages</p>}
            {totalQuestions > 0 && answeredQuestions / totalQuestions < 0.5 && (
              <p>• Answer more of the customer's questions</p>
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
