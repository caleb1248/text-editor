self.MonacoEnvironment = {
  getWorker: function (_: string, label: string) {
    switch (label) {
      case 'json':
        return new Worker('/workers/json.worker.js');
      case 'css':
      case 'scss':
      case 'less':
        return new Worker('/workers/css.worker.js');
      case 'html':
      case 'handlebars':
      case 'razor':
        return new Worker('/workers/html.worker.js');
      case 'typescript':
      case 'javascript':
        console.log('creating worker for ts/js');
        return new Worker('/workers/ts.worker.js');
      default:
        return new Worker('/workers/editor.worker.js');
    }
  },
};
