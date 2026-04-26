import { LucideIcon } from "lucide-react";

export interface StatsCardProps {
  label: string;
  value: string | number | React.ReactNode;
  icon: LucideIcon;
  iconVariant?: "primary" | "success" | "warning" | "danger" | "accent";
  trend?: {
    value: string;
    positive?: boolean;
    period?: string;
  };
}

const iconStyles: Record<string, { bg: string; color: string; border: string }> = {
  primary: {
    bg: "rgba(200,136,26,0.1)",
    color: "hsl(38, 84%, 61%)",
    border: "1px solid rgba(200,136,26,0.2)",
  },
  success: {
    bg: "rgba(74,222,128,0.1)",
    color: "#4ade80",
    border: "1px solid rgba(74,222,128,0.2)",
  },
  warning: {
    bg: "rgba(249,115,22,0.1)",
    color: "#fb923c",
    border: "1px solid rgba(249,115,22,0.2)",
  },
  danger: {
    bg: "rgba(244,63,94,0.1)",
    color: "#fb7185",
    border: "1px solid rgba(244,63,94,0.2)",
  },
  accent: {
    bg: "rgba(20,184,166,0.1)",
    color: "#2dd4bf",
    border: "1px solid rgba(20,184,166,0.2)",
  },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconVariant = "primary",
  trend,
}: StatsCardProps) {
  const style = iconStyles[iconVariant];

  return (
    <div
      className="rounded-xl p-5 transition-all duration-200 card-hover"
      style={{
        background: "hsl(228, 32%, 8%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,136,26,0.28)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold uppercase tracking-wider truncate mb-2.5"
            style={{ color: "hsl(228, 12%, 47%)" }}
          >
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p
              className="text-3xl font-bold tabular-nums"
              style={{
                color: "hsl(38, 25%, 90%)",
                fontFamily: "'Cormorant', Georgia, serif",
                fontWeight: 600,
                fontSize: "2rem",
              }}
            >
              {value}
            </p>
            {trend && (
              <span
                className="text-xs font-semibold"
                style={{
                  color: trend.positive ? "#4ade80" : "#fb7185",
                }}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          {trend?.period && (
            <p className="text-xs mt-1" style={{ color: "hsl(228, 12%, 47%)" }}>
              vs. {trend.period}
            </p>
          )}
        </div>

        <div
          className="rounded-xl p-2.5 flex-shrink-0 ms-3"
          style={{ background: style.bg, border: style.border }}
        >
          <Icon className="w-5 h-5" style={{ color: style.color }} />
        </div>
      </div>
    </div>
  );
}
