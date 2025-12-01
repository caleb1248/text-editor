import './style.css';
import { tabs, Tab, activeTab } from './ui/tabs';
import './ui/menubar-icon';

// monaco
import './workers';
import * as monaco from 'monaco-editor-core';
import { emmetCSS, emmetHTML, emmetJSX } from 'emmet-monaco-core-es';

// Theme support
import './theme-support/tm-theme-support';
import './theme-support/theming';

// Language support
import './language-support/main';
import {
  ScriptTarget,
  typescriptDefaults,
} from './language-support/language-features/typescript/monaco.contribution';

// File support
import { registerHandlers } from './files';

const mainEl = document.getElementById('main')!;
mainEl.style.display = 'none';

const welcomeEl = document.getElementById('welcome')!;
welcomeEl.style.display = 'block';

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

typescriptDefaults.setEagerModelSync(true);
typescriptDefaults.setDiagnosticsOptions({
  diagnosticCodesToIgnore: [2307, 2792],
});

typescriptDefaults.setCompilerOptions({
  target: ScriptTarget.ESNext,
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

let emmetJSXInitialized = false;
monaco.languages.onLanguageEncountered('javascriptreact', () => {
  if (!emmetJSXInitialized) {
    emmetJSX(monaco, ['javascriptreact', 'typescriptreact']);
    emmetJSXInitialized = true;
  }
});

monaco.languages.onLanguageEncountered('typescriptreact', () => {
  if (!emmetJSXInitialized) {
    emmetJSX(monaco, ['javascriptreact', 'typescriptreact']);
    emmetJSXInitialized = true;
  }
});
