'use client';

interface ProgressProps {
  value: number;
  className?: string;
  variant?: 'default' | 'gold' | 'success';
}

const trackColors = {
  default: 'rgba(255,255,255,0.07)',
  gold: 'rgba(200,136,26,0.12)',
  success: 'rgba(74,222,128,0.12)',
};

const fillColors = {
  default: 'hsl(var(--primary))',
  gold: 'linear-gradient(90deg, hsl(38,84%,61%), hsl(38,78%,46%))',
  success: '#4ade80',
};

export function Progress({ value, className = '', variant = 'default' }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div
      className={`w-full rounded-full overflow-hidden ${className || 'h-1.5'}`}
      style={{ background: trackColors[variant] }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${clamped}%`,
          background: fillColors[variant],
        }}
      />
    </div>
  );
}
