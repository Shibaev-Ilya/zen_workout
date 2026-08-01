'use client';

import { SetRow } from '@/components/set-row';
import type { Exercise } from '@/lib/types';
import { formatOneRm } from '@/lib/exercises';
import styles from './exercise-card.module.scss';

interface ExerciseCardProps {
  exercise: Exercise;
  oneRm?: number | null;
  onAddSet: () => void;
  onRemove: () => void;
  onUpdateSet: (setId: string, field: 'reps' | 'weight', value: number) => void;
  onRemoveSet: (setId: string) => void;
}

export function ExerciseCard({
  exercise,
  oneRm,
  onAddSet,
  onRemove,
  onUpdateSet,
  onRemoveSet,
}: ExerciseCardProps) {
  return (
    <div className={`${styles.card} animate-slide-up`}>
      <div className={styles.header}>
        <div className={styles.nameField}>
          <span className={styles.nameText}>
            {exercise.name}
          </span>
        </div>
        <button
          className={styles.removeButton}
          onClick={onRemove}
          type="button"
        >
          ✕
        </button>
      </div>

      {exercise.sets.length > 0 && (
        <div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thNarrow}></th>
                <th className={styles.th}>kg</th>
                <th className={styles.th}>Reps</th>
                <th className={styles.th}>%</th>
                <th className={styles.thNarrow}></th>
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set, index) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={index}
                  exerciseId={exercise.id}
                  oneRm={oneRm}
                  onUpdate={onUpdateSet}
                  onRemove={onRemoveSet}
                />
              ))}
            </tbody>
          </table>
          <div className={styles.tableFoot}>
            {oneRm != null && oneRm > 0 && (
              <span className={styles.oneRmBadge}>1RM: {formatOneRm(oneRm)} kg · </span>
            )}
            Lifts: {exercise.sets.reduce(
              (sum, s) => sum + s.reps,
              0,
          )} · Tonnage: {exercise.sets.reduce(
              (sum, s) => sum + s.reps * s.weight,
              0,
          )} kg</div>
        </div>
      )}

      <button
        className={styles.addSetButton}
        onClick={onAddSet}
        type="button"
      >
        + Add set
      </button>
    </div>
  );
}
