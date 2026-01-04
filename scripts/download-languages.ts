import degit from 'degit';
import { join } from 'node:path';
import { cp, mkdtemp, rm, readdir, mkdir } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const perf = performance.now();

let lastMessage: string | null = null;

function status(message: string) {
  if (!lastMessage) {
    process.stdout.write(message);
    lastMessage = message;
    return;
  }

  const numLines = Math.ceil(lastMessage.length / process.stdout.columns!);
  const prefix = '\r\x1b[K' + '\x1b[1A\r\x1b[K'.repeat(numLines - 1);
  process.stdout.write(prefix + message);
  lastMessage = message;
}

const tmpDir = await mkdtemp(join(tmpdir(), 'vscode-install-'));
status(`Cloning vscode to temporary directory: ${tmpDir}...`);

process.on('SIGINT', () => {
  console.log('\n\x1b[1;31mPostinstall interrupted by user\x1b[0m');
  rmSync(tmpDir, { recursive: true, force: true });
  process.exit(0);
});

await Bun.$`git clone --depth 1 https://github.com/microsoft/vscode.git ${tmpDir}`.quiet();
const extensionsDir = join(import.meta.dir, '../src/language-support/basic-languages');
await rm(extensionsDir, { recursive: true, force: true });
await mkdir(extensionsDir, { recursive: true });
status('Copying language extensions...');

try {
  for (const dirEntry of await readdir(join(tmpDir, 'extensions'), { withFileTypes: true })) {
    if (dirEntry.isFile()) continue;
    if (dirEntry.name.endsWith('-language-features')) continue;

    const packageJsonFile = Bun.file(join(tmpDir, 'extensions', dirEntry.name, 'package.json'));
    if (!packageJsonFile.exists()) continue;

    const packageJson = await packageJsonFile.json().catch(() => null);
    if (!packageJson) continue;

    if (!packageJson.contributes?.languages && !packageJson.contributes?.grammars) {
      continue;
    }

    await cp(join(tmpDir, 'extensions', dirEntry.name), join(extensionsDir, dirEntry.name), {
      recursive: true,
    });
  }
} catch (error) {
  console.error('An error occurred:', error);
}

process.stdout.write('Cleaning up temporary directory...');
await rm(tmpDir, { recursive: true, force: true });
process.stdout.write(' Done.\nCopying extra languages...');

const extraLanguagesDir = join(extensionsDir, '../extra-basic-languages');

await readdir(extraLanguagesDir)
  .then((extras) =>
    extras.map((f) => cp(join(extraLanguagesDir, f), join(extensionsDir, f), { recursive: true }))
  )
  .then((promises) => Promise.all(promises));

process.stdout.write(' Done.\nGenerating web manifest...');
await import('./generate-webmanifest.ts');
process.stdout.write(' Done.\n\n');

console.log(
  `\x1b[1;32mLanguage download completed in ${((performance.now() - perf) / 1000).toFixed(2)}s\x1b[0m`
);
