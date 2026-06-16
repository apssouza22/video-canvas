import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'demo',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [tailwindcss()],
  server: {
    port: 5554,
    strictPort: true,
  },
  test: {
    root: projectRoot,
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
  },
});
