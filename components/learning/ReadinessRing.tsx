"use client";

import { cn } from "@/lib/utils";

interface ReadinessRingProps {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  tone?: "emerald" | "amber" | "sky";
}

const TONE_MAP: Record<NonNullable<ReadinessRingProps["tone"]>, string> = {
  emerald: "text-success-500",
  amber: "text-warning-500",
  sky: "text-primary-500",
};

export function ReadinessRing({
  value,
  size = 180,
  stroke = 14,
  tone = "sky",
  className,
}: ReadinessRingProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-gray-100"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", TONE_MAP[tone])}
          fill="none"
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-900">{clamped}%</span>
      </div>
    </div>
  );
}
