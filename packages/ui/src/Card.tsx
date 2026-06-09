import type { ReactNode } from 'react';

export interface CardProps {
  title?: string;
  description?: string;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Card({ title, description, header, footer, children }: CardProps) {
  const hasHead = title || description || header;
  return (
    <div className="card">
      {hasHead && (
        <div className="card-head" data-testid="card-head">
          <div>
            {title && <div className="card-title">{title}</div>}
            {description && <div className="card-desc">{description}</div>}
          </div>
          {header}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && (
        <div className="card-foot" data-testid="card-foot">
          {footer}
        </div>
      )}
    </div>
  );
}
