// Service Worker para PWA - Controle de Extintores
const CACHE_NAME = 'controle-extintores-v5.2-PLAN-FIX';
const urlsToCache = [
  '/',
  '/index.html',
  '/pages/dashboard.html',
  '/pages/extintores.html', 
  '/pages/form.html',
  '/pages/relatorios.html',
  '/pages/configuracoes.html',
  '/css/common.css',
  '/css/auth.css',
  '/css/navigation.css',
  '/js/common.js',
  '/js/supabase-config.js',
  '/components/navbar.html',
  '/components/bottom-nav.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Arquivos em cache');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Erro ao cachear:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker ativado');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições (estratégia: Cache First)
self.addEventListener('fetch', event => {
  // Só cachear requisições GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Não cachear requisições para APIs externas (exceto Google Fonts e Supabase CDN)
  if (event.request.url.includes('supabase.co') && 
      !event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retornar resposta do cache
        if (response) {
          console.log('📋 Cache hit:', event.request.url);
          return response;
        }

        // Cache miss - buscar na rede
        console.log('🌐 Cache miss, buscando na rede:', event.request.url);
        return fetch(event.request).then(response => {
          // Verificar se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Fallback para páginas offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificação push (futuro)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
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
          title: 'Ver detalhes',
          icon: '/icons/checkmark.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icons/close.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Click em notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/pages/dashboard.html')
    );
  }
});
