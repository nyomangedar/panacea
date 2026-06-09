import { useState } from 'react';
import { Modal } from '@panacea/ui';
import type { ModuleManifest } from './module-registry';

export interface ModulePickerProps {
  open: boolean;
  modules: ModuleManifest[];
  openModuleIds: string[];
  onSelect: (moduleId: string) => void;
  onClose: () => void;
}

const MODULE_COLOR: Record<string, string> = {
  admin: 'var(--mod-admin)',
  ticketing: 'var(--mod-ticketing)',
  scheduler: 'var(--mod-scheduler)',
  analytics: 'var(--mod-analytics)',
  financing: 'var(--mod-financing)',
};

export function ModulePicker({ open, modules, openModuleIds, onSelect, onClose }: ModulePickerProps) {
  const [query, setQuery] = useState('');
  const filtered = modules.filter((m) => m.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Modal open={open} onClose={onClose} title="Open a module" description="Choose a module to open in a new tab">
      <div className="pick-search">
        <input
          autoFocus
          placeholder="Search modules…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="pick-grid">
        {filtered.map((mod) => {
          const opened = openModuleIds.includes(mod.id);
          return (
            <button
              type="button"
              key={mod.id}
              className={opened ? 'pick-card opened' : 'pick-card'}
              onClick={() => onSelect(mod.id)}
            >
              <span className="pick-ico" style={{ color: MODULE_COLOR[mod.id] ?? 'var(--color-text-secondary)' }}>
                {mod.label.charAt(0)}
              </span>
              <span className="pick-text">
                <span className="pick-name">{mod.label}</span>
                {mod.description && <span className="pick-desc">{mod.description}</span>}
              </span>
              {opened && <span className="opened-tag">Open</span>}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
