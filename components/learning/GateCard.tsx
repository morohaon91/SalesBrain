"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GateValidationResult } from "@/lib/learning/go-live-gates";

interface GateCardProps {
  gate: GateValidationResult;
  labels: {
    passed: string;
    blocked: string;
  };
}

export function GateCard({ gate, labels }: GateCardProps) {
  const isPassed = gate.status === "PASSED";

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white p-5 transition-shadow hover:shadow-md",
        isPassed
          ? "border-success-200 bg-success-50/40"
          : "border-gray-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{gate.name}</h3>
          <div className="mt-3">
            <Progress
              value={gate.progress}
              className={cn(
                "h-2",
                isPassed && "[&>div]:bg-success-500",
                !isPassed && "[&>div]:bg-warning-500"
              )}
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-500">{Math.round(gate.progress)}%</span>
              {isPassed ? (
                <Badge variant="success" className="text-[10px]">
                  {labels.passed}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isPassed ? "bg-success-100 text-success-600" : "bg-warning-100 text-warning-600"
          )}
        >
          {isPassed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>
      </div>

      {!isPassed && gate.blockingReasons.length > 0 ? (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {labels.blocked}
          </p>
          <ul className="mt-2 space-y-1.5">
            {gate.blockingReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
