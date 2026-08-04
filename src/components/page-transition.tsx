'use client';

import { usePathname } from 'next/navigation';
import styles from './page-transition.module.scss';

/** CSS fade при смене маршрута */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={`${styles.root} ${styles.enter}`}>
      {children}
    </div>
  );
}
