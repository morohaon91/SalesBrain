'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface ProfileProgressAnimationProps {
  previousPercentage: number;
  currentPercentage: number;
}

export default function ProfileProgressAnimation({
  previousPercentage,
  currentPercentage,
}: ProfileProgressAnimationProps) {
  const [displayValue, setDisplayValue] = useState(previousPercentage);
  const gain = currentPercentage - previousPercentage;

  useEffect(() => {
    const steps = 30;
    const diff = currentPercentage - previousPercentage;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplayValue(previousPercentage + Math.round((diff * step) / steps));
      if (step >= steps) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [currentPercentage, previousPercentage]);

  const color = displayValue >= 90 ? 'text-green-600' : displayValue >= 40 ? 'text-yellow-600' : 'text-orange-600';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Profile Completion
        </span>
        <div className="flex items-center gap-2">
          {gain > 0 && (
            <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              +{gain}%
            </span>
          )}
          <span className={`text-2xl font-bold ${color}`}>{displayValue}%</span>
        </div>
      </div>
      <Progress value={displayValue} className="h-3" />
      {displayValue >= 90 && (
        <p className="text-xs text-green-600 font-medium">You're ready to go live!</p>
      )}
      {displayValue < 90 && (
        <p className="text-xs text-gray-500">{90 - displayValue}% more needed to activate AI</p>
      )}
    </div>
  );
}
