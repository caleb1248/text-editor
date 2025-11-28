import './style.css';
import './language-support/main';
import * as monaco from 'monaco-editor-core';
import { emmetCSS, emmetHTML, emmetJSX } from 'emmet-monaco-es';
import { tabs, Tab, activeTab } from './ui/tabs';
import './workers';
// monaco
import './theme-support/tm-theme-support';
import './theme-support/theming';
// textmate integration
import { registerHandlers } from './files';
const mainEl = document.getElementById('main')!;
mainEl.style.display = 'none';

const welcomeEl = document.getElementById('welcome')!;
welcomeEl.style.display = 'block';

const theme = matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark-plus'
  : 'light-plus';
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

window.addEventListener('resize', () => {
  editor.layout();
});
editor.onDidChangeModel((e) => {
  const newUri = e.newModelUrl;
  if (!newUri) {
    mainEl.style.display = 'none';
    welcomeEl.parentElement!.insertBefore(mainEl, welcomeEl);
    welcomeEl.style.display = 'block';
    return;
  }

  mainEl.style.display = 'block';
  welcomeEl.style.display = 'none';
  mainEl.parentElement!.insertBefore(welcomeEl, mainEl);

  let found = false;

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].model.uri.toString() === newUri.toString()) {
      activeTab.current = i;
      found = true;
      break;
    }
  }

  if (!found) {
    const model = monaco.editor.getModel(newUri);
    if (model) {
      const newTab = new Tab(editor, model);
      const targetIndex = (activeTab.current ?? -1) + 1;
      newTab.insert(targetIndex);
      activeTab.current = targetIndex;
    }
  }

  editor.layout();
});

// monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
// monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
//   diagnosticCodesToIgnore: [2307, 2792],
// });

// monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
//   target: monaco.languages.typescript.ScriptTarget.ESNext,
// });

// monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
//   allowComments: true,
//   validate: true,
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
