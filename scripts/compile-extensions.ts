import { rm, readdir, mkdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { parse } from 'jsonc-parser';
import { existsSync } from 'node:fs';

const overallPerf = performance.now();

const srcPath = join(__dirname, '../src/language-support/basic-languages');

const outDir = join(__dirname, '../src/language-support/basic-languages-out');

// Clear the output directory
if (existsSync(outDir)) await rm(outDir, { recursive: true });
await mkdir(outDir, { recursive: true });

const extensions = await readdir(srcPath);

for (const extension of extensions) {
  const perf = performance.now();
  const packagePath = join(srcPath, extension, 'package.json');

  const code = await readFile(packagePath, 'utf-8');
  const contributes = JSON.parse(code).contributes!;

  if (!contributes) {
    throw new Error(`No contributes field found in manifest: ${packagePath}`);
  }

  if (contributes.languages) {
    for (const language of contributes.languages) {
      if (language.configuration) {
        language.configuration = parse(
          await readFile(
            join(dirname(packagePath), language.configuration),
            'utf-8'
          ),
          [],
          { allowTrailingComma: true }
        );
      }
    }
  }

  // collect grammar asset paths
  const assetMap = new Map<string, string>();
  if (contributes.grammars) {
    for (const grammar of contributes.grammars) {
      if (grammar.path && !assetMap.has(grammar.path)) {
        const asset = `new URL(${JSON.stringify(
          grammar.path
        )}, import.meta.url).href`;
        assetMap.set(grammar.path, asset);
      }
    }
  }

  // inject asset references

  const result = `
import { registerContributions } from '../../register';
const contributes = ${JSON.stringify(contributes)};
const assetMap = new Map();
${[...assetMap.entries()]
  .map(([key, value]) => `assetMap.set(${JSON.stringify(key)}, ${value});`)
  .join('\n')}
for(const grammar of contributes.grammars || []) {
  if(grammar.path&&assetMap.has(grammar.path)){
    grammar.path=assetMap.get(grammar.path);
  }
}
assetMap.clear();
registerContributions(contributes);
`;

  const extensionFolder = join(outDir, extension);
  await mkdir(extensionFolder, { recursive: true });
  await Bun.write(join(extensionFolder, 'manifest.js'), result);

  // Copy referenced assets
  for (const [assetPath] of assetMap) {
    const srcPath = join(dirname(packagePath), assetPath);
    const destPath = join(extensionFolder, assetPath);
    const destDir = dirname(destPath);
    await mkdir(destDir, { recursive: true });
    await Bun.write(destPath, Bun.file(srcPath));
  }

  console.log(
    `Processed ${extension} in ${(performance.now() - perf).toFixed(2)} ms`
  );
}

console.log(
  `\nAll extensions compiled in ${(performance.now() - overallPerf).toFixed(
    2
  )}ms`
);
