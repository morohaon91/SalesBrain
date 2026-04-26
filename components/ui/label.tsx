import { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className = '', ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 ${className}`}
      {...props}
    />
  );
}
