const staticCache = 'site-static-v1';
const dynamicCache = 'site-dynamic-v1';

// const assets = [
//   '/',
//   '/index.html',
//   // '/favicon.ico',
//   '/manifest.webmanifest',
//   // '/index.a564d7e8.css',
//   // '/index.57c78877.js',
//   // '/logo.37755af8.png',
//   // '/start.d13e7f51.png',
//   // '/finish.27e6e1a5.png',
//   // '/marker-shadow.b472ae79.png',
//   // '/favicon-16x16.013a03e3.png',
//   // '/favicon-32x32.eace7382.png',
//   // '/apple-touch-icon.e5e385f2.png',
//   // '/safari-pinned-tab.65abfb42.svg',
//   // '/android-chrome-192x192.9088898b.png',
//   // '/maskable-icon-384x384.97585137.png',
//   // '/android-chrome-512x512.6812c11a.png',
//   'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap',
// ];

const assets = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/manrope/v4/xn7gYHE41ni1AdIRggexSg.woff2',
];

const cacheStaticAssets = async () => {
  const cache = await caches.open(staticCache);
  cache.addAll(assets);
};

const removeUnusedCaches = async () => {
  const keys = await caches.keys();

  const deletions = keys
    .filter(key => key !== staticCache)
    .map(key => caches.delete(key));

  return Promise.all(deletions);
};

const cacheDynamicAssets = async req => {
  const [fetchRes, cache] = await Promise.all([
    fetch(req),
    caches.open(dynamicCache),
  ]);

  console.log('req:', req);
  console.log('res', fetchRes);

  cache.put(req.url, fetchRes.clone());

  return fetchRes;
};

const matchAssets = async req => {
  try {
    const cacheRes = await caches.match(req);
    return cacheRes ?? cacheDynamicAssets(req);
  } catch (err) {
    console.warn(err);
  }
};

self.addEventListener('install', e => e.waitUntil(cacheStaticAssets()));
self.addEventListener('activate', e => e.waitUntil(removeUnusedCaches()));
self.addEventListener('fetch', e => e.respondWith(matchAssets(e.request)));
