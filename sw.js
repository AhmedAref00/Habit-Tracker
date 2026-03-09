// ============================================================
// HabitFlow PWA - Service Worker
// يخزن ملفات التطبيق للتشغيل أوفلاين
// ============================================================

const CACHE = 'habitflow-v6-pwa';

const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js',
];

// تثبيت - تخزين الملفات
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // نخزن الملفات المحلية أولاً (مضمونة)
      cache.addAll(['./index.html', './manifest.json']);
      // نخزن الخارجية بشكل اختياري (ممكن تفشل لو أوفلاين)
      FILES.slice(4).forEach(url => cache.add(url).catch(() => {}));
    }).then(() => self.skipWaiting())
  );
});

// تفعيل - حذف الكاش القديم
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// طلبات الشبكة - Cache First
self.addEventListener('fetch', e => {
  if(!e.request.url.startsWith('http')) return;
  if(e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // أوفلاين ومش موجود - رجّع الصفحة الرئيسية
        if(e.request.destination === 'document') return caches.match('./index.html');
      });
    })
  );
});
