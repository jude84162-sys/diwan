// ==========================================
// ديوان — Service Worker (محصّن)
// ==========================================

const CACHE_NAME = 'diwan-v3'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ⚠️ لا نخزّن أي شيء من /api/
const API_PATTERNS = ['/api/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // 1. تجاهل غير GET
  if (event.request.method !== 'GET') return

  // 2. ⚠️ لا تخزّن API — دائماً من الشبكة
  if (API_PATTERNS.some(p => url.pathname.startsWith(p))) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ message: 'لا يوجد اتصال' }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      })
    )
    return
  }

  // 3. تجاهل الطلبات الخارجية (Google Fonts، إلخ)
  if (url.origin !== self.location.origin) return

  // 4. الملفات الثابتة — Cache First
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response
      
      return fetch(event.request).then(networkResponse => {
        // خزّن فقط الملفات الثابتة
        if (
          networkResponse.ok &&
          ['style', 'script', 'image', 'font'].includes(event.request.destination)
        ) {
          const clone = networkResponse.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return networkResponse
      })
    }).catch(() => {
      // Offline fallback للصفحات
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html')
      }
    })
  )
})
