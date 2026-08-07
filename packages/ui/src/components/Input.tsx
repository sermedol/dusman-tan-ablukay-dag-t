import clsx from 'clsx';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className, disabled, ...props }, ref) => {
    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && (
          <label className="block text-body-sm font-medium text-slate-900 mb-md">
            {label}
            {props.required && <span className="text-rose-600 ml-xs">*</span>}
          </label>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={clsx(
            'w-full px-lg py-md bg-white text-body text-slate-900',
            'border border-slate-200 rounded-base',
            'placeholder:text-slate-400',
            'transition-colors duration-base',
            'focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error && 'border-rose-600 focus:ring-rose-600',
            className
          )}
          {...props}
        />
        {error && <p className="text-body-sm text-rose-600 mt-xs">{error}</p>}
        {helperText && !error && <p className="text-body-sm text-slate-500 mt-xs">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
