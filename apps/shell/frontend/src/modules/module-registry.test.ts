import { describe, it, expect } from 'vitest';
import { getAvailableModules, type ModuleManifest } from './module-registry';

const load = async () => ({ default: () => null });

const manifests: ModuleManifest[] = [
  { id: 'admin', label: 'Admin', load },
  { id: 'ticketing', label: 'Ticketing', load },
  { id: 'analytics', label: 'Analytics', enabled: false, load },
];

describe('module registry', () => {
  it('returns list of registered modules from manifests', () => {
    // TDD: module-registry.test.ts — returns list of registered modules from manifests | positive
    const available = getAvailableModules([manifests[0], manifests[1]]);
    expect(available.map((m) => m.id)).toEqual(['admin', 'ticketing']);
  });

  it('excludes disabled modules', () => {
    // TDD: module-registry.test.ts — excludes disabled modules | negative
    const available = getAvailableModules(manifests);
    expect(available.map((m) => m.id)).toEqual(['admin', 'ticketing']);
    expect(available.some((m) => m.id === 'analytics')).toBe(false);
  });
});
