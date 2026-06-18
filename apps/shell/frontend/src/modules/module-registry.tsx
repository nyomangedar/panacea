import { createContext, useContext, type ComponentType, type ReactNode } from 'react';

export interface NavPage {
  id: string;
  label: string;
  accessPermission?: string;
}

export interface ModuleManifest {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
  /** Permission key gating module visibility (e.g. 'admin:access'). */
  accessPermission?: string;
  pages?: NavPage[];
  load: () => Promise<{ default: ComponentType }>;
}

/** Pure selector: the modules the shell should expose (enabled unless explicitly false). */
export function getAvailableModules(manifests: ModuleManifest[]): ModuleManifest[] {
  return manifests.filter((m) => m.enabled !== false);
}

/**
 * Whether a user with `permissions` may open a module. A module with no
 * accessPermission is always accessible; omitting `permissions` implies no gating.
 * Inaccessible modules are shown but disabled in the picker (not hidden).
 */
export function isModuleAccessible(m: ModuleManifest, permissions?: Set<string>): boolean {
  if (!m.accessPermission) return true;
  if (!permissions) return true;
  return permissions.has(m.accessPermission);
}

/** Pure selector: the pages within a module visible to a user with `permissions`. */
export function getVisiblePages(pages: NavPage[], permissions?: Set<string>): NavPage[] {
  return pages.filter(
    (p) => !p.accessPermission || !permissions || permissions.has(p.accessPermission),
  );
}

const ModuleRegistryContext = createContext<ModuleManifest[]>([]);

export function ModuleRegistryProvider({
  manifests,
  children,
}: {
  manifests: ModuleManifest[];
  children: ReactNode;
}) {
  return (
    <ModuleRegistryContext.Provider value={getAvailableModules(manifests)}>
      {children}
    </ModuleRegistryContext.Provider>
  );
}

export function useModuleRegistry(): ModuleManifest[] {
  return useContext(ModuleRegistryContext);
}
