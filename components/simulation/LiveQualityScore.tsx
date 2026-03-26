'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';
import { getScoreStatus } from '@/lib/simulations/quality-scorer';

interface LiveQualityScoreProps {
  score: number;
  demonstratedPatterns: string[];
  messageCount: number;
}

export default function LiveQualityScore({ score, demonstratedPatterns, messageCount }: LiveQualityScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-green-600';
    if (s >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Quality Score</span>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mb-2">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</span>
        </div>
        <Progress value={score} className="mb-2" />
        <p className="text-xs text-gray-600">{getScoreStatus(score)}</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Exchanges</span>
          <MessageSquare className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mb-1">
          <span className="text-2xl font-bold text-gray-900">{messageCount}</span>
          <span className="text-sm text-gray-500 ml-1">/ 15 max</span>
        </div>
        <p className="text-xs text-gray-600">
          {messageCount < 5
            ? 'Just getting started'
            : messageCount < 10
            ? 'Good length'
            : 'Comprehensive'}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Patterns Shown</span>
          <CheckCircle className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          {demonstratedPatterns.length === 0 ? (
            <p className="text-xs text-gray-500">No patterns demonstrated yet</p>
          ) : (
            demonstratedPatterns.map((pattern, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-gray-700">{pattern.replace(/_/g, ' ')}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-xs font-medium text-blue-900 mb-2">Tips</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>Answer the client's questions directly</li>
          <li>Show how you handle price objections</li>
          <li>Demonstrate your qualification process</li>
          <li>Set clear expectations on timeline</li>
        </ul>
      </Card>
    </div>
  );
}
