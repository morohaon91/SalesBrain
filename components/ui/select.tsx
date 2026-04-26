import { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options = [], placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          flex h-10 w-full rounded-lg
          border border-[hsl(var(--border))]
          bg-[hsl(var(--input))]
          px-3 py-2 text-sm
          text-[hsl(var(--foreground))]
          focus:border-[hsl(var(--primary)/0.5)]
          focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.3)]
          disabled:cursor-not-allowed disabled:opacity-50
          transition-colors duration-150
          ${className}
        `}
        style={{ colorScheme: 'dark' }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled style={{ background: 'hsl(228,32%,8%)' }}>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value} style={{ background: 'hsl(228,32%,8%)' }}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
