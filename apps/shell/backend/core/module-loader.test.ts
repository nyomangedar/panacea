import { describe, it, expect, vi } from 'vitest';
import { loadModules, type ModuleManifest } from './module-loader.js';
import { EventBus } from './event-bus.js';

function makeMockApp() {
  const routes: string[] = [];
  return {
    register: vi.fn((plugin: unknown, opts: { prefix?: string }) => {
      routes.push(opts?.prefix ?? 'unknown');
    }),
    routes,
  };
}

describe('loadModules', () => {
  it('registers routes from a mock manifest', async () => {
    const app = makeMockApp();
    const bus = new EventBus();
    const manifest: ModuleManifest = {
      name: 'test',
      enabled: true,
      apiPrefix: '/api/test',
      plugin: vi.fn(),
      events: { publishes: [], subscribes: [] },
    };

    await loadModules(app as never, bus, () => [manifest]);

    expect(app.register).toHaveBeenCalledWith(manifest.plugin, {
      prefix: '/api/test',
    });
  });

  it('registers event subscriptions from a mock manifest', async () => {
    const app = makeMockApp();
    const bus = new EventBus();
    const handler = vi.fn();
    const manifest: ModuleManifest = {
      name: 'test',
      enabled: true,
      apiPrefix: '/api/test',
      plugin: vi.fn(),
      events: { publishes: [], subscribes: [{ event: 'ticket.created', handler }] },
    };

    await loadModules(app as never, bus, () => [manifest]);
    await bus.publish('ticket.created', { id: '1' });

    expect(handler).toHaveBeenCalledWith({ id: '1' });
  });

  it('skips disabled modules', async () => {
    const app = makeMockApp();
    const bus = new EventBus();
    const manifest: ModuleManifest = {
      name: 'disabled',
      enabled: false,
      apiPrefix: '/api/disabled',
      plugin: vi.fn(),
      events: { publishes: [], subscribes: [] },
    };

    await loadModules(app as never, bus, () => [manifest]);

    expect(app.register).not.toHaveBeenCalled();
  });
});
