import { convertTheme } from './theme-converter';
import darkPlus from './themes/dark-plus.json';
import lightPlus from './themes/light-plus.json';
import vsDark from './themes/vs-dark.json';
import vsLight from './themes/vs-light.json';
import hcBlack from './themes/hc-black.json';
import hcLight from './themes/hc-light.json';
import { editor } from 'monaco-editor-core';
import { getSettings } from '@/settings-persistence';

editor.defineTheme('dark-plus', convertTheme(darkPlus));
editor.defineTheme('light-plus', convertTheme(lightPlus));
editor.defineTheme('vs-dark', convertTheme(vsDark));
editor.defineTheme('vs-light', convertTheme(vsLight));
editor.defineTheme('hc-black', convertTheme(hcBlack));
editor.defineTheme('hc-light', convertTheme(hcLight));

export const themeIdToNameMap = new Map(
  Object.entries({
    'dark-plus': 'Default Dark',
    'light-plus': 'Default Light',
    'vs-dark': 'Dark (Visual Studio)',
    'vs-light': 'Light (Visual Studio)',
    'hc-black': 'High Contrast Dark',
    'hc-light': 'High Contrast Light',
  })
);

for (const userTheme of getSettings().userThemes.themes) {
  editor.defineTheme(userTheme.id, userTheme.data);
  themeIdToNameMap.set(userTheme.id, userTheme.name);
}
