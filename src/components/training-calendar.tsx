'use client';

import { useMemo, useState } from 'react';
import type { CompletedTraining } from '@/lib/types';
import styles from './training-calendar.module.scss';

interface TrainingCalendarProps {
  history: CompletedTraining[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TrainingCalendar({ history, selectedDate, onSelectDate }: TrainingCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const trainingDays = useMemo(() => {
    const set = new Set<string>();
    for (const t of history) {
      set.add(getDateKey(new Date(t.completedAt)));
    }
    return set;
  }, [history]);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const cells: ({ day: number; isToday: boolean } | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }

    const todayStr = getDateKey(now);

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      cells.push({ day: d, isToday: getDateKey(date) === todayStr });
    }

    return cells;
  }, [year, month, now]);

  const prevMonth = () => {
    if (month === 0) {
      setYear(y => y - 1);
      setMonth(11);
    } else {
      setMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(y => y + 1);
      setMonth(0);
    } else {
      setMonth(m => m + 1);
    }
  };

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.calendar}>
      <div className={styles.nav}>
        <button className={styles.navButton} onClick={prevMonth} type="button">
          ←
        </button>
        <span className={styles.monthTitle}>{monthLabel}</span>
        <button className={styles.navButton} onClick={nextMonth} type="button">
          →
        </button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} className={styles.weekday}>{wd}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((cell, i) => {
          if (!cell) {
            return <div key={`e-${i}`} className={`${styles.dayCell} ${styles.dayEmpty}`} />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
          const hasTraining = trainingDays.has(dateKey);
          const isSelected = selectedDate === dateKey;

          const classes = [
            styles.dayCell,
            cell.isToday ? styles.dayToday : '',
            hasTraining ? styles.dayHasTraining : '',
            isSelected ? styles.daySelected : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={dateKey}
              className={classes}
              onClick={() => {
                if (hasTraining) {
                  onSelectDate(isSelected ? null : dateKey);
                }
              }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
