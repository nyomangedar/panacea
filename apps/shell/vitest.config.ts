import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // backend package only — the frontend (apps/shell/frontend) is its own package
    include: ['backend/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    env: {
      // Windows Docker Desktop uses a named pipe, not /var/run/docker.sock
      DOCKER_HOST: 'npipe:////./pipe/dockerDesktopLinuxEngine',
    },
  },
});
