"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompetencyRequirement, CompetencyStatus } from "@/lib/learning/competencies";

interface CompetencyDetailsProps {
  competency: CompetencyStatus;
  requirement: CompetencyRequirement;
  labels: {
    required: string;
    examplesOne: string;
    examplesOther: string;
    statusLabel: string;
    requirements: string;
    minConfidence: (value: number) => string;
    currentMet: (value: number) => string;
    currentShort: (value: number, delta: number) => string;
    whatsNeeded: string;
    achievedMessage: string;
    statusText: Record<CompetencyStatus["status"], string>;
  };
}

export function CompetencyDetails({ competency, requirement, labels }: CompetencyDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isAchieved =
    competency.status === "ACHIEVED" || competency.status === "MASTERED";
  const isMandatory = requirement.requiredForGoLive;
  const confidence = Math.round(competency.currentConfidence);
  const delta = Math.max(0, requirement.minimumConfidence - confidence);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-shadow",
        isAchieved
          ? "border-success-200"
          : isMandatory
            ? "border-gray-200"
            : "border-gray-200"
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-start gap-4 rounded-xl p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        aria-expanded={isOpen}
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            isAchieved
              ? "bg-success-100 text-success-600"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {isAchieved ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{requirement.name}</h4>
            {isMandatory ? (
              <Badge variant="outline" className="text-[10px]">
                {labels.required}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">{requirement.description}</p>

          <div className="mt-3 flex items-center gap-3">
            <Progress
              value={confidence}
              className={cn(
                "h-1.5 flex-1",
                isAchieved
                  ? "[&>div]:bg-success-500"
                  : confidence > 0
                    ? "[&>div]:bg-primary-500"
                    : "[&>div]:bg-gray-300"
              )}
            />
            <span className="text-xs font-semibold text-gray-700 tabular-nums">
              {confidence}%
            </span>
          </div>

          <p className="mt-1 text-[11px] text-gray-400">
            {competency.evidenceCount === 1
              ? labels.examplesOne
              : labels.examplesOther.replace("{{count}}", String(competency.evidenceCount))}
          </p>
        </div>

        <div className="shrink-0 pt-1 text-gray-400">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {labels.statusLabel}
            </p>
            <Badge
              variant={isAchieved ? "success" : "secondary"}
              className="mt-1.5 text-[10px]"
            >
              {labels.statusText[competency.status]}
            </Badge>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {labels.requirements}
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                {labels.minConfidence(requirement.minimumConfidence)}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                {confidence >= requirement.minimumConfidence
                  ? labels.currentMet(confidence)
                  : labels.currentShort(confidence, delta)}
              </li>
            </ul>
          </div>

          {competency.blockingReasons.length > 0 ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-warning-600">
                {labels.whatsNeeded}
              </p>
              <ul className="mt-1.5 space-y-1">
                {competency.blockingReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {isAchieved ? (
            <div className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>{labels.achievedMessage}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
