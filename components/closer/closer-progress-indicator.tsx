"use client";

import { CloserProgress } from "@/lib/ai/closer-conversation";

interface Props {
  progress: CloserProgress;
}

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  muted2: 'hsl(228,12%,55%)',
  gold: 'hsl(38,84%,61%)',
};

export function CloserProgressIndicator({ progress }: Props) {
  const phases = [
    { key: "clarify", label: "Clarify", icon: "❓" },
    { key: "overview", label: "Overview Pain", icon: "😔" },
    { key: "label", label: "Label", icon: "🏷️" },
    { key: "sell", label: "Sell Outcome", icon: "🎯" },
    { key: "explain", label: "Explain Concerns", icon: "💬" },
    { key: "reinforce", label: "Reinforce", icon: "✅" },
  ];

  const completedCount = Object.values(progress).filter((p: any) => p && p.completed).length;
  const progressPct = (completedCount / 6) * 100;

  return (
    <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: C.fg }}>CLOSER Progress</h3>

      <div className="space-y-3">
        {phases.map((phase, index) => {
          const phaseData = progress[phase.key as keyof CloserProgress];
          const isCompleted = phaseData && typeof phaseData === 'object' && 'completed' in phaseData ? phaseData.completed : false;
          const isCurrent = progress.currentPhase === phase.key;

          return (
            <div key={phase.key} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
                style={isCompleted
                  ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80' }
                  : isCurrent
                    ? { background: 'rgba(200,136,26,0.15)', color: C.gold }
                    : { background: 'rgba(255,255,255,0.06)', color: C.muted }
                }
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base">{phase.icon}</span>
                  <span className="text-sm font-medium" style={{ color: isCurrent ? C.fg : C.muted2 }}>
                    {phase.label}
                  </span>
                  {isCurrent && !isCompleted && (
                    <span className="text-xs font-medium ml-auto" style={{ color: C.gold }}>In Progress</span>
                  )}
                </div>
                {phaseData && typeof phaseData === 'object' && 'timestamp' in phaseData && phaseData.timestamp && (
                  <div className="text-xs" style={{ color: C.muted }}>
                    Completed {new Date(phaseData.timestamp as string).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex justify-between text-xs mb-2" style={{ color: C.muted }}>
          <span className="font-medium">Overall Progress</span>
          <span>{completedCount} / 6 phases</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, background: `linear-gradient(to right, hsl(38,84%,61%), #4ade80)` }}
          />
        </div>
      </div>
    </div>
  );
}
