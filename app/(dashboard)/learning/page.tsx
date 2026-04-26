"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  GraduationCap,
  Mic,
  Compass,
  ShieldCheck,
  Filter,
  Settings2,
  Clock,
} from "lucide-react";

import { api, type ActivationStatusResponse } from "@/lib/api/client";
import { useI18n } from "@/lib/hooks/useI18n";
import { useAuth } from "@/lib/hooks/useAuth";
import { rtlMirrorIcon } from "@/lib/i18n/rtl-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { ReadinessRing } from "@/components/learning/ReadinessRing";
import { GateCard } from "@/components/learning/GateCard";
import { CompetencyDetails } from "@/components/learning/CompetencyDetails";

import {
  COMPETENCIES,
  type CompetencyCategory,
  type CompetencyRequirement,
  type CompetencyStatus,
} from "@/lib/learning/competencies";

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  muted2: 'hsl(228,12%,55%)',
  gold: 'hsl(38,84%,61%)',
};

const CATEGORY_ICON: Record<CompetencyCategory, typeof Mic> = {
  identity: Mic,
  strategic: Compass,
  qualification: Filter,
  objection: ShieldCheck,
  adaptation: Settings2,
};

const CATEGORY_ORDER: CompetencyCategory[] = [
  "identity",
  "strategic",
  "qualification",
  "objection",
  "adaptation",
];

