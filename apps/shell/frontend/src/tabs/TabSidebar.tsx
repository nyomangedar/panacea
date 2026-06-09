import type { Tab } from './useTabs';

export interface TabSidebarProps {
  tabs: Tab[];
  activeTab: string | null;
  userEmail: string;
  onSwitch: (moduleId: string) => void;
  onClose: (moduleId: string) => void;
  onOpenPicker: () => void;
  onSignOut: () => void;
}

const MODULE_COLOR: Record<string, string> = {
  admin: 'var(--mod-admin)',
  ticketing: 'var(--mod-ticketing)',
  scheduler: 'var(--mod-scheduler)',
  analytics: 'var(--mod-analytics)',
  financing: 'var(--mod-financing)',
};

export function TabSidebar({
  tabs,
  activeTab,
  userEmail,
  onSwitch,
  onClose,
  onOpenPicker,
  onSignOut,
}: TabSidebarProps) {
  const initial = userEmail.charAt(0).toUpperCase();
  return (
    <aside className="sb">
      <div className="sb-head">
        <div className="avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="who">
          <div className="who-name" title={userEmail}>
            {userEmail}
          </div>
        </div>
        <button type="button" className="sb-signout" aria-label="Sign out" title="Sign out" onClick={onSignOut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="sb-scroll" role="tablist" aria-orientation="vertical">
        <div className="sec-label">Open</div>
        {tabs.map((tab) => {
          const active = tab.moduleId === activeTab;
          return (
            <div
              key={tab.moduleId}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              title={tab.label}
              className={active ? 'item active' : 'item'}
              onClick={() => onSwitch(tab.moduleId)}
            >
              <span
                className="lead-dot"
                aria-hidden="true"
                style={{ background: MODULE_COLOR[tab.moduleId] ?? 'var(--color-text-tertiary)' }}
              />
              <span className="label">{tab.label}</span>
              <button
                type="button"
                className="close"
                aria-label={`Close ${tab.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.moduleId);
                }}
              >
                ×
              </button>
            </div>
          );
        })}
        <button type="button" className="sb-new" onClick={onOpenPicker}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="lbl">Open module</span>
        </button>
      </div>
    </aside>
  );
}
