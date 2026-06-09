import { useCallback, useRef, useState } from 'react';

export interface Tab {
  moduleId: string;
  label: string;
}

export interface UseTabs {
  tabs: Tab[];
  activeTab: string | null;
  openTab: (moduleId: string, label: string) => void;
  closeTab: (moduleId: string) => void;
  switchTab: (moduleId: string) => void;
}

export function useTabs(): UseTabs {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // always-latest snapshot of tabs for existence checks in stable callbacks
  const tabsRef = useRef<Tab[]>(tabs);
  tabsRef.current = tabs;

  const openTab = useCallback((moduleId: string, label: string) => {
    setTabs((prev) =>
      prev.some((t) => t.moduleId === moduleId) ? prev : [...prev, { moduleId, label }],
    );
    setActiveTab(moduleId);
  }, []);

  const switchTab = useCallback((moduleId: string) => {
    if (tabsRef.current.some((t) => t.moduleId === moduleId)) setActiveTab(moduleId);
  }, []);

  const closeTab = useCallback((moduleId: string) => {
    const prev = tabsRef.current;
    const idx = prev.findIndex((t) => t.moduleId === moduleId);
    if (idx === -1) return;
    const next = prev.filter((t) => t.moduleId !== moduleId);
    setTabs(next);
    setActiveTab((current) => {
      if (current !== moduleId) return current;
      if (next.length === 0) return null;
      return (prev[idx - 1] ?? next[0]).moduleId;
    });
  }, []);

  return { tabs, activeTab, openTab, closeTab, switchTab };
}
