import { ModuleRenderer } from './ModuleRenderer';
import type { ModuleManifest } from './module-registry';
import type { Tab } from '../tabs/useTabs';

export interface TabPanelsProps {
  tabs: Tab[];
  activeTab: string | null;
  modules: ModuleManifest[];
}

/**
 * Mounts every open tab's module and keeps background tabs in the DOM with
 * display:none, so switching tabs preserves their state instead of remounting.
 */
export function TabPanels({ tabs, activeTab, modules }: TabPanelsProps) {
  return (
    <>
      {tabs.map((tab) => {
        const mod = modules.find((m) => m.id === tab.moduleId);
        const active = tab.moduleId === activeTab;
        return (
          <div
            key={tab.moduleId}
            role="tabpanel"
            data-testid={`panel-${tab.moduleId}`}
            hidden={!active}
            style={{ display: active ? 'block' : 'none', height: '100%' }}
          >
            {mod ? <ModuleRenderer load={mod.load} /> : null}
          </div>
        );
      })}
    </>
  );
}
