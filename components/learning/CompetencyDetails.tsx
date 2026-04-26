"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { CompetencyRequirement, CompetencyStatus } from "@/lib/learning/competencies";

interface CompetencyDetailsProps {
  competency: CompetencyStatus;
  requirement: CompetencyRequirement;
  labels: {
    required: string;
    examples: (count: number) => string;
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

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  borderInner: 'rgba(255,255,255,0.05)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  muted2: 'hsl(228,12%,55%)',
};

export function CompetencyDetails({ competency, requirement, labels }: CompetencyDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isAchieved = competency.status === "ACHIEVED" || competency.status === "MASTERED";
  const isMandatory = requirement.requiredForGoLive;
  const confidence = Number.isFinite(competency.currentConfidence) ? Math.round(competency.currentConfidence) : 0;
  const delta = Math.max(0, requirement.minimumConfidence - confidence);

  return (
    <div
      className="rounded-xl transition-all duration-150"
      style={{ background: C.card, border: `1px solid ${isAchieved ? 'rgba(74,222,128,0.2)' : C.border}` }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="flex w-full items-start gap-4 rounded-xl p-4 text-left transition-colors focus:outline-none focus-visible:ring-2"
        style={{ '--tw-ring-color': 'rgba(200,136,26,0.3)' } as React.CSSProperties}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
        aria-expanded={isOpen}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={
            isAchieved
              ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80' }
              : { background: 'rgba(255,255,255,0.06)', color: 'hsl(228,12%,47%)' }
          }
        >
          {isAchieved ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold" style={{ color: C.fg }}>{requirement.name}</h4>
            {isMandatory && <Badge variant="outline" className="text-[10px]">{labels.required}</Badge>}
          </div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.muted }}>{requirement.description}</p>

          <div className="mt-3 flex items-center gap-3">
            <Progress
              value={confidence}
              variant={isAchieved ? 'success' : confidence > 0 ? 'gold' : 'default'}
              className="h-1.5 flex-1"
            />
            <span className="text-xs font-semibold tabular-nums" style={{ color: isAchieved ? '#4ade80' : C.muted2 }}>
              {confidence}%
            </span>
          </div>

          <p className="mt-1 text-[11px]" style={{ color: C.muted }}>
            {labels.examples(competency.evidenceCount)}
          </p>
        </div>

        <div className="shrink-0 pt-1" style={{ color: C.muted }}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 py-4 space-y-4" style={{ borderTop: `1px solid ${C.borderInner}` }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
              {labels.statusLabel}
            </p>
            <Badge variant={isAchieved ? "success" : "secondary"} className="mt-1.5 text-[10px]">
              {labels.statusText[competency.status]}
            </Badge>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
              {labels.requirements}
            </p>
            <ul className="mt-1.5 space-y-1 text-xs" style={{ color: C.muted2 }}>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full" style={{ background: C.muted }} />
                {labels.minConfidence(requirement.minimumConfidence)}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full" style={{ background: C.muted }} />
                {confidence >= requirement.minimumConfidence
                  ? labels.currentMet(confidence)
                  : labels.currentShort(confidence, delta)}
              </li>
            </ul>
          </div>

          {competency.blockingReasons.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#fb923c' }}>
                {labels.whatsNeeded}
              </p>
              <ul className="mt-1.5 space-y-1">
                {competency.blockingReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: C.muted2 }}>
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#fb923c' }} />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isAchieved && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', color: '#4ade80' }}>
              <CheckCircle2 className="h-4 w-4" />
              {labels.achievedMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
