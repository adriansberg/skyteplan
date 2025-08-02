const CACHE_NAME = 'stordalen-v1';
const STATIC_ASSETS = [
	'/',
	'/skyttere',
  '/premieliste',
	'/stordalen.jpg',
	'/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => cache.addAll(STATIC_ASSETS))
			.then(() => self.skipWaiting())
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((cacheName) => cacheName !== CACHE_NAME)
						.map((cacheName) => caches.delete(cacheName))
				);
			})
			.then(() => self.clients.claim())
	);
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				// Return cached version or fetch from network
				return response || fetch(event.request);
			})
			.catch(() => {
				// If both cache and network fail, show offline page for navigation requests
				if (event.request.mode === 'navigate') {
					return caches.match('/');
				}
			})
	);
});
