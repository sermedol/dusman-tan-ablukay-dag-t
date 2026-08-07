import Link from 'next/link';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ children, className = '', href, padding = 'md' }: CardProps) {
  const classes = `block rounded-lg border border-border bg-surface ${paddings[padding]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${classes} transition-all duration-base ease-standard hover:border-border-strong hover:shadow-sm`}
      >
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
