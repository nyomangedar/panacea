import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabs } from './useTabs';

describe('useTabs', () => {
  it('opens a tab with correct moduleId and label', () => {
    // TDD: useTabs.test.ts — opens a tab with correct moduleId and label | positive
    const { result } = renderHook(() => useTabs());
    act(() => result.current.openTab('admin', 'Admin'));
    expect(result.current.tabs).toEqual([{ moduleId: 'admin', label: 'Admin' }]);
    expect(result.current.activeTab).toBe('admin');
  });

  it('switches active tab', () => {
    // TDD: useTabs.test.ts — switches active tab | positive
    const { result } = renderHook(() => useTabs());
    act(() => {
      result.current.openTab('admin', 'Admin');
      result.current.openTab('ticketing', 'Ticketing');
    });
    expect(result.current.activeTab).toBe('ticketing');
    act(() => result.current.switchTab('admin'));
    expect(result.current.activeTab).toBe('admin');
  });

  it('closes a tab and activates the previous one', () => {
    // TDD: useTabs.test.ts — closes a tab and activates the previous one | positive
    const { result } = renderHook(() => useTabs());
    act(() => {
      result.current.openTab('admin', 'Admin');
      result.current.openTab('ticketing', 'Ticketing');
    });
    act(() => result.current.closeTab('ticketing'));
    expect(result.current.tabs.map((t) => t.moduleId)).toEqual(['admin']);
    expect(result.current.activeTab).toBe('admin');
  });

  it('closing the last tab sets activeTab to null', () => {
    // TDD: useTabs.test.ts — closing the last tab sets activeTab to null | positive
    const { result } = renderHook(() => useTabs());
    act(() => result.current.openTab('admin', 'Admin'));
    act(() => result.current.closeTab('admin'));
    expect(result.current.tabs).toHaveLength(0);
    expect(result.current.activeTab).toBeNull();
  });

  it('prevents opening the same module twice', () => {
    // TDD: useTabs.test.ts — prevents opening the same module twice | negative
    const { result } = renderHook(() => useTabs());
    act(() => {
      result.current.openTab('admin', 'Admin');
      result.current.openTab('ticketing', 'Ticketing');
      result.current.openTab('admin', 'Admin');
    });
    expect(result.current.tabs.map((t) => t.moduleId)).toEqual(['admin', 'ticketing']);
    expect(result.current.activeTab).toBe('admin');
  });
});
