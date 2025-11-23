import * as vsctm from 'vscode-textmate';
import { loadWASM, OnigScanner, OnigString } from 'vscode-oniguruma';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import wasmURL from 'vscode-oniguruma/release/onig.wasm?url';
// @ts-ignore
import { StandaloneServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js';
// @ts-ignore
import { IStandaloneThemeService } from 'monaco-editor/esm/vs/editor/standalone/common/standaloneTheme';
// @ts-ignore
import * as builtInThemes from 'monaco-editor/esm/vs/editor/standalone/common/themes';
import { TMToMonacoToken, type IColorTheme } from './tm-to-monaco-token';

const themeService = StandaloneServices.get(IStandaloneThemeService);

const wasmPromise = fetch(wasmURL)
  .then((response) => response.arrayBuffer())
  .then((buffer) => loadWASM({ data: buffer }))
  .catch((error) => console.error('Failed to load `onig.wasm`:', error));

const scopeUrlMap: Record<string, string> = {};
const injectionMap: Record<string, string[]> = {};

const registry = new vsctm.Registry({
  onigLib: wasmPromise.then(() => {
    return {
      createOnigScanner: (sources) => new OnigScanner(sources),
      createOnigString: (str) => new OnigString(str),
    };
  }),

  loadGrammar(scopeName) {
    console.log('loadGrammar', scopeName);
    function fetchGrammar(path: string) {
      return fetch(path).then((response) => response.text());
    }

    const url = scopeUrlMap[scopeName];
    if (url) {
      return fetchGrammar(url).then((grammar) => JSON.parse(grammar));
    }

    return Promise.reject(new Error(`No grammar found for scope: ${scopeName}`));
  },
  getInjections(scopeName) {
    const scopeParts = scopeName.split('.');
    let injections: string[] = [];

    for (let i = 1; i <= scopeParts.length; i++) {
      const subScopeName = scopeParts.slice(0, i).join('.');
      injections.push(...(injectionMap[subScopeName] || []));
    }

    return injections;
  },
});

let currentTheme!: IColorTheme;

function updateTheme(theme: any) {
  let convertedTheme = {
    settings: (theme.themeData as monaco.editor.IStandaloneThemeData).rules.map((rule) => ({
      scope: rule.token,
      settings: {
        foreground: rule.foreground,
        background: rule.background,
        fontStyle: rule.fontStyle,
      },
    })),
  };

  convertedTheme.settings.unshift({
    scope: '',
    settings: {
      background: theme.getColor('editor.background').toString(),
      foreground: theme.getColor('editor.foreground').toString(),
      fontStyle: undefined,
    },
  });

  registry.setTheme(convertedTheme);
  const themeData = theme.themeData as monaco.editor.IStandaloneThemeData;
  const rules = themeData.rules;
  if (themeData.inherit) {
    switch (themeData.base) {
      case 'vs-dark':
        rules.push(...builtInThemes.vs_dark.rules);
        break;

      case 'vs':
        rules.push(...builtInThemes.vs.rules);
        break;
      case 'hc-black':
        rules.push(...builtInThemes.hc_black.rules);
        break;
      case 'hc-light':
        rules.push(...builtInThemes.hc_light.rules);
        break;
    }
  }

  currentTheme = {
    tokenColors: rules.map((rule) => ({
      scope: rule.token,
      settings: {
        foreground: rule.foreground,
        background: rule.background,
        fontStyle: rule.fontStyle,
      },
    })),
  };
}

updateTheme(themeService.getColorTheme());

themeService.onDidColorThemeChange((theme: any) => {
  updateTheme(theme);
});

type TokensProvider = monaco.languages.TokensProvider | monaco.languages.EncodedTokensProvider;

async function createTokensProvider(
  scopeName: string,
  languageId?: number,
  config?: vsctm.IGrammarConfiguration
): Promise<TokensProvider> {
  const grammar =
    languageId && config
      ? await registry.loadGrammarWithConfiguration(scopeName, languageId, config)
      : await registry.loadGrammar(scopeName);

  if (!grammar) {
    throw new Error('Failed to load grammar');
  }

  const result: TokensProvider = {
    getInitialState() {
      return vsctm.INITIAL;
    },

    tokenize(line, state: vsctm.StateStack) {
      let result = grammar.tokenizeLine(line, state);
      return {
        endState: result.ruleStack,
        tokens: result.tokens.map((token) => {
          return {
            startIndex: token.startIndex,
            scopes: TMToMonacoToken(currentTheme, token.scopes),
          };
        }),
      };
    },
    tokenizeEncoded(line, state: vsctm.StateStack) {
      let result = grammar.tokenizeLine2(line, state);
      return {
        endState: result.ruleStack,
        tokens: new Uint32Array(result.tokens),
      };
    },
  };

  return result;
}

class TokensProviderCache {
  private cache: Record<string, TokensProvider> = {};

  async getTokensProvider(
    scopeName: string,
    languageId?: number,
    config?: vsctm.IGrammarConfiguration
  ): Promise<TokensProvider> {
    if (!this.cache[scopeName]) {
      this.cache[scopeName] = await createTokensProvider(scopeName, languageId, config);
      console.log('created tokens provider for', scopeName);
    }

    return this.cache[scopeName];
  }
}

export { TokensProviderCache, scopeUrlMap, injectionMap };
