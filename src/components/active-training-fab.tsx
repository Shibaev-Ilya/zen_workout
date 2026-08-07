'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTimer } from '@/hooks/use-timer';
import { useTrainingStore } from '@/lib/store';
import styles from './active-training-fab.module.scss';

/** Минимальный сдвиг (px), после которого жест считается перетаскиванием, а не кликом */
const DRAG_THRESHOLD = 6;

type FabPos = { x: number; y: number };

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  dragging: boolean;
};

function clampPos(x: number, y: number, width: number, height: number): FabPos {
  const maxX = Math.max(0, window.innerWidth - width);
  const maxY = Math.max(0, window.innerHeight - height);
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  };
}

/** Плавающая кнопка возврата к активной тренировке */
export function ActiveTrainingFab() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = useTrainingStore((s) => s.isActive);
  const startTime = useTrainingStore((s) => s.startTime);
  const { elapsed, formatTime } = useTimer(isActive, startTime);
  const [hydrated, setHydrated] = useState(false);
  const [pos, setPos] = useState<FabPos | null>(null);
  const [dragging, setDragging] = useState(false);

  const fabRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const posRef = useRef<FabPos | null>(null);
  const didDragRef = useRef(false);

  useEffect(() => {
    const unsub = useTrainingStore.persist.onFinishHydration(() => {
      queueMicrotask(() => setHydrated(true));
    });
    if (useTrainingStore.persist.hasHydrated()) {
      queueMicrotask(() => setHydrated(true));
    }
    return unsub;
  }, []);

  // При смене страницы возвращаем FAB на позицию по умолчанию
  useEffect(() => {
    posRef.current = null;
    setPos(null);
    setDragging(false);
    dragRef.current = null;
    didDragRef.current = false;
  }, [pathname]);

  // Убираем ключ от старой версии с сохранением позиции
  useEffect(() => {
    try {
      localStorage.removeItem('active-training-fab-pos');
    } catch {
      // ignore
    }
  }, []);

  // Удерживаем кнопку в пределах экрана при ресайзе
  useEffect(() => {
    if (!pos) return;

    const clampToViewport = () => {
      const el = fabRef.current;
      if (!el) return;
      const current = posRef.current ?? pos;
      const next = clampPos(current.x, current.y, el.offsetWidth, el.offsetHeight);
      if (next.x === current.x && next.y === current.y) return;
      posRef.current = next;
      setPos(next);
    };

    window.addEventListener('resize', clampToViewport);
    return () => window.removeEventListener('resize', clampToViewport);
  }, [pos]);

  const onTrainingPage =
    pathname === '/training' || pathname === '/training/';
  const onHomePage = pathname === '/' || pathname === '';

  if (!hydrated || !isActive || !startTime || onTrainingPage) {
    return null;
  }

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const el = fabRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    didDragRef.current = false;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
      dragging: false,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.dragging = true;
      didDragRef.current = true;
      setDragging(true);
    }

    const el = fabRef.current;
    if (!el) return;

    const next = clampPos(
      drag.originX + dx,
      drag.originY + dy,
      el.offsetWidth,
      el.offsetHeight,
    );
    posRef.current = next;
    setPos(next);
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    dragRef.current = null;
    setDragging(false);

    if (fabRef.current?.hasPointerCapture(e.pointerId)) {
      fabRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const onClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    router.push('/training');
  };

  const customStyle = pos
    ? {
        left: pos.x,
        top: pos.y,
        right: 'auto',
        bottom: 'auto',
        margin: 0,
      }
    : undefined;

  return (
    <button
      ref={fabRef}
      type="button"
      className={[
        styles.fab,
        !pos && onHomePage ? styles.fabAboveNav : '',
        dragging ? styles.dragging : '',
        'animate-fade-in',
      ]
        .filter(Boolean)
        .join(' ')}
      style={customStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={onClick}
      aria-label="Return to workout"
    >
      <span className={styles.label}>Workout</span>
      <span className={styles.time}>{formatTime(elapsed)}</span>
    </button>
  );
}
