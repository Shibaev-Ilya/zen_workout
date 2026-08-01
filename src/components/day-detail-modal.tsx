'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CompletedTraining } from '@/lib/types';
import styles from './day-detail-modal.module.scss';

interface DayDetailModalProps {
  dateLabel: string;
  trainings: CompletedTraining[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

export function DayDetailModal({
  dateLabel,
  trainings,
  onClose,
  onDelete,
}: DayDetailModalProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{dateLabel}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className={styles.body}>
          {trainings.map((training) => (
            <div key={training.id} className={styles.trainingCard}>
              <div className={styles.trainingHeader}>
                <p className={styles.trainingMeta}>
                  {formatDuration(training.duration)}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setPendingDeleteId(training.id)}
                >
                  Delete
                </Button>
              </div>

              {training.exercises.map((exercise) => (
                <div key={exercise.id} className={styles.exerciseBlock}>
                  <p className={styles.exerciseName}>
                    <span>{exercise.name}</span>
                  </p>
                  <p className={styles.exerciseStats}>
                    <span>Lifts: {exercise.sets.reduce((s, set) => s + set.reps, 0)}</span>
                    <span>Tonnage: {exercise.sets.reduce((s, set) => s + set.reps * set.weight, 0)} kg</span>
                  </p>
                  {exercise.sets.length > 0 && (
                    <div className={styles.setsList}>
                      {exercise.sets.map((set, i) => (
                        <span key={set.id} className={styles.setBadge}>
                          {i + 1}) {set.reps} × {set.weight}kg
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <Button onClick={onClose} style={{ width: '100%' }}>
            Close
          </Button>
        </div>
      </div>

      {pendingDeleteId && (
        <div
          className={styles.confirmOverlay}
          onClick={(e) => {
            e.stopPropagation();
            setPendingDeleteId(null);
          }}
        >
          <div
            className={styles.confirmDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.confirmText}>Delete this workout?</p>
            <div className={styles.confirmActions}>
              <Button
                variant="outline"
                className={styles.confirmButton}
                onClick={() => setPendingDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className={styles.confirmButton}
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
