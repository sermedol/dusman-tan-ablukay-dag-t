import clsx from 'clsx';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  noBorder?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, noBorder = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white rounded-md p-2xl',
          !noBorder && 'border border-slate-200',
          hoverable && 'hover:shadow-md transition-shadow duration-base cursor-pointer',
          'shadow-sm',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('mb-lg', className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={clsx('text-h3 font-semibold text-slate-900', className)} {...props}>
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={clsx('text-body text-slate-600', className)} {...props}>
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('space-y-md', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('mt-xl pt-lg border-t border-slate-200 flex gap-md justify-end', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';
