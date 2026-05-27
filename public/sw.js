/**
 * E-Pakar Service Worker
 * Version: 1.0.0
 * 
 * Strategies:
 * - Cache-first for static assets (CSS, JS, images, fonts)
 * - Network-first for API calls and HTML pages
 * - Offline fallback page for navigation requests
 */

const CACHE_VERSION = 'epakar-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Cache duration for API responses (in seconds)
const API_CACHE_MAX_AGE = 60; // 1 minute
const DYNAMIC_CACHE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Static file extensions for cache-first strategy
const STATIC_EXTENSIONS = [
  'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif',
  'woff', 'woff2', 'ttf', 'otf', 'eot', 'ico', 'json', 'xml',
];

// API paths that should use network-first strategy
const API_PATHS = ['/api/'];

// Install event: pre-cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v1.0.0');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v1.0.0');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('epakar-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event: route requests to appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except for fonts/CDN)
  if (url.origin !== location.origin && !isCacheableCrossOrigin(url)) return;

  // Skip Next.js hot reload and dev server requests
  if (url.pathname.startsWith('/_next/') && url.pathname.includes('/hmr')) return;
  if (url.pathname.startsWith('/__nextjs')) return;

  // Route to appropriate strategy
  if (isApiRequest(url)) {
    // Network-first for API calls
    event.respondWith(networkFirst(request, API_CACHE, API_CACHE_MAX_AGE));
  } else if (isStaticAsset(url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (request.mode === 'navigate') {
    // Network-first for navigation (HTML pages)
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else {
    // Stale-while-revalidate for everything else
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// --- Strategy Implementations ---

/**
 * Cache-first strategy: Serve from cache, fallback to network
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f0fdf4" width="200" height="200"/><text fill="#059669" font-size="14" x="100" y="105" text-anchor="middle">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-first strategy: Try network, fallback to cache
 */
async function networkFirst(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      // Check if cache is stale
      if (maxAge && isCacheStale(cached, maxAge)) {
        // Still return stale data but log warning
        console.log('[SW] Serving stale cache for:', request.url);
      }
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline', message: 'Tidak ada koneksi internet' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Network-first for navigation with offline fallback page
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return cached root page as fallback (SPA shell)
    const rootCached = await caches.match('/');
    if (rootCached) {
      return rootCached;
    }

    // Ultimate offline fallback page
    return new Response(getOfflinePage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

/**
 * Stale-while-revalidate: Serve from cache, update in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// --- Helper Functions ---

function isApiRequest(url) {
  return API_PATHS.some((path) => url.pathname.startsWith(path));
}

function isStaticAsset(url) {
  const ext = url.pathname.split('.').pop()?.toLowerCase() || '';
  return STATIC_EXTENSIONS.includes(ext);
}

function isCacheableCrossOrigin(url) {
  // Allow caching of fonts from CDN
  return url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');
}

function isCacheStale(response, maxAgeSeconds) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  const cachedTime = new Date(dateHeader).getTime();
  const now = Date.now();
  return (now - cachedTime) / 1000 > maxAgeSeconds;
}

function getOfflinePage() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Pakar - Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ecfdf5, #f0fdfa, #ecfeff);
      color: #1f2937;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      width: 80px; height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #059669, #0d9488);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 800;
      color: white;
      box-shadow: 0 10px 30px rgba(5, 150, 105, 0.3);
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #059669, #0891b2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p {
      color: #6b7280;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    button {
      background: linear-gradient(135deg, #059669, #0d9488);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4);
    }
    button:active { transform: scale(0.97); }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">EP</div>
    <h1>Anda Sedang Offline</h1>
    <p>Tidak dapat terhubung ke internet. Pastikan koneksi Anda aktif dan coba lagi.</p>
    <button onclick="window.location.reload()">Coba Lagi</button>
  </div>
</body>
</html>`;
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      Promise.all(names.map((name) => caches.delete(name)));
    });
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', version: CACHE_VERSION });
  }
});