export default function LearningDashboardPage() {
  const { user } = useAuth();
  const { t, isHebrew } = useI18n(["learning", "common"]);

  const activationQuery = useQuery({
    queryKey: ["activation-status"],
    queryFn: () => api.profile.activationStatus(),
    enabled: !!user,
  });

  const scenariosQuery = useQuery({
    queryKey: ["simulations-scenarios"],
    queryFn: () => api.simulations.scenarios(),
    enabled: !!user,
  });

  const activation: ActivationStatusResponse | undefined = activationQuery.data;
  const scenariosData = scenariosQuery.data;

  const isLoading = activationQuery.isLoading || scenariosQuery.isLoading;
  const isError = activationQuery.isError || scenariosQuery.isError;

  const canGoLive = activation?.canRequestGoLive ?? false;
  const overall = activation?.activationScore ?? 0;

  const tone: "emerald" | "amber" | "sky" = canGoLive
    ? "emerald"
    : overall < 40
      ? "amber"
      : "sky";

  const competencyGroups = useMemo(() => {
    if (!activation) return [];
    const byId = new Map<string, CompetencyStatus>();
    activation.competencies.forEach((c) => byId.set(c.competencyId, c));

    return CATEGORY_ORDER.map((category) => {
      const requirements = COMPETENCIES.filter((c) => c.category === category);
      const items = requirements
        .map<{ requirement: CompetencyRequirement; status: CompetencyStatus } | null>((req) => {
          const status = byId.get(req.id);
          return status ? { requirement: req, status } : null;
        })
        .filter(
          (x): x is { requirement: CompetencyRequirement; status: CompetencyStatus } => x !== null,
        );
      return { category, items };
    }).filter((g) => g.items.length > 0);
  }, [activation]);

  const competencyLabels = useMemo(
    () => ({
      required: t("learning:competencies.required"),
      examples: (count: number) => t("learning:competencies.examples", { count }),
      statusLabel: t("learning:competencies.statusLabel"),
      requirements: t("learning:competencies.requirements"),
      minConfidence: (value: number) =>
        t("learning:competencies.minConfidence", { value }),
      currentMet: (value: number) =>
        t("learning:competencies.currentConfidenceMet", { value }),
      currentShort: (value: number, delta: number) =>
        t("learning:competencies.currentConfidenceShort", { value, delta }),
      whatsNeeded: t("learning:competencies.whatsNeeded"),
      achievedMessage: t("learning:competencies.achievedMessage"),
      statusText: {
        NOT_STARTED: t("learning:competencies.status.NOT_STARTED"),
        IN_PROGRESS: t("learning:competencies.status.IN_PROGRESS"),
        ACHIEVED: t("learning:competencies.status.ACHIEVED"),
        MASTERED: t("learning:competencies.status.MASTERED"),
      },
    }),
    [t],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.gold }} />
          <p className="text-sm" style={{ color: C.muted }}>{t("learning:loading")}</p>
        </div>
      </div>
    );
  }

  if (isError || !activation) {
    return (
      <div className="rounded-xl p-6 text-sm"
        style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
        {t("learning:errors.loadFailed")}
      </div>
    );
  }

  const nextScenario = activation.nextScenario;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant', Georgia, serif", fontSize: '28px', color: C.fg }}>
            {t("learning:header.title")}
          </h1>
          <p className="text-sm" style={{ color: C.muted }}>{t("learning:header.subtitle")}</p>
        </div>
        <div className="hidden sm:block">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={canGoLive
              ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80' }
              : { background: 'rgba(200,136,26,0.12)', color: C.gold }}
          >
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* HERO: overall readiness */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: canGoLive ? 'rgba(74,222,128,0.05)' : C.card,
          border: `1px solid ${canGoLive ? 'rgba(74,222,128,0.2)' : C.border}`,
        }}
      >
        <div className="flex flex-col-reverse items-stretch gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold" style={{ color: C.fg }}>
                {t("learning:overall.title")}
              </h2>
              <p className="text-sm" style={{ color: C.muted }}>
                {canGoLive
                  ? t("learning:overall.readyDescription")
                  : t("learning:overall.trainingDescription")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canGoLive ? (
                <Badge variant="success" className="gap-1.5 py-1 pl-2 pr-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t("learning:overall.ready")}</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5 py-1 pl-2 pr-2.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{t("learning:overall.inTraining")}</span>
                </Badge>
              )}
              <div className="flex items-center gap-4 text-xs" style={{ color: C.muted }}>
                <span>
                  <span className="font-semibold" style={{ color: C.fg }}>
                    {activation.gates.filter((g) => g.status === "PASSED").length}
                  </span>
                  <span style={{ color: C.muted }}>/{activation.gates.length}</span>{" "}
                  {t("learning:gates.title").toLowerCase()}
                </span>
                <span className="h-3 w-px" style={{ background: C.border }} />
                <span>
                  <span className="font-semibold" style={{ color: C.fg }}>
                    {activation.breakdown.scenarios.completed}
                  </span>
                  <span style={{ color: C.muted }}>/{activation.breakdown.scenarios.total}</span>{" "}
                  {t("learning:scenarios.title").toLowerCase()}
                </span>
              </div>
            </div>

            {canGoLive ? (
              <Link href="/profile/approve">
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("learning:overall.activate")}
                </Button>
              </Link>
            ) : null}
          </div>

          <div className="mx-auto shrink-0">
            <ReadinessRing value={overall} tone={tone} />
          </div>
        </div>
      </div>

      {/* NEXT STEP SPOTLIGHT */}
      {!canGoLive && nextScenario ? (
        <div className="rounded-2xl p-6"
          style={{ background: C.card, border: `1px solid rgba(200,136,26,0.2)` }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(200,136,26,0.12)', color: C.gold }}>
                <Target className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>
                  {t("learning:nextStep.title")}
                </p>
                <h3 className="text-lg font-semibold" style={{ color: C.fg }}>
                  {nextScenario.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                  {nextScenario.purpose}
                </p>
              </div>
            </div>
            <Link
              href={`/simulations/new?scenario=${encodeURIComponent(nextScenario.id)}`}
              className="shrink-0"
            >
              <Button className="inline-flex items-center gap-1.5">
                <span>{t("learning:nextStep.cta")}</span>
                <ArrowRight
                  className={rtlMirrorIcon(isHebrew, "h-4 w-4 shrink-0")}
                  aria-hidden
                />
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {/* GATES */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: C.fg }}>{t("learning:gates.title")}</h2>
          <p className="text-sm" style={{ color: C.muted }}>{t("learning:gates.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activation.gates.map((gate) => (
            <GateCard
              key={gate.gateId}
              gate={gate}
              labels={{
                passed: t("learning:gates.passed"),
                blocked: t("learning:gates.blocked"),
              }}
            />
          ))}
        </div>
      </section>

      {/* COMPETENCIES */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: C.fg }}>
            {t("learning:competencies.title")}
          </h2>
          <p className="text-sm" style={{ color: C.muted }}>{t("learning:competencies.subtitle")}</p>
        </div>

        <div className="space-y-3">
          {competencyGroups.map((group) => {
            const allAchieved = group.items.every(
              (item) =>
                item.status.status === "ACHIEVED" ||
                item.status.status === "MASTERED",
            );
            const Icon = CATEGORY_ICON[group.category];
            return (
              <div
                key={group.category}
                className="rounded-2xl p-5"
                style={{
                  background: C.card,
                  border: `1px solid ${allAchieved ? 'rgba(74,222,128,0.15)' : C.border}`,
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={allAchieved
                        ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80' }
                        : { background: 'rgba(200,136,26,0.1)', color: C.gold }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold" style={{ color: C.fg }}>
                      {t(`learning:competencies.categories.${group.category}`)}
                    </h3>
                  </div>
                  {allAchieved ? (
                    <Badge variant="success" className="gap-1 text-[10px]">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t("learning:competencies.groupComplete")}</span>
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-2">
                  {group.items.map(({ requirement, status }) => (
                    <CompetencyDetails
                      key={requirement.id}
                      competency={status}
                      requirement={requirement}
                      labels={competencyLabels}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SCENARIOS */}
      {scenariosData ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: C.fg }}>
                {t("learning:scenarios.title")}
              </h2>
              <p className="text-sm" style={{ color: C.muted }}>
                {t("learning:scenarios.subtitle", {
                  completed: scenariosData.completionStats.completed,
                  total: scenariosData.completionStats.total,
                })}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Progress
                value={scenariosData.completionStats.percentage}
                variant="gold"
                className="h-2 w-40"
              />
              <span className="text-sm font-semibold tabular-nums" style={{ color: C.fg }}>
                {scenariosData.completionStats.percentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scenariosData.scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex flex-col rounded-xl p-4 transition-all duration-150"
                style={{
                  background: scenario.isCompleted ? 'rgba(74,222,128,0.05)' : C.card,
                  border: `1px solid ${scenario.isCompleted ? 'rgba(74,222,128,0.2)' : C.border}`,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,136,26,0.25)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = scenario.isCompleted ? 'rgba(74,222,128,0.2)' : C.border}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold leading-snug" style={{ color: C.fg }}>
                      {scenario.name}
                    </h4>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px]" style={{ color: C.muted }}>
                      <span className="capitalize">
                        {t(`learning:scenarios.difficulty.${scenario.difficulty}`, {
                          defaultValue: scenario.difficulty,
                        })}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
                      <span>
                        ~{scenario.estimatedDuration} {t("common:units.min")}
                      </span>
                    </div>
                  </div>
                  {scenario.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: '#4ade80' }} />
                  ) : scenario.isMandatory ? (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {t("learning:scenarios.mandatory")}
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-2 flex-1 text-xs line-clamp-2" style={{ color: C.muted }}>
                  {scenario.description}
                </p>

                {!scenario.isCompleted ? (
                  <Link
                    href={`/simulations/new?scenario=${encodeURIComponent(scenario.id)}`}
                    className="mt-3"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <span>{t("learning:scenarios.start")}</span>
                      <ArrowRight
                        className={rtlMirrorIcon(isHebrew, "ml-1.5 h-3.5 w-3.5 shrink-0")}
                        aria-hidden
                      />
                    </Button>
                  </Link>
                ) : (
                  <div className="mt-3 text-[11px] font-medium" style={{ color: '#4ade80' }}>
                    {t("learning:scenarios.completed")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
