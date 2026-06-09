import { Component, Suspense, lazy, useMemo, type ComponentType, type ReactNode } from 'react';
import { Skeleton } from '@panacea/ui';

class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export interface ModuleRendererProps {
  load: () => Promise<{ default: ComponentType }>;
}

export function ModuleRenderer({ load }: ModuleRendererProps) {
  const LazyModule = useMemo(() => lazy(load), [load]);
  return (
    <ErrorBoundary
      fallback={
        <div role="alert" style={{ padding: 24, color: 'var(--color-danger)' }}>
          Failed to load module.
        </div>
      }
    >
      <Suspense fallback={<div style={{ padding: 24 }}><Skeleton rows={4} /></div>}>
        <LazyModule />
      </Suspense>
    </ErrorBoundary>
  );
}
