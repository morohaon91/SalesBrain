"use client";

import { ReactNode, useMemo } from "react";
import { useI18n } from "@/lib/hooks/useI18n";

export function OnboardingBrandShell({ children }: { children: ReactNode }) {
  const { t } = useI18n("onboarding");
  const features = useMemo(
    () => [t("shell.feature1"), t("shell.feature2"), t("shell.feature3")],
    [t]
  );

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(228, 42%, 5%)" }}>

      {/* ── Left Panel — Brand ── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: "hsl(228, 42%, 5%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(200,136,26,0.09) 0%, transparent 65%)" }}
        />

        <div className="relative max-w-xs w-full space-y-10">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, hsl(38,84%,61%), hsl(38,78%,46%))",
                color: "#060300",
                fontFamily: "'Cormorant', Georgia, serif",
                fontWeight: 700,
                fontSize: "20px",
              }}
            >
              ✦
            </div>
            <span
              style={{
                color: "hsl(38, 25%, 90%)",
                letterSpacing: "0.06em",
                fontFamily: "'Cormorant', Georgia, serif",
                fontWeight: 600,
                fontSize: "22px",
              }}
            >
              Concierge
            </span>
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <p
              style={{
                color: "hsl(38, 25%, 90%)",
                fontFamily: "'Cormorant', Georgia, serif",
                fontWeight: 500,
                fontSize: "clamp(26px, 2.8vw, 34px)",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              {t("shell.headlineLead")}
              <br />
              <em style={{ color: "hsl(38, 84%, 61%)", fontStyle: "italic" }}>
                {t("shell.headlineAccent")}
              </em>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(228, 12%, 47%)" }}>
              {t("shell.subhead")}
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(200,136,26,0.12)", border: "1px solid rgba(200,136,26,0.25)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(38, 84%, 61%)" }} />
                </div>
                <span className="text-sm" style={{ color: "hsl(228, 12%, 65%)" }}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* Step indicator */}
          <div
            className="pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(228, 12%, 35%)" }}>
              Secure · AI-powered · Always On
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Content ── */}
      <div
        className="w-full lg:w-[54%] flex items-start justify-center px-6 py-10 sm:py-12 overflow-y-auto"
        style={{ background: "hsl(228, 38%, 6%)" }}
      >
        <div className="w-full max-w-3xl pb-12">
          {/* Mobile wordmark */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, hsl(38,84%,61%), hsl(38,78%,46%))",
                  color: "#060300",
                  fontFamily: "'Cormorant', Georgia, serif",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                ✦
              </div>
              <span
                style={{
                  color: "hsl(38, 25%, 90%)",
                  letterSpacing: "0.06em",
                  fontFamily: "'Cormorant', Georgia, serif",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                Concierge
              </span>
            </div>
            <p className="text-sm" style={{ color: "hsl(228, 12%, 47%)" }}>
              {t("shell.mobileTag")}
            </p>
          </div>

          {children}

          <div
            className="mt-8 pt-5 text-center text-xs"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              color: "hsl(228, 12%, 35%)",
            }}
          >
            {t("shell.footer")}
          </div>
        </div>
      </div>
    </div>
  );
}
