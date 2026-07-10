import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build can be served from any subpath
  // (e.g. apps.charliekrug.com/leap-second) without rewriting asset URLs.
  base: './',
  build: {
    // Emit the production build into site/ — the committed static artifact the
    // publisher serves from apps.charliekrug.com/leap-second/.
    outDir: 'site',
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
      exclude: ['src/main.js'],
      all: true,
    },
  },
});
