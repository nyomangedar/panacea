import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import { ModuleRenderer } from './ModuleRenderer';

describe('ModuleRenderer', () => {
  it('renders Skeleton while module chunk is loading', () => {
    // TDD: ModuleRenderer.test.tsx — renders Skeleton while module chunk is loading | positive
    const load = () => new Promise<{ default: ComponentType }>(() => {}); // never resolves
    render(<ModuleRenderer load={load} />);
    expect(screen.getAllByTestId('skeleton-row').length).toBeGreaterThan(0);
  });

  it('renders module component after load', async () => {
    // TDD: ModuleRenderer.test.tsx — renders module component after load | positive
    const load = async () => ({ default: () => <div>Module Content</div> });
    render(<ModuleRenderer load={load} />);
    await waitFor(() => expect(screen.getByText('Module Content')).toBeInTheDocument());
  });

  it('renders error boundary if module fails to load', async () => {
    // TDD: ModuleRenderer.test.tsx — renders error boundary if module fails to load | negative
    const load = async (): Promise<{ default: ComponentType }> => {
      throw new Error('chunk load failed');
    };
    render(<ModuleRenderer load={load} />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Failed to load module'));
  });
});
