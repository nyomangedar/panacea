import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  getAvailableModules,
  getVisiblePages,
  isModuleAccessible,
  type ModuleManifest,
  type NavPage,
} from './module-registry';
import { ModulePicker } from './ModulePicker';

const load = async () => ({ default: () => null });

describe('permission gating', () => {
  it('module without :access permission is shown but disabled in the picker', () => {
    // TDD: shell-permission-gating.test.tsx — module without :access permission is shown but disabled in the picker | positive
    const modules: ModuleManifest[] = [
      { id: 'admin', label: 'Admin', accessPermission: 'admin:access', load },
      { id: 'ticketing', label: 'Ticketing', accessPermission: 'ticketing:access', load },
    ];
    render(
      <ModulePicker
        open
        modules={modules}
        openModuleIds={[]}
        permissions={new Set(['admin:access'])}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    // both still shown, but the one without access is disabled
    expect(screen.getByRole('button', { name: /Admin/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Ticketing/ })).toBeDisabled();
  });

  it('getAvailableModules returns all enabled modules; isModuleAccessible reflects permissions', () => {
    // TDD: shell-permission-gating.test.tsx — module without :access permission is shown but disabled in the picker | positive
    const modules: ModuleManifest[] = [
      { id: 'admin', label: 'Admin', accessPermission: 'admin:access', load },
      { id: 'disabled', label: 'Disabled', enabled: false, load },
    ];
    expect(getAvailableModules(modules).map((m) => m.id)).toEqual(['admin']);
    expect(isModuleAccessible(modules[0], new Set())).toBe(false);
    expect(isModuleAccessible(modules[0], new Set(['admin:access']))).toBe(true);
  });

  it('page without :access permission is hidden within its module', () => {
    // TDD: shell-permission-gating.test.tsx — page without :access permission is hidden within its module | positive
    const pages: NavPage[] = [
      { id: 'users', label: 'Users', accessPermission: 'admin:users:access' },
      { id: 'audit', label: 'Audit log', accessPermission: 'admin:audit:access' },
    ];
    expect(getVisiblePages(pages, new Set(['admin:users:access'])).map((p) => p.id)).toEqual(['users']);
  });
});
