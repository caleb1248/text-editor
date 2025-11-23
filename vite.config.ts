import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { defineConfig } from 'vite';
import { parse } from 'jsonc-parser';

export default defineConfig({
  plugins: [
    {
      name: 'extension-manifest',
      resolveId(source, importer, options) {
        if (source.endsWith('?manifest')) {
          return this.resolve(source.slice(0, -9), importer, options);
        }
      },
      load: {
        filter: {
          id: /.json$/,
        },
        async handler(id) {
          const content = await readFile(id, 'utf-8');
          return JSON.stringify(parse(content, [], { allowTrailingComma: true }));
        },
      },
      transform: {
        filter: {
          id: /.json\?manifest$/,
        },
        async handler(_code, id) {
          const perf = performance.now();
          const filePath = id.slice(0, -9); // Remove '?manifest' suffix
          const code = await readFile(filePath, 'utf-8');
          const contributes = JSON.parse(code).contributes!;

          if (!contributes) {
            this.error(`No contributes field found in manifest: ${filePath}`);
          }

          if (contributes.languages) {
            for (const language of contributes.languages) {
              if (language.configuration) {
                language.configuration = parse(
                  await readFile(join(dirname(filePath), language.configuration), 'utf-8'),
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
                const asset = `new URL(${JSON.stringify(grammar.path)}, import.meta.url).href`;
                assetMap.set(grammar.path, asset);
              }
            }
          }

          // inject asset references

          const result = `
import {registerContributions} from '../register';
const contributes = ${JSON.stringify(contributes)};
const assetMap = new Map();
${[...assetMap.entries()]
  .map(([key, value]) => `assetMap.set(${JSON.stringify(key)}, ${value});`)
  .join('\n')}
for(const grammar of contributes.grammars || []) {
  if(grammar.path&&assetMap.has(grammar.path)){
    grammar.path=assetMap.get(grammar.path);
  }
};

assetMap.clear();
registerContributions(contributes);
`;
          console.log(`[manifest] Processed ${id} in ${(performance.now() - perf).toFixed(2)} ms`);
          return result;
        },
      },
    },
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
});
