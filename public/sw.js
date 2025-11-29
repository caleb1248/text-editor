// @ts-check
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope} */
const sw = /**@type {any} */ (globalThis.self);

const CACHE_VERSION = 'v1';

/**
 * @param {RequestInfo[]} urls
 */
async function addToCache(urls) {
  const viteManifest = await fetch('/.vite/manifest.json');

  if (viteManifest.ok) {
    const json = await viteManifest.json();
    for (const key in json) {
      urls.push('/' + json[key].file);
    }
    console.log(urls);
  } else {
    console.log('could not fetch vite manifest');
  }

  console.log('urls:', urls);

  const cache = await sw.caches.open(CACHE_VERSION);
  await cache.addAll(urls);
  console.log('[sw] everything cached');
}

sw.addEventListener('install', (event) => {
  event.waitUntil(
    addToCache([
      '/',
      '/workers/css.worker.js',
      '/workers/editor.worker.js',
      '/workers/json.worker.js',
      '/workers/ts.worker.js',
      '/workers/html.worker.js',
    ])
  );
});

sw.addEventListener('activate', (event) => {
  sw.clients.claim();
});

sw.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      if (event.request.url?.includes('app.webmanifest')) return fetch('/app.webmanifest');

      const cache = await sw.caches.open(CACHE_VERSION);
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        if (cachedResponse.ok) return cachedResponse;
        console.log('bad cache', event.request.url);
        cache.delete(event.request);
      }
      const fetchResponse = await sw.fetch(event.request);
      if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
        return fetchResponse;
      }
      cache.put(event.request, fetchResponse.clone());
      return fetchResponse;
    })()
  );
});
