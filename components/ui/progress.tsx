'use client';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className = '' }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className || 'h-2'}`}>
      <div
        className="bg-blue-500 h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
