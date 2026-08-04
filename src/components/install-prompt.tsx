'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './install-prompt.module.scss';

const DISMISS_COOKIE = 'install-prompt-dismissed';
const DAY_SECONDS = 60 * 60 * 24;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function isDismissedToday(): boolean {
  return getCookie(DISMISS_COOKIE) === '1';
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    setDismissed(isDismissedToday());

    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    );

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissedToday()) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sporttracker/sw.js', {
          scope: '/sporttracker/',
        });
      } else {
        // В dev снимаем SW — иначе кэш чанков ломает HMR и навигацию
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleDismiss = () => {
    setCookie(DISMISS_COOKIE, '1', DAY_SECONDS);
    setDismissed(true);
    setShowPrompt(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || dismissed) return null;

  // Только один баннер за раз: приоритет у beforeinstallprompt
  if (showPrompt) {
    return (
      <div className={styles.banner}>
        <div className={`${styles.card} animate-fade-in`}>
          <p className={styles.text}>
            Install Zen Workout on your home screen for quick access
          </p>
          <div className={styles.actions}>
            <Button onClick={handleInstall} size="sm" className={styles.installButton}>
              Install
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Later
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className={styles.banner}>
        <div className={`${styles.card} animate-fade-in`}>
          <p className={styles.text}>
            To install the app, tap Share and choose Add to Home Screen
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Later
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
