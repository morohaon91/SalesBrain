import { LucideIcon } from "lucide-react";

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconVariant?: "primary" | "success" | "warning" | "danger" | "accent";
  trend?: {
    value: string;
    positive?: boolean;
  };
}

const iconColorMap = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  accent: "bg-accent-50 text-accent-600",
};

/**
 * StatsCard - Reusable stats metric card with icon, value, and optional trend
 */
export function StatsCard({
  label,
  value,
  icon: Icon,
  iconVariant = "primary",
  trend,
}: StatsCardProps) {
  const iconColorClass = iconColorMap[iconVariant];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.positive ? "text-success-600" : "text-danger-600"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className={`rounded-lg p-2.5 ${iconColorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
