import { registerContributions } from '../register';
import languageConfiguration from './language-configuration';

registerContributions({
  languages: [
    {
      id: 'html',
      extensions: [
        '.html',
        '.htm',
        '.shtml',
        '.xhtml',
        '.xht',
        '.mdoc',
        '.jsp',
        '.asp',
        '.aspx',
        '.jshtm',
        '.volt',
        '.ejs',
        '.rhtml',
      ],
      aliases: ['HTML', 'htm', 'html', 'xhtml'],
      mimetypes: [
        'text/html',
        'text/x-jshtm',
        'text/template',
        'text/ng-template',
        'application/xhtml+xml',
      ],
      configuration: languageConfiguration,
    },
  ],
  grammars: [
    {
      scopeName: 'text.html.basic',
      path: new URL('./syntaxes/html.tmLanguage.json', import.meta.url).href,
      embeddedLanguages: {
        'text.html': 'html',
        'source.css': 'css',
        'source.js': 'javascript',
        'source.python': 'python',
        'source.smarty': 'smarty',
      },
      tokenTypes: {
        'meta.tag string.quoted': 'other',
      },
    },
    {
      language: 'html',
      scopeName: 'text.html.derivative',
      path: new URL('./syntaxes/html-derivative.tmLanguage.json', import.meta.url).href,
      embeddedLanguages: {
        'text.html': 'html',
        'source.css': 'css',
        'source.js': 'javascript',
        'source.python': 'python',
        'source.smarty': 'smarty',
      },
      tokenTypes: {
        'meta.tag string.quoted': 'other',
      },
    },
  ],
  snippets: [
    {
      language: 'html',
      path: './snippets/html.code-snippets',
    },
  ],
});
