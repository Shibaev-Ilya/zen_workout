'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TrainingCalendar } from '@/components/training-calendar';
import { DayDetailModal } from '@/components/day-detail-modal';
import { useTrainingStore } from '@/lib/store';
import type { CompletedTraining } from '@/lib/types';
import styles from './history.module.scss';

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const history = useTrainingStore((s) => s.history);
  const deleteTraining = useTrainingStore((s) => s.deleteTraining);
  const [scrolled, setScrolled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteTraining(id);
    const remaining = history.filter(
      (t) =>
        t.id !== id &&
        selectedDate !== null &&
        getDateKey(new Date(t.completedAt)) === selectedDate,
    );
    if (remaining.length === 0) {
      setSelectedDate(null);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const selectedTrainings: CompletedTraining[] = useMemo(() => {
    if (!selectedDate) return [];
    return history.filter((t) => getDateKey(new Date(t.completedAt)) === selectedDate);
  }, [selectedDate, history]);

  const selectedDateLabel = selectedDate
    ? formatDateLabel(new Date(selectedDate).toISOString())
    : '';

  return (
    <main className={styles.page}>
      <div className={`${styles.header}${scrolled ? ` ${styles.headerScrolled}` : ''}`}>
        <div className={styles.headerInner}>
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            Back
          </Button>
          <h1 className={styles.headerTitle}>
            History
          </h1>
          <div className={styles.headerSpacer} />
        </div>
      </div>

      <div className={styles.content}>
        <TrainingCalendar
          history={history}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {history.length === 0 && (
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className={styles.emptyTitle}>
              No workouts yet
            </p>
            <p className={styles.emptyHint}>
              Finish a workout to see it here
            </p>
            <Button onClick={() => router.push('/')} size="sm">
              Home
            </Button>
          </div>
        )}
      </div>

      {selectedDate && selectedTrainings.length > 0 && (
        <DayDetailModal
          dateLabel={selectedDateLabel}
          trainings={selectedTrainings}
          onClose={() => setSelectedDate(null)}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
