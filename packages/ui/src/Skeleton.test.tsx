import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders correct number of placeholder rows', () => {
    // TDD: ui/Skeleton.test.tsx — renders correct number of placeholder rows | positive
    render(<Skeleton rows={3} />);
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(3);
  });

  it('renders a single placeholder row by default', () => {
    // TDD: ui/Skeleton.test.tsx — renders correct number of placeholder rows | negative
    render(<Skeleton />);
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(1);
  });
});
