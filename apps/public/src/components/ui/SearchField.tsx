'use client';

import type { InputHTMLAttributes } from 'react';

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'md' | 'lg';
}

export default function SearchField({ size = 'md', className = '', ...rest }: SearchFieldProps) {
  const sizeClasses = size === 'lg' ? 'h-14 pl-12 pr-4 text-body-lg' : 'h-11 pl-10 pr-4 text-body';
  const iconClasses = size === 'lg' ? 'left-4 h-5 w-5' : 'left-3.5 h-4 w-4';

  return (
    <div className="relative w-full">
      <svg
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-faint ${iconClasses}`}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        className={`w-full rounded-md border border-border bg-surface text-ink placeholder:text-ink-faint transition-colors duration-base ease-standard focus:border-accent focus:outline-none ${sizeClasses} ${className}`}
        {...rest}
      />
    </div>
  );
}
