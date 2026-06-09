import { createContext, useContext, type ComponentType, type ReactNode } from 'react';

export interface ModuleManifest {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
  load: () => Promise<{ default: ComponentType }>;
}

/** Pure selector: the modules the shell should expose (enabled unless explicitly false). */
export function getAvailableModules(manifests: ModuleManifest[]): ModuleManifest[] {
  return manifests.filter((m) => m.enabled !== false);
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
