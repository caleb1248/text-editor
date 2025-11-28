import { join } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['vscode-textmate', 'vscode-oniguruma'],
  },

  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
});
