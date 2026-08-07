import type { ElementType, ReactNode } from 'react';

export default function Container({
  children,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={`mx-auto w-full max-w-content px-5 sm:px-8 ${className}`}>{children}</Tag>;
}
