"use client";

import { CloserProgress } from "@/lib/ai/closer-conversation";

interface Props {
  progress: CloserProgress;
}

export function CloserProgressIndicator({ progress }: Props) {
  const phases = [
    { key: "clarify", label: "Clarify", icon: "❓", color: "blue" },
    { key: "overview", label: "Overview Pain", icon: "😔", color: "purple" },
    { key: "label", label: "Label", icon: "🏷️", color: "indigo" },
    { key: "sell", label: "Sell Outcome", icon: "🎯", color: "cyan" },
    { key: "explain", label: "Explain Concerns", icon: "💬", color: "teal" },
    { key: "reinforce", label: "Reinforce", icon: "✅", color: "green" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">CLOSER Progress</h3>

      <div className="space-y-3">
        {phases.map((phase, index) => {
          const phaseData = progress[phase.key as keyof CloserProgress];
          const isCompleted = phaseData && typeof phaseData === 'object' && 'completed' in phaseData ? phaseData.completed : false;
          const isCurrent = progress.currentPhase === phase.key;

          return (
            <div key={phase.key} className="flex items-start gap-3">
              {/* Phase circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5
                  ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }
                `}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Phase info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{phase.icon}</span>
                  <span className={`text-sm ${isCurrent ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {phase.label}
                  </span>
                  {isCurrent && !isCompleted && (
                    <span className="text-xs font-medium text-blue-600 ml-auto">In Progress</span>
                  )}
                </div>
                {phaseData && typeof phaseData === 'object' && 'timestamp' in phaseData && phaseData.timestamp && (
                  <div className="text-xs text-gray-500">
                    Completed {new Date(phaseData.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Overall Progress</span>
          <span>
            {Object.values(progress).filter((p: any) => p && p.completed).length} / 6 phases
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${
                (Object.values(progress).filter((p: any) => p && p.completed).length / 6) * 100
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
