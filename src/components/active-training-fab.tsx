'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTimer } from '@/hooks/use-timer';
import { useTrainingStore } from '@/lib/store';
import styles from './active-training-fab.module.scss';

/** Плавающая кнопка возврата к активной тренировке */
export function ActiveTrainingFab() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = useTrainingStore((s) => s.isActive);
  const startTime = useTrainingStore((s) => s.startTime);
  const { elapsed, formatTime } = useTimer(isActive, startTime);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useTrainingStore.persist.onFinishHydration(() => {
      queueMicrotask(() => setHydrated(true));
    });
    if (useTrainingStore.persist.hasHydrated()) {
      queueMicrotask(() => setHydrated(true));
    }
    return unsub;
  }, []);

  const onTrainingPage =
    pathname === '/training' || pathname === '/training/';

  if (!hydrated || !isActive || !startTime || onTrainingPage) {
    return null;
  }

  return (
    <button
      type="button"
      className={`${styles.fab} animate-fade-in`}
      onClick={() => {
        router.push('/training');
      }}
      aria-label="Return to workout"
    >
      <span className={styles.label}>Workout</span>
      <span className={styles.time}>{formatTime(elapsed)}</span>
    </button>
  );
}
