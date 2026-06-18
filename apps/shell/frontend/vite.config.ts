/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // single copy of these so the cross-repo admin chunk shares the shell's
    // React + QueryClient context (avoids dual-package "invalid hook" errors).
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    alias: {
      // dev: load the admin module's frontend straight from its sibling repo
      '@panacea-admin/frontend': fileURLToPath(
        new URL('../../../../panacea-admin/frontend/index.tsx', import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
    // allow Vite to serve files from the panacea-sourcecode root (sibling module repos)
    fs: { allow: [fileURLToPath(new URL('../../../..', import.meta.url))] },
    proxy: {
      // keep the httpOnly session cookie same-origin in dev.
      // 127.0.0.1 (not localhost): the backend binds IPv4 only; localhost can resolve to ::1 on Windows.
      '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: false,
  },
});
