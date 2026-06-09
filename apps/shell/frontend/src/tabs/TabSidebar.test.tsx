import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabSidebar, type TabSidebarProps } from './TabSidebar';
import type { Tab } from './useTabs';

const TABS: Tab[] = [
  { moduleId: 'admin', label: 'Admin' },
  { moduleId: 'ticketing', label: 'Ticketing' },
];

function renderSidebar(overrides: Partial<TabSidebarProps> = {}) {
  const props: TabSidebarProps = {
    tabs: TABS,
    activeTab: 'ticketing',
    userEmail: 'alice@panacea.dev',
    onSwitch: vi.fn(),
    onClose: vi.fn(),
    onOpenPicker: vi.fn(),
    onSignOut: vi.fn(),
    ...overrides,
  };
  render(<TabSidebar {...props} />);
  return props;
}

describe('TabSidebar', () => {
  it('renders open tabs and marks the active one', () => {
    // TDD: TabSidebar.test.tsx — renders open tabs, marks active, fires switch and close | positive
    renderSidebar();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ticketing/, selected: true })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Admin/, selected: false })).toBeInTheDocument();
  });

  it('fires onSwitch when a tab is clicked and onClose when its close button is clicked', async () => {
    // TDD: TabSidebar.test.tsx — renders open tabs, marks active, fires switch and close | positive
    const { onSwitch, onClose } = renderSidebar();
    await userEvent.click(screen.getByRole('tab', { name: /Admin/ }));
    expect(onSwitch).toHaveBeenCalledWith('admin');

    const adminTab = screen.getByRole('tab', { name: /Admin/ });
    await userEvent.click(within(adminTab).getByRole('button', { name: /close admin/i }));
    expect(onClose).toHaveBeenCalledWith('admin');
  });

  it('fires onOpenPicker when the open-module button is clicked', async () => {
    // TDD: TabSidebar.test.tsx — renders open tabs, marks active, fires switch and close | negative
    const { onOpenPicker } = renderSidebar();
    await userEvent.click(screen.getByRole('button', { name: /open module/i }));
    expect(onOpenPicker).toHaveBeenCalledTimes(1);
  });

  it('shows the user profile header (avatar initial + email) and signs out', async () => {
    // TDD: TabSidebar.test.tsx — renders user profile header with avatar initial and sign out | positive
    const { onSignOut } = renderSidebar({ userEmail: 'alice@panacea.dev' });
    expect(screen.getByText('alice@panacea.dev')).toBeInTheDocument();
    expect(screen.getByText('A', { exact: true })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
