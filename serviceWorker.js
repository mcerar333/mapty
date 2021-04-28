import { async } from 'regenerator-runtime/runtime';

const staticCacheName = 'site-static-v2';
const dynamicCacheName = 'site-dynamic-v2';

const assets = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/manrope/v4/xn7gYHE41ni1AdIRggmxSuXd.woff2',
  'https://fonts.gstatic.com/s/manrope/v4/xn7gYHE41ni1AdIRggexSg.woff2',
];

const limitCacheSize = async (cacheName, cacheSize) => {
  const regex = /favicon|logo|android|maskable|apple|safari|start|finish|marker|\.(?:js|css|ico)$/;

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length <= cacheSize) return;

  keys
    .filter(key => !regex.test(key.url))
    .slice(0, keys.length - cacheSize)
    .map(key => cache.delete(key));
};

const cacheStaticAssets = async () => {
  try {
    const cache = await caches.open(staticCacheName);
    cache.addAll(assets);
  } catch (err) {
    console.error(err.message);
  }
};

const cacheDynamicAssets = async req => {
  try {
    const [cache, fetchRes] = await Promise.all([
      caches.open(dynamicCacheName),
      fetch(req),
    ]);

    cache.put(req.url, fetchRes.clone());
    limitCacheSize(dynamicCacheName, 30);

    return fetchRes;
  } catch (err) {
    console.error(err.message);
  }
};

const matchAssets = async req => {
  try {
    const cacheRes = await caches.match(req);
    return cacheRes ?? cacheDynamicAssets(req);
  } catch (err) {
    console.error(err.message);
  }
};

const removeUnusedCaches = async () => {
  try {
    const keys = await caches.keys();

    const deletions = keys
      .filter(key => key !== staticCacheName && key !== dynamicCacheName)
      .map(key => caches.delete(key));

    return Promise.all(deletions);
  } catch (err) {
    console.error(err.message);
  }
};

self.addEventListener('install', e => e.waitUntil(cacheStaticAssets()));
self.addEventListener('activate', e => e.waitUntil(removeUnusedCaches()));
self.addEventListener('fetch', e => e.respondWith(matchAssets(e.request)));
