import clsx from 'clsx';
import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children?: React.ReactNode;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => (
    <form ref={ref} className={clsx('space-y-lg', className)} {...props}>
      {children}
    </form>
  )
);

Form.displayName = 'Form';

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('flex flex-col gap-md', className)} {...props}>
      {children}
    </div>
  )
);

FormGroup.displayName = 'FormGroup';

interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
}

export const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(
  ({ className, columns = 2, children, ...props }, ref) => {
    const gridClasses = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    };

    return (
      <div ref={ref} className={clsx('grid gap-lg', gridClasses[columns], className)} {...props}>
        {children}
      </div>
    );
  }
);

FormRow.displayName = 'FormRow';

interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  messages?: string[];
}

export const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  ({ messages, className, ...props }, ref) => {
    if (!messages || messages.length === 0) return null;

    return (
      <div
        ref={ref}
        className={clsx('rounded-base bg-rose-50 border border-rose-200 p-md', className)}
        role="alert"
        {...props}
      >
        {messages.length === 1 ? (
          <p className="text-body-sm text-rose-800">{messages[0]}</p>
        ) : (
          <ul className="text-body-sm text-rose-800 space-y-xs">
            {messages.map((message, idx) => (
              <li key={idx}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

FormError.displayName = 'FormError';

interface FormSuccessProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export const FormSuccess = React.forwardRef<HTMLDivElement, FormSuccessProps>(
  ({ message, className, ...props }, ref) => {
    if (!message) return null;

    return (
      <div
        ref={ref}
        className={clsx('rounded-base bg-emerald-50 border border-emerald-200 p-md', className)}
        role="status"
        {...props}
      >
        <p className="text-body-sm text-emerald-800">{message}</p>
      </div>
    );
  }
);

FormSuccess.displayName = 'FormSuccess';

interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ align = 'end', className, children, ...props }, ref) => {
    const alignClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
    };

    return (
      <div
        ref={ref}
        className={clsx('flex gap-md pt-lg border-t border-slate-200', alignClasses[align], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = 'FormActions';
