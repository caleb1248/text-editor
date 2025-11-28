import { join } from 'path';
import { rm, mkdir, exists } from 'fs/promises';
const languageFeatureBasePath = join(
  __dirname,
  '../src/language-support/language-features'
);

const outDir = join(__dirname, '../public/workers');

if (await exists(outDir)) await rm(outDir, { recursive: true });
await mkdir(outDir, { recursive: true });

const workerEntryPoints = [
  'typescript/ts.worker.ts',
  'json/json.worker.ts',
  'css/css.worker.ts',
  'html/html.worker.ts',
  '../../editor.worker.ts',
];

for (const entryPoint of workerEntryPoints) {
  const perf = performance.now();
  await Bun.build({
    entrypoints: [join(languageFeatureBasePath, entryPoint)],
    outdir: outDir,
    minify: true,
    format: 'iife',
  });
  console.log(
    `Compiled ${entryPoint} in ${(performance.now() - perf).toFixed(2)}ms`
  );
}
