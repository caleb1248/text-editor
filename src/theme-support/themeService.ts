// @ts-ignore
import { StandaloneServices } from 'monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices.js';
// @ts-ignore
import { IStandaloneThemeService } from 'monaco-editor-core/esm/vs/editor/standalone/common/standaloneTheme';
// @ts-ignore

export const themeService = StandaloneServices.get(IStandaloneThemeService);
