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
          <div className="relative w-8 h-8 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-sm"
              style={{ backgroundColor: "hsl(38, 92%, 50%)", opacity: 0.2 }}
            />
            <div
              className="absolute inset-[3px] rounded-sm rotate-45 animate-pulse"
              style={{ backgroundColor: "hsl(38, 92%, 50%)" }}
            />
          </div>
          <span
            className="text-lg font-semibold tracking-widest"
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
