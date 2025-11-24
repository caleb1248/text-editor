// @ts-ignore
import { StandaloneServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js';
// @ts-ignore
import { IStandaloneThemeService } from 'monaco-editor/esm/vs/editor/standalone/common/standaloneTheme';
// @ts-ignore
import * as builtInThemes from 'monaco-editor/esm/vs/editor/standalone/common/themes';
import { ColorScheme, getDefaultColors } from './default-colors';

const themeService = StandaloneServices.get(IStandaloneThemeService);

const styleSheet = document.getElementById('dynamic-theme-colors') as HTMLStyleElement;

function registerThemeColors(theme: any) {
  const mergedColors = {
    ...getDefaultColors(theme.type as ColorScheme),
    ...theme.themeData.colors,
  };
  let styleSheetContent = ':root {';

  for (const colorId in mergedColors) {
    styleSheetContent += `--color-${colorId.replace(/\./g, '-')}: ${mergedColors[
      colorId
    ].toString()};`;
  }

  styleSheetContent += '}';
  styleSheet.innerHTML = styleSheetContent;
}

registerThemeColors(themeService.getColorTheme());
themeService.onDidColorThemeChange(registerThemeColors);
