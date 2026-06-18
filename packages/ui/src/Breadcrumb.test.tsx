import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders the trail and marks the last crumb as current', () => {
    // TDD: ui/Breadcrumb.test.tsx — renders trail, last crumb is current (not a button) | positive
    render(<Breadcrumb items={[{ label: 'Groups', onClick: () => {} }, { label: 'Team A' }]} />);
    expect(screen.getByRole('button', { name: 'Groups' })).toBeInTheDocument();
    const current = screen.getByText('Team A');
    expect(current).toHaveAttribute('aria-current', 'page');
    // the current crumb is not actionable
    expect(screen.queryByRole('button', { name: 'Team A' })).not.toBeInTheDocument();
  });

  it('invokes onClick when an ancestor crumb is clicked', async () => {
    // TDD: ui/Breadcrumb.test.tsx — clicking an ancestor crumb fires its onClick | positive
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ label: 'Groups', onClick }, { label: 'Team A' }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Groups' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
