'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './install-prompt.module.scss';

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    );

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sporttracker/sw.js', {
        scope: '/sporttracker/',
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone) return null;

  return (
    <>
      {showPrompt && (
        <div className={styles.banner}>
          <div className={`${styles.card} animate-fade-in`}>
            <p className={styles.text}>
              Install Zen Workout on your home screen for quick access
            </p>
            <div className={styles.actions}>
              <Button onClick={handleInstall} size="sm" className={styles.installButton}>
                Install
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrompt(false)}
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      )}

      {isIOS && !isStandalone && (
        <div className={styles.banner}>
          <div className={`${styles.card} animate-fade-in`}>
            <p className={styles.text}>
              To install the app, tap Share and choose Add to Home Screen
            </p>
          </div>
        </div>
      )}
    </>
  );
}
