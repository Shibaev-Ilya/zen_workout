'use client';

import styles from './page-loader.module.scss';

/** Индикатор загрузки до гидрации Zustand / localStorage */
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className={styles.loader} role="status" aria-live="polite" aria-label={label}>
      <span className={styles.spinner} aria-hidden />
      <span className={styles.text}>{label}</span>
    </div>
  );
}
