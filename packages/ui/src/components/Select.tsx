import React from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      options,
      placeholder = 'Select an option',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && (
          <label className="block text-body-sm font-medium text-slate-900 mb-md">
            {label}
            {props.required && <span className="text-rose-600 ml-xs">*</span>}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={clsx(
            'w-full px-lg py-md bg-white text-body text-slate-900',
            'border border-slate-200 rounded-base',
            'transition-colors duration-base',
            'focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            'appearance-none',
            error && 'border-rose-600 focus:ring-rose-600',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-body-sm text-rose-600 mt-xs">{error}</p>}
        {helperText && !error && <p className="text-body-sm text-slate-500 mt-xs">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
