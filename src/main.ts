import './style.css';
import 'monaco-editor/esm/vs/editor/edcore.main';
import './languages/main';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { emmetCSS, emmetHTML, emmetJSX } from 'emmet-monaco-es';

import './workers';
// monaco
import './textmate/themes/tm-theme-support';
// textmate integration
import { registerHandlers } from './files';

const theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-plus' : 'light-plus';
const editor = monaco.editor.create(document.getElementById('editor')!, {
  theme,
});
window.addEventListener('resize', () => editor.layout());
editor.layout();

// monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
// monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
//   diagnosticCodesToIgnore: [2307, 2792],
// });

// monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
//   target: monaco.languages.typescript.ScriptTarget.ESNext,
// });

declare global {
  var editor: monaco.editor.IStandaloneCodeEditor;
}

globalThis.editor = editor;

registerHandlers(editor);
monaco.languages.onLanguageEncountered('html', () => {
  emmetHTML(monaco);
});
monaco.languages.onLanguageEncountered('css', () => {
  emmetCSS(monaco);
});
monaco.languages.onLanguageEncountered('javascript', () => {
  emmetJSX(monaco);
});
