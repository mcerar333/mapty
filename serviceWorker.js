import { async } from 'regenerator-runtime';

const staticCache = 'site-static';

const assets = [
  '/',
  '/index.html',
  // '/favicon.ico',
  '/manifest.webmanifest',
  // '/index.a564d7e8.css',
  // '/index.57c78877.js',
  // '/logo.37755af8.png',
  // '/start.d13e7f51.png',
  // '/finish.27e6e1a5.png',
  // '/marker-shadow.b472ae79.png',
  // '/favicon-16x16.013a03e3.png',
  // '/favicon-32x32.eace7382.png',
  // '/apple-touch-icon.e5e385f2.png',
  // '/safari-pinned-tab.65abfb42.svg',
  // '/android-chrome-192x192.9088898b.png',
  // '/maskable-icon-384x384.97585137.png',
  // '/android-chrome-512x512.6812c11a.png',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap',
];

self.addEventListener('install', e => {
  console.log('Service Worker Installed');
  console.log(e);

  e.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(staticCache);

        console.log(cache);
        console.log('Caching Shell Assets');

        cache.addAll(assets);
      } catch (err) {
        console.error(err.message);
      }
    })()
  );
});

self.addEventListener('activate', e => {
  console.log('Service Worker Activated');
  console.log(e);
});

self.addEventListener('fetch', e => {
  console.log('Fetching:');
  console.log(e.request.url);
});
