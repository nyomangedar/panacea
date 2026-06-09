type Variant = 'line' | 'circle' | 'block';

export interface SkeletonProps {
  rows?: number;
  variant?: Variant;
  width?: string;
}

export function Skeleton({ rows = 1, variant = 'line', width }: SkeletonProps) {
  return (
    <div className="sk-stack" role="status" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          data-testid="skeleton-row"
          className={`sk sk-${variant}`}
          style={width ? { width } : undefined}
        />
      ))}
    </div>
  );
}
