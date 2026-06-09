import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModulePicker } from './ModulePicker';
import type { ModuleManifest } from './module-registry';

const load = async () => ({ default: () => null });
const MODULES: ModuleManifest[] = [
  { id: 'admin', label: 'Admin', description: 'Users, roles & audit log', load },
  { id: 'ticketing', label: 'Ticketing', description: 'Issues & workflows', load },
];

describe('ModulePicker', () => {
  it('lists available modules, filters by search, and selecting fires onSelect', async () => {
    // TDD: ModulePicker.test.tsx — lists available modules, filters by search, selecting fires onSelect | positive
    const onSelect = vi.fn();
    render(
      <ModulePicker open modules={MODULES} openModuleIds={[]} onSelect={onSelect} onClose={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /Admin/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ticketing/ })).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('Search modules…'), 'admin');
    expect(screen.queryByRole('button', { name: /Ticketing/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Admin/ }));
    expect(onSelect).toHaveBeenCalledWith('admin');
  });

  it('does not render when closed', () => {
    // TDD: ModulePicker.test.tsx — lists available modules, filters by search, selecting fires onSelect | negative
    render(
      <ModulePicker open={false} modules={MODULES} openModuleIds={[]} onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
