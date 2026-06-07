import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { IEventBus, EventHandler } from './event-bus.js';

export interface EventSubscription {
  event: string;
  handler: EventHandler;
}

export interface ModuleManifest {
  name: string;
  enabled: boolean;
  apiPrefix: string;
  plugin: FastifyPluginAsync;
  events: {
    publishes: string[];
    subscribes: EventSubscription[];
  };
}

export async function loadModules(
  app: FastifyInstance,
  bus: IEventBus,
  getManifests: () => ModuleManifest[] | Promise<ModuleManifest[]>,
): Promise<void> {
  const manifests = await getManifests();
  for (const manifest of manifests) {
    if (!manifest.enabled) continue;
    app.register(manifest.plugin, { prefix: manifest.apiPrefix });
    for (const { event, handler } of manifest.events.subscribes) {
      bus.subscribe(event, handler);
    }
  }
}
