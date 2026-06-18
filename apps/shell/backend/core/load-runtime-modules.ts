import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, isAbsolute, join } from 'node:path';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { Sql } from 'postgres';
import { syncPermissions, type ModuleManifest as StaticManifest } from '@panacea/shared';
import { loadModules } from './module-loader.js';
import { eventBus } from './event-bus.js';
import { modulePaths } from '../modules.config.js';

const here = dirname(fileURLToPath(import.meta.url)); // .../apps/shell/backend/core
// repo siblings live under panacea-sourcecode/: core → backend → shell → apps → panacea → panacea-sourcecode
const SOURCE_ROOT = resolve(here, '../../../../..');

type ModulePlugin = FastifyPluginAsync<{ db: Sql }>;

/**
 * Discovers modules from MODULES_PATH (sibling repo dirs), imports each module's
 * static manifest + backend plugin, syncs its declared permissions into
 * public.permissions, and registers the plugin into the shell (db injected).
 *
 * Dev/test harness: imports the modules' TypeScript sources directly (run under tsx).
 */
export async function registerModules(app: FastifyInstance, db: Sql): Promise<void> {
  await loadModules(app, eventBus, async () => {
    const runtime = [];
    for (const p of modulePaths) {
      const dir = isAbsolute(p) ? p : resolve(SOURCE_ROOT, p);

      const manifestMod = (await import(pathToFileURL(join(dir, 'manifest.ts')).href)) as {
        manifest: StaticManifest;
      };
      const backendMod = (await import(pathToFileURL(join(dir, 'backend/index.ts')).href)) as {
        default?: ModulePlugin;
        adminPlugin?: ModulePlugin;
      };
      const manifest = manifestMod.manifest;
      const plugin = backendMod.default ?? backendMod.adminPlugin;
      if (!plugin) throw new Error(`Module ${dir} has no backend plugin export`);

      await syncPermissions(db, manifest.permissions);

      runtime.push({
        name: manifest.name,
        enabled: true,
        apiPrefix: manifest.apiPrefix,
        // bind the shell's db into the module plugin
        plugin: (instance: FastifyInstance) => plugin(instance, { db }),
        events: { publishes: manifest.events.publishes, subscribes: [] },
      });
    }
    return runtime;
  });
}
