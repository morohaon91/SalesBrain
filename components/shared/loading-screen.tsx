'use client';

import { useI18n } from "@/lib/hooks/useI18n";

export function LoadingScreen() {
  const { t } = useI18n("common");

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <div className="text-center space-y-4">
        {/* Wordmark */}
        <div className="flex justify-center items-center gap-2.5 mb-6">
          <svg
            width="22"
            height="28"
            viewBox="0 0 20 26"
            fill="hsl(38, 92%, 50%)"
            aria-hidden="true"
            className="animate-pulse flex-shrink-0"
          >
            <circle cx="10" cy="1.75" r="1.75" />
            <path d="M10 3.5 C13 3.5 17 7 17 14 H3 C3 7 7 3.5 10 3.5Z" />
            <rect x="2.5" y="14" width="15" height="2.5" rx="1.25" />
            <circle cx="10" cy="19" r="1.75" />
          </svg>
          <span
            className="text-lg font-semibold"
            style={{ color: "hsl(var(--foreground))", letterSpacing: "0.08em" }}
          >
            CONCIERGE
          </span>
        </div>

        <div>
          <p
            className="text-sm"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {t("loadingScreen.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
