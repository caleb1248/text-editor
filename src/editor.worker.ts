import { isWorkerInitialized } from './language-support/common/initialize';
// @ts-ignore
import { start } from 'monaco-editor-core/esm/vs/editor/editor.worker.start.js';

self.onmessage = () => {
  if (!isWorkerInitialized()) {
    start(() => {
      return {};
    });
  }
};
