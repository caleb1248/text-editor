const perf = performance.now();
await import('./download-languages');
await import('./compile-languages');
await import('./compile-workers');
console.log(`Postinstall completed in ${(performance.now() - perf).toFixed(0)} ms`);
export {};
