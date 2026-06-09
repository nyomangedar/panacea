import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext, type AuthValue } from '../auth/AuthContext';
import { ModuleRegistryProvider } from '../modules/module-registry';
import { MODULE_MANIFESTS } from '../modules/registry-config';
import { Shell } from './Shell';

function renderShell() {
  const auth: AuthValue = {
    user: { id: 'u1', email: 'alice@panacea.dev' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={auth}>
      <ModuleRegistryProvider manifests={MODULE_MANIFESTS}>
        <Shell />
      </ModuleRegistryProvider>
    </AuthContext.Provider>,
  );
}

describe('Shell sidebar collapse', () => {
  it('toggles the sidebar open and closed', async () => {
    // TDD: Shell.test.tsx — toggles the sidebar open/closed (collapse rail) | positive
    const { container } = renderShell();
    const shell = container.querySelector('.shell')!;

    expect(shell).not.toHaveClass('collapsed');
    await userEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }));
    expect(shell).toHaveClass('collapsed');

    await userEvent.click(screen.getByRole('button', { name: /expand sidebar/i }));
    expect(shell).not.toHaveClass('collapsed');
  });
});
