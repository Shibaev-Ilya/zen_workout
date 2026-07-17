'use client';

import { useTimer } from '@/hooks/use-timer';
import styles from './timer.module.scss';

interface TimerProps {
  isRunning: boolean;
  startTimeMs: number | null;
}

export function Timer({ isRunning, startTimeMs }: TimerProps) {
  const { elapsed, formatTime } = useTimer(isRunning, startTimeMs);

  return (
    <div className={styles.wrapper}>
      <div className={styles.display}>
        {formatTime(elapsed)}
      </div>
    </div>
  );
}
