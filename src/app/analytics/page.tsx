'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { useTrainingStore } from '@/lib/store';
import type { CompletedTraining } from '@/lib/types';
import styles from './analytics.module.scss';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

interface ExerciseStats {
  name: string;
  entries: { date: string; kpsh: number; tonnage: number }[];
}

function computeStats(history: CompletedTraining[]): ExerciseStats[] {
  const exerciseMap = new Map<
    string,
    { date: string; completedAt: string; kpsh: number; tonnage: number }[]
  >();

  for (const training of history) {
    const dateKey = formatDateShort(training.completedAt);
    for (const exercise of training.exercises) {
      if (!exercise.name.trim()) continue;
      const kpsh = exercise.sets.reduce((s, set) => s + set.reps, 0);
      const tonnage = exercise.sets.reduce((s, set) => s + set.reps * set.weight, 0);
      if (kpsh === 0) continue;

      let entries = exerciseMap.get(exercise.name);
      if (!entries) {
        entries = [];
        exerciseMap.set(exercise.name, entries);
      }
      entries.push({ date: dateKey, completedAt: training.completedAt, kpsh, tonnage });
    }
  }

  return Array.from(exerciseMap.entries())
    .map(([name, entries]) => {
      const lastCompletedAt = entries.reduce(
        (max, e) => (e.completedAt > max ? e.completedAt : max),
        entries[0].completedAt,
      );
      return {
        name,
        lastCompletedAt,
        entries: entries.slice(-10).map(({ date, kpsh, tonnage }) => ({
          date,
          kpsh,
          tonnage,
        })),
      };
    })
    .sort((a, b) => b.lastCompletedAt.localeCompare(a.lastCompletedAt))
    .map(({ name, entries }) => ({ name, entries }));
}

export default function AnalyticsPage() {
  const router = useRouter();
  const history = useTrainingStore((s) => s.history);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const stats = useMemo(() => computeStats(history), [history]);

  return (
    <main className={styles.page}>
      <div className={`${styles.header}${scrolled ? ` ${styles.headerScrolled}` : ''}`}>
        <div className={styles.headerInner}>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            ← Назад
          </Button>
          <h1 className={styles.headerTitle}>Аналитика</h1>
          <div className={styles.headerSpacer} />
        </div>
      </div>

      <div className={styles.content}>
        {stats.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p className={styles.emptyTitle}>Нет данных</p>
            <p className={styles.emptyHint}>Завершите тренировки, чтобы увидеть аналитику</p>
            <Button onClick={() => router.push('/')} size="sm">На главную</Button>
          </div>
        ) : (
          stats.map((exercise) => {
            const chartData = {
              labels: exercise.entries.map((e) => e.date),
              datasets: [
                {
                  label: 'КПШ',
                  data: exercise.entries.map((e) => e.kpsh),
                  borderColor: 'rgba(0, 0, 0, 0.8)',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  pointBackgroundColor: 'rgba(0, 0, 0, 0.8)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 1,
                  pointRadius: 3,
                  tension: 0.1,
                },
                {
                  label: 'Тоннаж',
                  data: exercise.entries.map((e) => e.tonnage),
                  borderColor: 'rgba(0, 0, 0, 0.35)',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  pointBackgroundColor: 'rgba(0, 0, 0, 0.35)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 1,
                  pointRadius: 3,
                  tension: 0.1,
                },
              ],
            };

            const chartOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#000',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  cornerRadius: 0,
                  padding: 8,
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 10 } },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.08)' },
                  ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 10 } },
                },
              },
            };

            return (
              <div key={exercise.name} className={styles.exerciseBlock}>
                <p className={styles.exerciseTitle}>{exercise.name}</p>
                <div className={styles.chart}>
                  <Line data={chartData} options={chartOptions} />
                </div>
                <div className={styles.legend}>
                  <span className={styles.legendItem}>
                    <span className={styles.legendSwatch} style={{ opacity: 0.8 }} />
                    КПШ
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendSwatch} style={{ opacity: 0.35 }} />
                    Тоннаж
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
