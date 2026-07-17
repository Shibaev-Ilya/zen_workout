'use client';

import { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import type { Set } from '@/lib/types';
import styles from './set-row.module.scss';

interface SetRowProps {
  set: Set;
  index: number;
  exerciseId: string;
  autoFocus?: boolean;
  onUpdate: (setId: string, field: 'reps' | 'weight', value: number) => void;
  onRemove: (setId: string) => void;
}

export function SetRow({
  set,
  index,
  exerciseId,
  autoFocus = false,
  onUpdate,
  onRemove,
}: SetRowProps) {
  const weightRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && weightRef.current) {
      weightRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <tr className={`${styles.row} animate-fade-in`}>
      <td className={styles.cellNumber}>
        {index + 1}
      </td>
      <td className={styles.cellInput}>
        <Input
          ref={weightRef}
          type="number"
          min={0}
          step={0.5}
          value={set.weight || ''}
          onChange={(e) => onUpdate(set.id, 'weight', Number(e.target.value))}
          className={styles.inputField}
          placeholder="0"
        />
      </td>
      <td className={styles.cellInput}>
        <Input
          type="number"
          min={0}
          value={set.reps || ''}
          onChange={(e) => onUpdate(set.id, 'reps', Number(e.target.value))}
          className={styles.inputField}
          placeholder="0"
        />
      </td>
      <td className={styles.cellAction}>
        <button
          onClick={() => onRemove(set.id)}
          className={styles.removeButton}
          type="button"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
