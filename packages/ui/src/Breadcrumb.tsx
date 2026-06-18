import { Fragment } from 'react';

export interface Crumb {
  label: string;
  // When provided (and not the last crumb), the crumb renders as a button that
  // navigates back. The last crumb is always the current page and is never clickable.
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: Crumb[];
  separator?: string;
}

export function Breadcrumb({ items, separator = '/' }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li className="breadcrumb-item">
                {item.onClick && !isLast ? (
                  <button type="button" className="breadcrumb-link" onClick={item.onClick}>
                    {item.label}
                  </button>
                ) : (
                  <span className="breadcrumb-current" aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li className="breadcrumb-sep" aria-hidden="true">
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
