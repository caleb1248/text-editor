import * as monaco from 'monaco-editor-core';
import { injectionMap, scopeUrlMap } from '../../textmate';
import { TokensProviderCache } from '../../textmate';
import {
  convertLanguageConfiguration,
  type ILanguageConfiguration,
} from './convert-language-configuration';
const cache = new TokensProviderCache();

export interface Contributions {
  languages: LanguageOptions[];
  grammars?: GrammarDefinition[];
  snippets?: any;
}

export interface GrammarDefinition {
  language?: string;
  scopeName: string;
  path: string;
  embeddedLanguages?: { [scopeName: string]: string };
  tokenTypes?: { [scopeName: string]: string };
  injectTo?: string[];
  balancedBracketScopes?: string[];
  unbalancedBracketScopes?: string[];
}

export interface LanguageOptions {
  id: string;
  extensions?: string[];
  filenames?: string[];
  filenamePatterns?: string[];
  firstLine?: string;
  aliases?: string[];
  mimetypes?: string[];
  // URL pointing to the language configuration JSON
  configuration?: string;
}

function registerTmGrammar(definition: GrammarDefinition): void {
  const { language, scopeName, path } = definition;

  scopeUrlMap[scopeName] = path;

  if (definition.injectTo) {
    for (const injectScope of definition.injectTo) {
      let injections = injectionMap[injectScope];
      if (!injections) {
        injections = [];
        injectionMap[injectScope] = injections;
      }
      injections.push(scopeName);
    }
  }

  const embeddedLanguages = Object.create(null);

  if (definition.embeddedLanguages) {
    for (const scope of Object.keys(definition.embeddedLanguages)) {
      const lang = definition.embeddedLanguages[scope];
      const langId = monaco.languages.getEncodedLanguageId(lang);
      if (langId) {
        embeddedLanguages[scope] = langId;
      }
    }
  }

  const tokenTypes = Object.create(null);

  if (definition.tokenTypes) {
    for (const scope of Object.keys(definition.tokenTypes)) {
      const tokenType = definition.tokenTypes[scope];
      switch (tokenType) {
        case 'string':
          tokenTypes[scope] = 2; // StandardTokenType.String;
          break;
        case 'other':
          tokenTypes[scope] = 0; // StandardTokenType.Other;
          break;
        case 'comment':
          tokenTypes[scope] = 1; // StandardTokenType.Comment;
          break;
      }
    }
  }

  if (language) {
    monaco.languages.registerTokensProviderFactory(language, {
      create() {
        return cache.getTokensProvider(scopeName, monaco.languages.getEncodedLanguageId(language), {
          embeddedLanguages,
          tokenTypes,
          balancedBracketSelectors: [
            ...(Array.isArray(definition.balancedBracketScopes)
              ? definition.balancedBracketScopes
              : []),
            '*',
          ],
          unbalancedBracketSelectors: definition.unbalancedBracketScopes,
        });
      },
    });
  }
}

export function registerContributions(contributions: Contributions) {
  for (const language of contributions.languages) {
    const { configuration: configurationURL, ...extensionPoint } = language;

    monaco.languages.register(extensionPoint);

    if (configurationURL) {
      monaco.languages.onLanguageEncountered(language.id, async () => {
        const configurationJSON = await fetch(configurationURL).then((r) => r.json());
        monaco.languages.setLanguageConfiguration(
          language.id,
          convertLanguageConfiguration(configurationJSON)
        );
      });
    }
  }

  if (contributions.grammars) {
    for (const grammar of contributions.grammars) {
      registerTmGrammar(grammar);
    }
  }
}
