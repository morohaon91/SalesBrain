"use client";

import { cn } from "@/lib/utils";

interface ReadinessRingProps {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  tone?: "emerald" | "amber" | "sky";
}

const TONE_COLORS: Record<NonNullable<ReadinessRingProps["tone"]>, string> = {
  emerald: "#4ade80",
  amber: "#fb923c",
  sky: "hsl(38,84%,61%)",
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
  const color = TONE_COLORS[tone];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={stroke}
          stroke="rgba(255,255,255,0.07)"
          fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={color}
          fill="none"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-semibold tabular-nums"
          style={{
            fontFamily: "'Cormorant', Georgia, serif",
            fontSize: `${size * 0.22}px`,
            color,
          }}
        >
          {clamped}%
        </span>
      </div>
    </div>
  );
}
