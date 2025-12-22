import degit from 'degit';
import { join } from 'node:path';
import { cp, mkdtemp, rm, readdir, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const tmpDir = await mkdtemp(join(tmpdir(), 'vscode-install'));
console.log(`Cloning vscode to temporary directory: ${tmpDir}`);

await Bun.$`git clone --depth 1 https://github.com/microsoft/vscode.git ${tmpDir}`;
const extensionsDir = join(import.meta.dir, '../src/language-support/basic-languages');
await rm(extensionsDir, { recursive: true, force: true });
await mkdir(extensionsDir, { recursive: true });
console.log('Copying language extensions...');

try {
  for (const dirEntry of await readdir(join(tmpDir, 'extensions'), { withFileTypes: true })) {
    if (dirEntry.isFile()) continue;
    if (dirEntry.name.endsWith('-language-features')) continue;

    const packageJsonFile = Bun.file(join(tmpDir, 'extensions', dirEntry.name, 'package.json'));
    if (!packageJsonFile.exists()) continue;

    const packageJson = await packageJsonFile.json().catch(() => null);
    if (!packageJson) continue;

    if (!packageJson.contributes?.languages && !packageJson.contributes?.grammars) {
      // console.log(`${dirEntry.name} does not contribute languages or grammars, skipping.`);
      continue;
    }

    await cp(join(tmpDir, 'extensions', dirEntry.name), join(extensionsDir, dirEntry.name), {
      recursive: true,
    });
  }
} catch (error) {
  console.error('An error occurred:', error);
}

console.log('Cleaning up...');

await rm(tmpDir, { recursive: true, force: true });
