import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabPanels } from './TabPanels';
import type { ModuleManifest } from './module-registry';
import type { Tab } from '../tabs/useTabs';

const modules: ModuleManifest[] = [
  { id: 'admin', label: 'Admin', load: async () => ({ default: () => <div>Admin Module</div> }) },
  { id: 'ticketing', label: 'Ticketing', load: async () => ({ default: () => <div>Ticketing Module</div> }) },
];
const tabs: Tab[] = [
  { moduleId: 'admin', label: 'Admin' },
  { moduleId: 'ticketing', label: 'Ticketing' },
];

describe('TabPanels', () => {
  it('mounts all open tabs but hides the inactive ones with display:none', () => {
    // TDD: TabPanels.test.tsx — mounts all open tabs but hides inactive ones (display:none) | positive
    render(<TabPanels tabs={tabs} activeTab="admin" modules={modules} />);
    const adminPanel = screen.getByTestId('panel-admin');
    const ticketingPanel = screen.getByTestId('panel-ticketing');

    // both mounted in the DOM
    expect(adminPanel).toBeInTheDocument();
    expect(ticketingPanel).toBeInTheDocument();

    // only the active one is visible
    expect(adminPanel).toBeVisible();
    expect(ticketingPanel).not.toBeVisible();
  });
});
