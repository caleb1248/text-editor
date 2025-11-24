import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { clickTarget, keyboardTarget, registerEvent } from './events';
import { tabs, Tab, activeTab } from './tabs';

const uriToFileMap = new Map<string, FileSystemFileHandle>();

let fileIdCounter = 0;
let untitledCounter = 1;

async function newFile(editor: monaco.editor.IStandaloneCodeEditor) {
  const model = monaco.editor.createModel(
    '',
    'plaintext',
    monaco.Uri.parse(`file:///file-${fileIdCounter++}-untitled.txt`)
  );
  const newTab = new Tab(editor, model);
  newTab.displayName = `Untitled-${untitledCounter++}`;
  newTab.insert(activeTab.current !== null ? activeTab.current + 1 : 0);
  editor.setModel(model);
  return model;
}

async function openFile(editor: monaco.editor.IStandaloneCodeEditor) {
  const [fileHandle] = await window.showOpenFilePicker();

  for (const tab of tabs) {
    const isSameEntry = await tab.handle?.isSameEntry(fileHandle);
    editor.setModel(tab.model);
    if (isSameEntry) return;
  }

  const file = await fileHandle.getFile();
  const text = await file.text();

  const model = monaco.editor.createModel(
    text,
    getLanguageFromExtension(fileHandle.name),
    monaco.Uri.parse(`file:///file-${fileIdCounter++}-${fileHandle.name}`)
  );

  uriToFileMap.set(model.uri.toString(), fileHandle);
  const newTab = new Tab(editor, model, fileHandle);
  newTab.insert(activeTab.current !== null ? activeTab.current + 1 : 0);
  editor.setModel(model);
  return model;
}

async function saveFile(editor: monaco.editor.IStandaloneCodeEditor) {
  const model = editor.getModel();
  if (!model) {
    return;
  }

  const fileHandle = uriToFileMap.get(model.uri.toString());
  if (!fileHandle) {
    saveFileAs(editor);
    return;
  }

  const writable = await fileHandle.createWritable();
  await writable.write(model.getValue());
  await writable.close();
}

async function saveFileAs(editor: monaco.editor.IStandaloneCodeEditor) {
  const model = editor.getModel();

  if (!model) {
    return;
  }

  const options: SaveFilePickerOptions = {
    suggestedName:
      tabs.find((tab) => tab.model === model)?.displayName ||
      model.uri.path.split('/').pop() ||
      'untitled',
  };

  const fileHandle = await window.showSaveFilePicker(options);
  const writable = await fileHandle.createWritable();
  await writable.write(model.getValue());
  await writable.close();

  const correspondingTab = tabs.findIndex((tab) => tab.model === model);
  if (correspondingTab === -1) return;

  tabs[correspondingTab].handle = fileHandle;
  tabs[correspondingTab].displayName = fileHandle.name;
  uriToFileMap.set(model.uri.toString(), fileHandle);
}

export function registerHandlers(editor: monaco.editor.IStandaloneCodeEditor) {
  registerEvent(newFile.bind(null, editor), [
    keyboardTarget('n', { ctrl: true }),
    clickTarget('files.new'),
  ]);
  registerEvent(openFile.bind(null, editor), [
    keyboardTarget('o', { ctrl: true }),
    clickTarget('files.open'),
  ]);

  registerEvent(saveFile.bind(null, editor), [
    keyboardTarget('s', { ctrl: true }),
    clickTarget('files.save'),
  ]);

  registerEvent(saveFileAs.bind(null, editor), [clickTarget('files.saveAs')]);
}

function getLanguageFromExtension(path: string): string {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1) {
    return 'plaintext';
  }
  const extension = path.slice(lastDot);
  for (const lang of monaco.languages.getLanguages()) {
    if (lang.extensions && lang.extensions.includes(extension)) {
      return lang.id;
    }
  }
  return 'plaintext';
}
