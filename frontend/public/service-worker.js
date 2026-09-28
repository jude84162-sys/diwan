// ==========================================
// ديوان — Service Worker v3
// ==========================================

const CACHE_NAME = 'diwan-v4-' + Date.now()
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// تثبيت
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  )
})

// تنشيط
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  )
})

// جلب
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) return fetch(event.request)

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = networkResponse.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return networkResponse
      })
    })
  )
})

// رسالة من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
