/**
 * Service Worker for Digital Hermit PWA
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'digital-hermit-v1.0.0';
const STATIC_CACHE_NAME = 'digital-hermit-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'digital-hermit-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/js/analytics.js',
  '/js/social-proof.js',
  '/js/email-marketing.js',
  '/js/ab-testing.js',
  '/manifest.json',
  // Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Admin files
  '/admin/dashboard.html',
  '/admin/login.html',
  '/admin/admin-styles.css',
  '/admin/admin-dashboard.js',
  // Test pages
  '/test-analytics.html',
  '/test-social-proof.html',
  '/test-email-marketing.html'
];

// Files to cache on demand
const DYNAMIC_ASSETS = [
  '/admin/',
  '/test-'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

/**
 * Handle different types of requests
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Handle static assets
    if (isStaticAsset(url.pathname)) {
      return await handleStaticAsset(request);
    }
    
    // Handle dynamic content
    if (isDynamicAsset(url.pathname)) {
      return await handleDynamicAsset(request);
    }
    
    // Handle external resources
    if (isExternalResource(url.href)) {
      return await handleExternalResource(request);
    }
    
    // Handle API requests
    if (isApiRequest(url.pathname)) {
      return await handleApiRequest(request);
    }
    
    // Default: network first, cache fallback
    return await networkFirst(request);
    
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    return await getOfflineFallback(request);
  }
}

/**
 * Handle static assets (cache first)
 */
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return await getOfflineFallback(request);
  }
}

/**
 * Handle dynamic content (network first, cache fallback)
 */
async function handleDynamicAsset(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return await getOfflineFallback(request);
  }
}

/**
 * Handle external resources
 */
async function handleExternalResource(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return await getOfflineFallback(request);
  }
}

/**
 * Handle API requests (network only, no caching)
 */
async function handleApiRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Return a custom offline response for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Network first strategy
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return await getOfflineFallback(request);
  }
}

/**
 * Get offline fallback page
 */
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // If it's a navigation request, return offline page
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // For other requests, return a generic offline response
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Digital Hermit</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
                color: white;
                margin: 0;
                padding: 2rem;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .offline-container {
                max-width: 500px;
            }
            h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            p {
                font-size: 1.1rem;
                margin-bottom: 2rem;
                opacity: 0.9;
            }
            .retry-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s ease;
            }
            .retry-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <h1>🔌 You're Offline</h1>
            <p>It looks like you're not connected to the internet. Don't worry, you can still browse the cached content.</p>
            <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
        </div>
    </body>
    </html>
    `,
    {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/html'
      }
    }
  );
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(pathname) {
  return STATIC_ASSETS.some(asset => pathname === asset || pathname.endsWith(asset));
}

/**
 * Check if path is a dynamic asset
 */
function isDynamicAsset(pathname) {
  return DYNAMIC_ASSETS.some(asset => pathname.startsWith(asset));
}

/**
 * Check if URL is an external resource
 */
function isExternalResource(url) {
  return EXTERNAL_RESOURCES.some(resource => url === resource);
}

/**
 * Check if path is an API request
 */
function isApiRequest(pathname) {
  return pathname.startsWith('/api/') || 
         pathname.includes('mailchimp.com') || 
         pathname.includes('convertkit.com') ||
         pathname.includes('google-analytics.com') ||
         pathname.includes('facebook.com');
}

// Background sync for form submissions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'form-submission') {
    event.waitUntil(syncFormSubmissions());
  }
});

/**
 * Sync pending form submissions when back online
 */
async function syncFormSubmissions() {
  try {
    // Get pending submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        // Try to submit the form
        const response = await fetch('/api/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submission)
        });
        
        if (response.ok) {
          // Remove from pending submissions
          await removePendingSubmission(submission.id);
          console.log('Service Worker: Form submission synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync form submission', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

/**
 * Get pending submissions from IndexedDB
 */
async function getPendingSubmissions() {
  // This would integrate with IndexedDB
  // For now, return empty array
  return [];
}

/**
 * Remove pending submission from IndexedDB
 */
async function removePendingSubmission(id) {
  // This would integrate with IndexedDB
  // For now, just log
  console.log('Service Worker: Removing pending submission', id);
}

// Push notifications (for future use)
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from Digital Hermit',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Digital Hermit', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle app updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (for future use)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

/**
 * Sync content in the background
 */
async function syncContent() {
  try {
    // Update cached content
    console.log('Service Worker: Syncing content...');
    
    // This could fetch new content, update caches, etc.
    
  } catch (error) {
    console.error('Service Worker: Content sync failed', error);
  }
}
