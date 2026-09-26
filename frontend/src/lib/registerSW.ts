// ==========================================
// تسجيل Service Worker
// ==========================================

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker غير مدعوم')
    return
  }

  // ✅ تحقق من الإنتاج بطريقة آمنة
  const isProd = typeof import.meta !== 'undefined' 
    && import.meta.env 
    && import.meta.env.MODE === 'production'

  if (!isProd) {
    console.log('🔧 Dev mode — Service Worker معطّل')
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker جاهز:', reg.scope)
      })
      .catch(err => {
        console.error('❌ خطأ في Service Worker:', err)
      })
  })
}
