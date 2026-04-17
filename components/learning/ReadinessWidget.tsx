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

export function ReadinessWidget({ className }: ReadinessWidgetProps) {
  const { user } = useAuth();
  const { t, isHebrew } = useI18n(["learning", "common"]);

  const { data: readiness } = useQuery({
    queryKey: ["profile-readiness"],
    queryFn: () => api.profile.readiness(),
    enabled: !!user,
  });

  if (!readiness) return null;

  const { canGoLive, overallReadiness, scenarios } = readiness;
  const next = scenarios.nextRecommended;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 shadow-sm",
        canGoLive ? "border-success-200" : "border-gray-200",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              canGoLive
                ? "bg-success-100 text-success-600"
                : "bg-primary-50 text-primary-600",
            )}
          >
            <GraduationCap className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            {t("learning:widget.title")}
          </h3>
        </div>

        {canGoLive ? (
          <Badge variant="success" className="gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>{t("learning:overall.ready")}</span>
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Clock className="h-3 w-3" />
            <span>
              {scenarios.completed}/{scenarios.total}
            </span>
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-500">{t("learning:widget.progressLabel")}</span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {overallReadiness}%
          </span>
        </div>
        <Progress
          value={overallReadiness}
          className={cn(
            "h-2",
            canGoLive ? "[&>div]:bg-success-500" : "[&>div]:bg-primary-500",
          )}
        />
      </div>

      {!canGoLive && next ? (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {t("learning:widget.nextLabel")}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900 line-clamp-1">{next.name}</p>
          <Link href="/learning" className="mt-2 block">
            <Button size="sm" className="w-full bg-primary-600 text-white hover:bg-primary-700">
              <span>{t("learning:widget.continue")}</span>
              <ArrowRight
                className={rtlMirrorIcon(isHebrew, "ml-1.5 h-3.5 w-3.5 shrink-0")}
                aria-hidden
              />
            </Button>
          </Link>
        </div>
      ) : null}

      {canGoLive ? (
        <Link href="/profile/approve" className="mt-4 block">
          <Button size="sm" className="w-full bg-success-600 text-white hover:bg-success-700">
            {t("learning:overall.activate")}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
