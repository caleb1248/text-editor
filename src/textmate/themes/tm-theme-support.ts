import { convertTheme } from './theme-converter';
import darkPlus from './dark-plus.json';
import lightPlus from './light-plus.json';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

editor.defineTheme('dark-plus', convertTheme(darkPlus));
editor.defineTheme('light-plus', convertTheme(lightPlus));
