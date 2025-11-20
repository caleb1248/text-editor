import { registerContributions } from '../register';
import languageConfiguration from './language-configuration';

registerContributions({
  languages: [
    {
      id: 'typescript',
      aliases: ['TypeScript', 'ts', 'typescript'],
      extensions: ['.ts', '.cts', '.mts'],
      configuration: languageConfiguration,
    },
    {
      id: 'typescriptreact',
      aliases: ['TypeScript JSX', 'TypeScript React', 'tsx'],
      extensions: ['.tsx'],
      configuration: languageConfiguration,
    },
    {
      id: 'jsonc',
      filenames: ['tsconfig.json', 'jsconfig.json'],
      filenamePatterns: [
        'tsconfig.*.json',
        'jsconfig.*.json',
        'tsconfig-*.json',
        'jsconfig-*.json',
      ],
    },
    {
      id: 'json',
      extensions: ['.tsbuildinfo'],
    },
  ],
  grammars: [
    {
      language: 'typescript',
      scopeName: 'source.ts',
      path: new URL('./syntaxes/TypeScript.tmLanguage.json', import.meta.url).href,
      unbalancedBracketScopes: [
        'keyword.operator.relational',
        'storage.type.function.arrow',
        'keyword.operator.bitwise.shift',
        'meta.brace.angle',
        'punctuation.definition.tag',
        'keyword.operator.assignment.compound.bitwise.ts',
      ],
      tokenTypes: {
        'punctuation.definition.template-expression': 'other',
        'entity.name.type.instance.jsdoc': 'other',
        'entity.name.function.tagged-template': 'other',
        'meta.import string.quoted': 'other',
        'variable.other.jsdoc': 'other',
      },
    },
    {
      language: 'typescriptreact',
      scopeName: 'source.tsx',
      path: new URL('./syntaxes/TypeScriptReact.tmLanguage.json', import.meta.url).href,
      unbalancedBracketScopes: [
        'keyword.operator.relational',
        'storage.type.function.arrow',
        'keyword.operator.bitwise.shift',
        'punctuation.definition.tag',
        'keyword.operator.assignment.compound.bitwise.ts',
      ],
      embeddedLanguages: {
        'meta.tag.tsx': 'jsx-tags',
        'meta.tag.without-attributes.tsx': 'jsx-tags',
        'meta.tag.attributes.tsx': 'typescriptreact',
        'meta.embedded.expression.tsx': 'typescriptreact',
      },
      tokenTypes: {
        'punctuation.definition.template-expression': 'other',
        'entity.name.type.instance.jsdoc': 'other',
        'entity.name.function.tagged-template': 'other',
        'meta.import string.quoted': 'other',
        'variable.other.jsdoc': 'other',
      },
    },
    {
      scopeName: 'documentation.injection.ts',
      path: new URL('./syntaxes/jsdoc.ts.injection.tmLanguage.json', import.meta.url).href,
      injectTo: ['source.ts', 'source.tsx'],
    },
    {
      scopeName: 'documentation.injection.js.jsx',
      path: new URL('./syntaxes/jsdoc.js.injection.tmLanguage.json', import.meta.url).href,
      injectTo: ['source.js', 'source.js.jsx'],
    },
  ],
});
