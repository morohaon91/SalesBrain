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

const iconStyles: Record<string, { bg: string; color: string }> = {
  primary: {
    bg: "hsl(38 92% 50% / 0.1)",
    color: "hsl(38, 92%, 42%)",
  },
  success: {
    bg: "hsl(142 76% 36% / 0.1)",
    color: "hsl(142, 76%, 30%)",
  },
  warning: {
    bg: "hsl(21 90% 48% / 0.1)",
    color: "hsl(21, 90%, 42%)",
  },
  danger: {
    bg: "hsl(350 89% 50% / 0.1)",
    color: "hsl(350, 89%, 44%)",
  },
  accent: {
    bg: "hsl(174 100% 29% / 0.1)",
    color: "hsl(174, 100%, 26%)",
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
      className="bg-white rounded-xl border p-5 transition-colors duration-150 card-hover"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wider truncate"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {label}
          </p>
          <div className="mt-2.5 flex items-baseline gap-2">
            <p
              className="text-3xl font-bold tabular-nums"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {value}
            </p>
            {trend && (
              <span
                className="text-xs font-semibold"
                style={{
                  color: trend.positive ? "hsl(142, 76%, 32%)" : "hsl(350, 89%, 48%)",
                }}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          {trend?.period && (
            <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              vs. {trend.period}
            </p>
          )}
        </div>

        <div
          className="rounded-lg p-2.5 flex-shrink-0 ms-3"
          style={{ backgroundColor: style.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: style.color }} />
        </div>
      </div>
    </div>
  );
}
