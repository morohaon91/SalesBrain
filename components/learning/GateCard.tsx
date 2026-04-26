"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GateValidationResult } from "@/lib/learning/go-live-gates";

interface GateCardProps {
  gate: GateValidationResult;
  labels: { passed: string; blocked: string };
}

export function GateCard({ gate, labels }: GateCardProps) {
  const isPassed = gate.status === "PASSED";

  return (
    <div
      className="relative rounded-xl p-5 transition-all duration-200"
      style={{
        background: isPassed ? 'rgba(74,222,128,0.06)' : 'hsl(228,32%,8%)',
        border: `1px solid ${isPassed ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug" style={{ color: 'hsl(38,25%,90%)' }}>
            {gate.name}
          </h3>
          <div className="mt-3">
            <Progress value={gate.progress} variant={isPassed ? 'success' : 'default'} />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="font-medium" style={{ color: 'hsl(228,12%,47%)' }}>
                {Math.round(gate.progress)}%
              </span>
              {isPassed && <Badge variant="success" className="text-[10px]">{labels.passed}</Badge>}
            </div>
          </div>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={
            isPassed
              ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80' }
              : { background: 'rgba(249,115,22,0.12)', color: '#fb923c' }
          }
        >
          {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </div>
      </div>

      {!isPassed && gate.blockingReasons.length > 0 && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(228,12%,47%)' }}>
            {labels.blocked}
          </p>
          <ul className="mt-2 space-y-1.5">
            {gate.blockingReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'hsl(228,12%,55%)' }}>
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#fb923c' }} />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
