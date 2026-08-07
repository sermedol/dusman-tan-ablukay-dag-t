import clsx from 'clsx';
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      footer,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      size = 'md',
    },
    ref
  ) => {
    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (closeOnEscape && e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, closeOnEscape, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-lg">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity duration-fast"
          onClick={() => closeOnBackdropClick && onClose()}
          aria-hidden="true"
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={clsx(
            'relative bg-white rounded-lg shadow-xl w-full animate-fade-in',
            'max-h-[90vh] overflow-y-auto',
            sizeClasses[size]
          )}
        >
          {title && (
            <div className="flex items-center justify-between p-2xl border-b border-slate-200">
              <h2 className="text-h2 font-semibold text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          {children && <div className="p-2xl">{children}</div>}
          {footer && (
            <div className="border-t border-slate-200 p-2xl bg-slate-50 flex gap-md justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
