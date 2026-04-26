"use client";

import { Flame, Thermometer, Snowflake } from "lucide-react";

interface ScoringBreakdownData {
  totalScore: number;
  temperature: "hot" | "warm" | "cold";
  extractedInfo?: {
    leadName: string | null;
    leadEmail: string | null;
    budget: number | null;
    timeline: string | null;
    projectType: string | null;
  };
  components: {
    budgetFit: { score: number; reasoning: string; leadBudget?: number; ownerRange?: { min: number; max: number } };
    timelineFit: { score: number; reasoning: string; leadTimeline?: string; ownerTypical?: string };
    engagement: { score: number; reasoning: string; signals: string[] };
    valueAlignment: { score: number; reasoning: string; matchedValues: string[] };
  };
  qualificationAnalysis: {
    greenFlagsMatched: string[];
    redFlagsDetected: string[];
    dealBreakersPresent: string[];
    mustHavesMet: string[];
  };
  recommendation: {
    action: "call_immediately" | "call_soon" | "email_first" | "skip";
    reasoning: string;
    talkingPoints: string[];
  };
}

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  muted2: 'hsl(228,12%,55%)',
};

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 75 ? '#4ade80' : pct >= 50 ? 'hsl(38,84%,61%)' : pct >= 25 ? '#fb923c' : '#fb7185';
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function ScoringBreakdown({ breakdown }: { breakdown: ScoringBreakdownData }) {
  const tempConfig = {
    hot: { icon: <Flame className="w-5 h-5" style={{ color: '#fb923c' }} />, label: '🔥 Hot Lead', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', color: '#fb923c' },
    warm: { icon: <Thermometer className="w-5 h-5" style={{ color: 'hsl(38,84%,61%)' }} />, label: '🟡 Warm Lead', bg: 'rgba(200,136,26,0.08)', border: 'rgba(200,136,26,0.2)', color: 'hsl(38,84%,61%)' },
    cold: { icon: <Snowflake className="w-5 h-5" style={{ color: 'hsl(228,12%,65%)' }} />, label: '❄️ Cold Lead', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', color: 'hsl(228,12%,65%)' },
  }[breakdown.temperature];

  const scoreCards = [
    { label: 'Budget Fit', score: breakdown.components.budgetFit.score, max: 30, reasoning: breakdown.components.budgetFit.reasoning },
    { label: 'Timeline Fit', score: breakdown.components.timelineFit.score, max: 20, reasoning: breakdown.components.timelineFit.reasoning },
    { label: 'Engagement', score: breakdown.components.engagement.score, max: 25, reasoning: breakdown.components.engagement.reasoning },
    { label: 'Value Alignment', score: breakdown.components.valueAlignment.score, max: 25, reasoning: breakdown.components.valueAlignment.reasoning },
  ];

  return (
    <div className="space-y-4">
      {/* Temperature Badge */}
      <div className="rounded-xl p-4" style={{ background: tempConfig.bg, border: `1px solid ${tempConfig.border}` }}>
        <div className="flex items-center gap-3 mb-2">
          {tempConfig.icon}
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: tempConfig.color }}>{tempConfig.label}</p>
            <p className="text-sm font-semibold" style={{ color: tempConfig.color }}>
              {breakdown.recommendation.action.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>
        </div>
        <p className="text-xs italic" style={{ color: tempConfig.color, opacity: 0.85 }}>
          {breakdown.recommendation.reasoning}
        </p>
      </div>

      {/* Score Components */}
      <div className="grid grid-cols-2 gap-3">
        {scoreCards.map(({ label, score, max, reasoning }) => (
          <div key={label} className="rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium" style={{ color: C.muted }}>{label}</span>
              <span className="text-base font-bold tabular-nums" style={{ color: C.fg }}>{score}/{max}</span>
            </div>
            <ScoreBar score={score} max={max} />
            <p className="text-xs mt-2 line-clamp-2" style={{ color: C.muted2 }}>{reasoning}</p>
          </div>
        ))}
      </div>

      {/* Qualification Analysis */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Qualification Analysis</p>

        {breakdown.qualificationAnalysis.greenFlagsMatched.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: '#4ade80' }}>✓ Green Flags</p>
            <div className="flex flex-wrap gap-1">
              {breakdown.qualificationAnalysis.greenFlagsMatched.map((flag, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {breakdown.qualificationAnalysis.redFlagsDetected.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: '#fb923c' }}>⚠ Red Flags</p>
            <div className="flex flex-wrap gap-1">
              {breakdown.qualificationAnalysis.redFlagsDetected.map((flag, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c' }}>
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {breakdown.qualificationAnalysis.dealBreakersPresent.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: '#fb7185' }}>✗ Deal-Breakers</p>
            <div className="flex flex-wrap gap-1">
              {breakdown.qualificationAnalysis.dealBreakersPresent.map((flag, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {breakdown.extractedInfo &&
        (breakdown.extractedInfo.leadName || breakdown.extractedInfo.leadEmail || breakdown.extractedInfo.projectType) && (
        <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Lead details</p>
          <dl className="space-y-1 text-xs">
            {breakdown.extractedInfo.leadName && (
              <div className="flex gap-2">
                <dt className="font-medium" style={{ color: C.muted }}>Name</dt>
                <dd style={{ color: C.fg }}>{breakdown.extractedInfo.leadName}</dd>
              </div>
            )}
            {breakdown.extractedInfo.leadEmail && (
              <div className="flex gap-2">
                <dt className="font-medium" style={{ color: C.muted }}>Email</dt>
                <dd style={{ color: C.fg }}>{breakdown.extractedInfo.leadEmail}</dd>
              </div>
            )}
            {breakdown.extractedInfo.projectType && (
              <div className="flex gap-2">
                <dt className="font-medium" style={{ color: C.muted }}>Project</dt>
                <dd style={{ color: C.fg }}>{breakdown.extractedInfo.projectType}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {breakdown.recommendation.talkingPoints.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>💡 Talking Points</p>
          <ul className="space-y-1">
            {breakdown.recommendation.talkingPoints.map((point, i) => (
              <li key={i} className="text-xs flex gap-2" style={{ color: C.muted2 }}>
                <span className="flex-shrink-0" style={{ color: C.muted }}>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
