import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build can be served from any subpath
  // (e.g. apps.charliekrug.com/leap-second) without rewriting asset URLs.
  base: './',
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'node',
  },
});
