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

  const scoreColor = displayValue >= 90 ? '#4ade80' : displayValue >= 40 ? 'hsl(38,84%,61%)' : '#fb923c';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'hsl(38,25%,90%)' }}>
          <TrendingUp className="h-4 w-4" style={{ color: 'hsl(38,84%,61%)' }} />
          Profile Completion
        </span>
        <div className="flex items-center gap-2">
          {gain > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
              +{gain}%
            </span>
          )}
          <span className="text-2xl font-bold" style={{ color: scoreColor }}>{displayValue}%</span>
        </div>
      </div>
      <Progress value={displayValue} className="h-3" variant={displayValue >= 90 ? 'success' : 'gold'} />
      {displayValue >= 90 && (
        <p className="text-xs font-medium" style={{ color: '#4ade80' }}>You&apos;re ready to go live!</p>
      )}
      {displayValue < 90 && (
        <p className="text-xs" style={{ color: 'hsl(228,12%,55%)' }}>{90 - displayValue}% more needed to activate AI</p>
      )}
    </div>
  );
}
