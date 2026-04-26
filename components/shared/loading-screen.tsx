'use client';

import { useI18n } from "@/lib/hooks/useI18n";

export function LoadingScreen() {
  const { t } = useI18n("common");

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "hsl(228, 42%, 5%)" }}
    >
      <div className="text-center space-y-5">
        {/* Logo mark */}
        <div className="flex justify-center items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(38,84%,61%), hsl(38,78%,46%))",
              color: "#060300",
              fontFamily: "'Cormorant', Georgia, serif",
              fontWeight: 700,
              fontSize: "18px",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            ✦
          </div>
          <span
            style={{
              color: "hsl(38, 25%, 88%)",
              letterSpacing: "0.1em",
              fontFamily: "'Cormorant', Georgia, serif",
              fontWeight: 600,
              fontSize: "20px",
            }}
          >
            Concierge
          </span>
        </div>

        {/* Animated bars */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                background: "hsl(38, 78%, 46%)",
                height: "20px",
                animation: `bounce 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        <p
          className="text-sm"
          style={{ color: "hsl(228, 12%, 47%)" }}
        >
          {t("loadingScreen.subtitle")}
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scaleY(0.4); }
          40% { transform: scaleY(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
