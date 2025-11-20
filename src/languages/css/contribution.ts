import { registerContributions } from '../register';
import languageConfiguration from './language-configuration';

registerContributions({
  languages: [
    {
      id: 'css',
      aliases: ['CSS', 'css'],
      extensions: ['.css'],
      mimetypes: ['text/css'],
      configuration: languageConfiguration,
    },
  ],
  grammars: [
    {
      language: 'css',
      scopeName: 'source.css',
      path: new URL('./syntaxes/css.tmLanguage.json', import.meta.url).href,
      tokenTypes: {
        'meta.function.url string.quoted': 'other',
      },
    },
  ],
});
