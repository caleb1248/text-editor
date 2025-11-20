import { registerContributions } from '../register';
import javascriptLanguageConfiguration from './javascript-language-configuration';
import tagsLanguageConfiguration from './tags-language-configuration';

registerContributions({
  // configurationDefaults: {
  //   '[javascript]': {
  //     'editor.maxTokenizationLineLength': 2500,
  //   },
  // },
  languages: [
    {
      id: 'javascriptreact',
      aliases: ['JavaScript JSX', 'JavaScript React', 'jsx'],
      extensions: ['.jsx'],
      configuration: javascriptLanguageConfiguration,
    },
    {
      id: 'javascript',
      aliases: ['JavaScript', 'javascript', 'js'],
      extensions: ['.js', '.es6', '.mjs', '.cjs', '.pac'],
      filenames: ['jakefile'],
      firstLine: '^#!.*\\bnode',
      mimetypes: ['text/javascript'],
      configuration: javascriptLanguageConfiguration,
    },
    {
      id: 'jsx-tags',
      aliases: [],
      configuration: tagsLanguageConfiguration,
    },
  ],
  grammars: [
    {
      language: 'javascriptreact',
      scopeName: 'source.js.jsx',
      path: new URL('./syntaxes/JavaScriptReact.tmLanguage.json', import.meta.url).href,
      embeddedLanguages: {
        'meta.tag.js': 'jsx-tags',
        'meta.tag.without-attributes.js': 'jsx-tags',
        'meta.tag.attributes.js.jsx': 'javascriptreact',
        'meta.embedded.expression.js': 'javascriptreact',
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
      language: 'javascript',
      scopeName: 'source.js',
      path: new URL('./syntaxes/JavaScript.tmLanguage.json', import.meta.url).href,
      embeddedLanguages: {
        'meta.tag.js': 'jsx-tags',
        'meta.tag.without-attributes.js': 'jsx-tags',
        'meta.tag.attributes.js': 'javascript',
        'meta.embedded.expression.js': 'javascript',
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
      scopeName: 'source.js.regexp',
      path: new URL('./syntaxes/Regular Expressions (JavaScript).tmLanguage', import.meta.url).href,
    },
  ],
  snippets: [
    {
      language: 'javascript',
      path: './snippets/javascript.code-snippets',
    },
    {
      language: 'javascriptreact',
      path: './snippets/javascript.code-snippets',
    },
  ],
});
