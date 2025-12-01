interface LaunchParams {
  files: FileSystemFileHandle[];
  url: URL;
  targetURL: URL;
}

interface LaunchQueue {
  setConsumer(consumer: (launchParams: LaunchParams) => void): void;
}

interface Window {
  launchQueue?: LaunchQueue; // Use '?' for optional property (good practice as it's experimental)
}
