import { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

/**
 * Select component - wrapper around native HTML select
 * Matches styling of Input component for consistency
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options = [], placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2
          text-sm text-gray-900 placeholder-gray-400
          focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200
          transition-colors
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
