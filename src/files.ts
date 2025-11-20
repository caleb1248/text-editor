import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { clickTarget, keyboardTarget, registerEvent } from './events';

const fileToModelMap = new Map<FileSystemFileHandle, { displayName: string; uri: monaco.Uri }>();
const uriToFileMap = new Map<string, FileSystemFileHandle>();

let fileIdCounter = 0;

async function openFile(editor: monaco.editor.IStandaloneCodeEditor) {
  const [fileHandle] = await window.showOpenFilePicker();

  const file = await fileHandle.getFile();
  const text = await file.text();
  const model = monaco.editor.createModel(
    text,
    getLanguageFromExtension(fileHandle.name),
    monaco.Uri.parse(`file:///file-${fileIdCounter++}-${fileHandle.name}`)
  );

  fileToModelMap.set(fileHandle, { displayName: fileHandle.name, uri: model.uri });
  uriToFileMap.set(model.uri.toString(), fileHandle);
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
    suggestedName: model.uri.path.split('/').pop() || 'untitled',
  };

  const fileHandle = await window.showSaveFilePicker(options);
  const writable = await fileHandle.createWritable();
  await writable.write(model.getValue());
  await writable.close();

  fileToModelMap.set(fileHandle, { displayName: fileHandle.name, uri: model.uri });
  uriToFileMap.set(model.uri.toString(), fileHandle);
}

export function registerHandlers(editor: monaco.editor.IStandaloneCodeEditor) {
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
