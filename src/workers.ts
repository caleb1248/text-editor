import editorWorker from './workers/editor.worker?worker';
import jsonWorker from './workers/json.worker?worker';
import cssWorker from './workers/css.worker?worker';
import htmlWorker from './workers/html.worker?worker';
import tsWorker from './workers/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker: function (_: string, label: string) {
    switch (label) {
      case 'json':
        return new jsonWorker();
      case 'css':
      case 'scss':
      case 'less':
        return new cssWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        return new htmlWorker();
      case 'typescript':
      case 'javascript':
        console.log('creating worker for ts/js');
        return new tsWorker();
      default:
        return new editorWorker();
    }
  },
};
