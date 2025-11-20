import { registerContributions } from '../register';
import languageConfiguration from './language-configuration';

registerContributions({
  languages: [
    {
      id: 'python',
      extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi', '.pyi', '.ipy', '.pyt'],
      aliases: ['Python', 'py'],
      filenames: ['SConstruct', 'SConscript'],
      firstLine: '^#!\\s*/?.*\\bpython[0-9.-]*\\b',
      configuration: languageConfiguration,
    },
  ],
  grammars: [
    {
      language: 'python',
      scopeName: 'source.python',
      path: new URL('./syntaxes/MagicPython.tmLanguage.json', import.meta.url).toString(),
    },
    {
      scopeName: 'source.regexp.python',
      path: new URL('./syntaxes/MagicRegExp.tmLanguage.json', import.meta.url).toString(),
    },
  ],
  // configurationDefaults: {
  //   '[python]': {
  //     'diffEditor.ignoreTrimWhitespace': false,
  //     'editor.defaultColorDecorators': 'never',
  //   },
  // },
});
