import { join } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxDev: false,
  },

  optimizeDeps: {
    include: ['vscode-textmate', 'vscode-oniguruma'],
  },

  build: {
    manifest: true,
  },

  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
});
