import clsx from 'clsx';
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharacterCount?: boolean;
  maxCharacters?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      showCharacterCount = false,
      maxCharacters,
      className,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const characterCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && (
          <label className="block text-body-sm font-medium text-slate-900 mb-md">
            {label}
            {props.required && <span className="text-rose-600 ml-xs">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          disabled={disabled}
          value={value}
          className={clsx(
            'w-full px-lg py-md bg-white text-body text-slate-900',
            'border border-slate-200 rounded-base',
            'placeholder:text-slate-400',
            'transition-colors duration-base',
            'focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            'resize-vertical min-h-[120px]',
            error && 'border-rose-600 focus:ring-rose-600',
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between mt-xs">
          <div>
            {error && <p className="text-body-sm text-rose-600">{error}</p>}
            {helperText && !error && <p className="text-body-sm text-slate-500">{helperText}</p>}
          </div>
          {showCharacterCount && (
            <p
              className={clsx(
                'text-caption',
                maxCharacters && characterCount > maxCharacters * 0.9
                  ? 'text-amber-600'
                  : 'text-slate-500'
              )}
            >
              {characterCount}
              {maxCharacters && `/${maxCharacters}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
