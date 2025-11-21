import './style.css';
import 'monaco-editor/esm/vs/editor/edcore.main';
import './languages/main';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { emmetCSS, emmetHTML, emmetJSX } from 'emmet-monaco-es';
import { tabs, Tab } from './tabs';
import './workers';
// monaco
import './textmate/themes/tm-theme-support';
// textmate integration
import { registerHandlers } from './files';

const mainEl = document.getElementById('main')!;
mainEl.style.display = 'none';

const theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-plus' : 'light-plus';
const editor = monaco.editor.create(document.getElementById('editor')!, {
  theme,
});

monaco.editor.registerEditorOpener({
  openCodeEditor: (editor, resource) => {
    const model = monaco.editor.getModel(resource);
    if (model) {
      editor.setModel(model);
    }
    return true;
  },
});

window.addEventListener('resize', () => editor.layout());
editor.onDidChangeModel((e) => {
  const newUri = e.newModelUrl;
  if (!newUri) {
    document.getElementById('main')!.style.display = 'none';
    return;
  }

  mainEl.style.display = 'block';

  let found = false;

  for (const tab of tabs) {
    if (tab.setActive(tab.model.uri.toString() === newUri.toString())) {
      found = true;
    }
  }

  if (!found) {
    const model = monaco.editor.getModel(newUri);
    if (model) {
      const newTab = new Tab(editor, model, newUri.path.split('/').pop() || 'untitled');
      newTab.insert(tabs.length);
      newTab.setActive(true);
    }
  }
  editor.layout();
});

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  diagnosticCodesToIgnore: [2307, 2792],
});

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ESNext,
});

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
