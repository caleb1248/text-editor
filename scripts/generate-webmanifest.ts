import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const webManifestPath = join(import.meta.dir, '../public/app.webmanifest');
const extensionsDir = join(import.meta.dir, '../src/language-support/basic-languages');

const manifest = {
  display: 'standalone',
  name: 'Text Editor',
  short_name: 'Text Editor',
  start_url: '/',
  scope: '/',
  theme_color: '#181818',
  background_color: '#ffffff',
  display_override: ['window-controls-overlay'],
  icons: [
    {
      src: '/icon/192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icon/512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],

  file_handlers: [
    {
      action: '/',
      accept: { 'text/plain': ['.txt', '.log'] },
      icon: '/icon/192.png',
      launch_type: 'single-client',
    },
  ],
  launch_handler: {
    client_mode: 'focus-existing',
  },
};

const languageExtensions = await readdir(extensionsDir);

for (const extension of languageExtensions) {
  const extensionPath = join(extensionsDir, extension, 'package.json');
  const packageJsonFile = Bun.file(extensionPath);
  if (!packageJsonFile.exists()) continue;

  const packageJson = await packageJsonFile.json().catch(() => null);
  if (!packageJson) continue;

  const languages = packageJson.contributes?.languages;
  if (!languages) continue;

  for (const lang of languages) {
    if (lang.extensions && Array.isArray(lang.extensions)) {
      for (const ext of lang.extensions) {
        manifest.file_handlers[0].accept['text/plain'].push(ext);
      }
    }
  }
}

const accept = manifest.file_handlers[0].accept;
accept['text/plain'] = [...new Set(accept['text/plain'])];

const manifestJson = JSON.stringify(manifest, null, 2);
await Bun.write(webManifestPath, manifestJson);
