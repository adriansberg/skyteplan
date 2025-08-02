const CACHE_NAME = 'stordalen-v2';
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

// Listen for messages from the client
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	
	if (event.data && event.data.type === 'REFRESH_CACHE') {
		// Clear dynamic caches on refresh
		event.waitUntil(
			caches.keys().then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((cacheName) => cacheName.startsWith('dynamic-'))
						.map((cacheName) => caches.delete(cacheName))
				);
			})
		);
	}
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// For API requests, use network first with cache fallback
	if (url.pathname.includes('/api/') || url.hostname !== location.hostname) {
		event.respondWith(
			fetch(request)
				.then((response) => {
					// Cache successful API responses
					if (response.ok) {
						const responseClone = response.clone();
						caches.open(`dynamic-${CACHE_NAME}`).then((cache) => {
							cache.put(request, responseClone);
						});
					}
					return response;
				})
				.catch(() => {
					// Fallback to cache if network fails
					return caches.match(request);
				})
		);
		return;
	}

	// For everything else, use cache first with network fallback
	event.respondWith(
		caches.match(request)
			.then((response) => {
				if (response) {
					// Found in cache, but also fetch from network to update cache
					fetch(request).then((fetchResponse) => {
						if (fetchResponse.ok) {
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(request, fetchResponse);
							});
						}
					}).catch(() => {
						// Network failed, but we have cache response
					});
					return response;
				}
				
				// Not in cache, fetch from network
				return fetch(request).then((fetchResponse) => {
					if (fetchResponse.ok) {
						const responseClone = fetchResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, responseClone);
						});
					}
					return fetchResponse;
				});
			})
			.catch(() => {
				// If both cache and network fail, show offline page for navigation requests
				if (request.mode === 'navigate') {
					return caches.match('/');
				}
			})
	);
});
