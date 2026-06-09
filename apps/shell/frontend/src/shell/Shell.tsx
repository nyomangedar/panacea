import { useState } from 'react';
import { Button } from '@panacea/ui';
import { useTabs } from '../tabs/useTabs';
import { TabSidebar } from '../tabs/TabSidebar';
import { ModulePicker } from '../modules/ModulePicker';
import { TabPanels } from '../modules/TabPanels';
import { useModuleRegistry } from '../modules/module-registry';
import { useAuth } from '../auth/AuthContext';

export function Shell() {
  const modules = useModuleRegistry();
  const { tabs, activeTab, openTab, closeTab, switchTab } = useTabs();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  function handleSelect(moduleId: string) {
    const mod = modules.find((m) => m.id === moduleId);
    if (mod) openTab(mod.id, mod.label);
    setPickerOpen(false);
  }

  return (
    <div className={collapsed ? 'shell collapsed' : 'shell'}>
      <TabSidebar
        tabs={tabs}
        activeTab={activeTab}
        userEmail={user?.email ?? ''}
        onSwitch={switchTab}
        onClose={closeTab}
        onOpenPicker={() => setPickerOpen(true)}
        onSignOut={() => logout()}
      />
      <div className="content">
        <div className="shell-topbar">
          <button
            type="button"
            className="sb-toggle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <span className="crumb">{tabs.find((t) => t.moduleId === activeTab)?.label ?? 'Home'}</span>
          <span className="spacer" />
        </div>
        <div className="shell-main">
          {tabs.length === 0 ? (
            <div className="shell-empty">
              <p>No modules open.</p>
              <Button onClick={() => setPickerOpen(true)}>Open a module</Button>
            </div>
          ) : (
            <TabPanels tabs={tabs} activeTab={activeTab} modules={modules} />
          )}
        </div>
      </div>
      <ModulePicker
        open={pickerOpen}
        modules={modules}
        openModuleIds={tabs.map((t) => t.moduleId)}
        onSelect={handleSelect}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
