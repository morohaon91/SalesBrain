"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Clock, GraduationCap } from "lucide-react";

import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/hooks/useI18n";
import { rtlMirrorIcon } from "@/lib/i18n/rtl-icons";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ReadinessWidgetProps {
  className?: string;
}

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  gold: 'hsl(38,84%,61%)',
};

export function ReadinessWidget({ className }: ReadinessWidgetProps) {
  const { user } = useAuth();
  const { t, isHebrew } = useI18n(["learning", "common"]);

  const { data: activation } = useQuery({
    queryKey: ["activation-status"],
    queryFn: () => api.profile.activationStatus(),
    enabled: !!user,
  });

  if (!activation) return null;

  const { canRequestGoLive, activationScore, breakdown, nextScenario } = activation;
  const next = nextScenario;

  return (
    <div
      className={cn("rounded-xl p-5", className)}
      style={{
        background: C.card,
        border: `1px solid ${canRequestGoLive ? 'rgba(74,222,128,0.2)' : C.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={canRequestGoLive
              ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80' }
              : { background: 'rgba(200,136,26,0.1)', color: C.gold }}
          >
            <GraduationCap className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: C.fg }}>
            {t("learning:widget.title")}
          </h3>
        </div>

        {canRequestGoLive ? (
          <Badge variant="success" className="gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>{t("learning:overall.ready")}</span>
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Clock className="h-3 w-3" />
            <span>{breakdown.scenarios.completed}/{breakdown.scenarios.total}</span>
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span style={{ color: C.muted }}>{t("learning:widget.progressLabel")}</span>
          <span className="font-semibold tabular-nums" style={{ color: C.fg }}>{activationScore}%</span>
        </div>
        <Progress value={activationScore} variant={canRequestGoLive ? 'success' : 'gold'} className="h-2" />
      </div>

      {!canRequestGoLive && next ? (
        <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: C.muted }}>
            {t("learning:widget.nextLabel")}
          </p>
          <p className="mt-1 text-sm font-medium line-clamp-1" style={{ color: C.fg }}>{next.name}</p>
          <Link href="/learning" className="mt-2 block">
            <Button size="sm" className="w-full">
              <span>{t("learning:widget.continue")}</span>
              <ArrowRight className={rtlMirrorIcon(isHebrew, "ml-1.5 h-3.5 w-3.5 shrink-0")} aria-hidden />
            </Button>
          </Link>
        </div>
      ) : null}

      {canRequestGoLive ? (
        <Link href="/profile/approve" className="mt-4 block">
          <Button size="sm" className="w-full">
            {t("learning:overall.activate")}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
