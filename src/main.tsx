import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Service Worker lifecycle management
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In development mode, unregister any stale dev-sw to prevent fetch errors
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        if (registration.active?.scriptURL.includes('dev-sw.js')) {
          registration.unregister().catch(() => {});
        }
      }
    }).catch(() => {});
  } else {
    // In production, safely register service worker with error handling
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('Novo Service Worker assumiu o controle, recarregando...');
        window.location.reload();
      }
    });

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('Nova versão detectada, atualizando...');
        updateSW(true);
      },
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          setInterval(() => {
            registration.update().catch(() => {});
          }, 30000);
        }
      },
      onRegisterError(error) {
        console.log('SW registration note:', error);
      },
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
