import type { ILanguageConfiguration } from '../convert-language-configuration';

export default {
  comments: {
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string', 'comment'] },
    { open: '[', close: ']', notIn: ['string', 'comment'] },
    { open: '(', close: ')', notIn: ['string', 'comment'] },
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
  ],
  surroundingPairs: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['"', '"'],
    ["'", "'"],
  ],
  folding: {
    markers: {
      start: '^\\s*\\/\\*\\s*#region\\b\\s*(.*?)\\s*\\*\\/',
      end: '^\\s*\\/\\*\\s*#endregion\\b.*\\*\\/',
    },
  },
  indentationRules: {
    increaseIndentPattern: '(^.*\\{[^}]*$)',
    decreaseIndentPattern: '^\\s*\\}',
  },
  wordPattern: '(#?-?\\d*\\.\\d\\w*%?)|(::?[\\w-]*(?=[^,{;]*[,{]))|(([@#.!])?[\\w-?]+%?|[@#!.])',
} as ILanguageConfiguration;
