import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 5555,
  },
  test: {
    environment: 'jsdom',
  },
});
