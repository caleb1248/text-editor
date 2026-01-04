const perf = performance.now();
await import('./download-languages');
process.stdout.write('\x1b[1;32mCompiling language extensions...\x1b[0m\n\n');
await import('./compile-languages');
console.log('Compiling workers...');
await import('./compile-workers');
console.log(
  `\n\x1b[1;36mPostinstall completed in ${((performance.now() - perf) / 1000).toFixed(2)}s`
);
export {};
