'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import type { Set } from '@/lib/types';
import styles from './set-row.module.scss';

interface SetRowProps {
  set: Set;
  index: number;
  exerciseId: string;
  oneRm?: number | null;
  onUpdate: (setId: string, field: 'reps' | 'weight', value: number) => void;
  onRemove: (setId: string) => void;
}

/** Интенсивность: (вес подхода / 1RM) × 100 */
function formatIntensity(weight: number, oneRm?: number | null): string {
  if (oneRm == null || oneRm <= 0 || weight <= 0) return '—';
  return `${Math.round((weight / oneRm) * 100)}%`;
}

function sanitizeDecimal(value: string): string {
  const normalized = value.replace(',', '.');
  const cleaned = normalized.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length > 0 ? `${whole}.${rest.join('').replace(/\./g, '')}` : whole;
}

function sanitizeInteger(value: string): string {
  return value.replace(/\D/g, '');
}

function formatStored(value: number): string {
  return value > 0 ? String(value) : '';
}

export function SetRow({
  set,
  index,
  oneRm,
  onUpdate,
  onRemove,
}: SetRowProps) {
  const [weightDraft, setWeightDraft] = useState(() => formatStored(set.weight));
  const [repsDraft, setRepsDraft] = useState(() => formatStored(set.reps));
  const [weightFocused, setWeightFocused] = useState(false);
  const [repsFocused, setRepsFocused] = useState(false);

  // Sync from store only when the field is not being edited
  useEffect(() => {
    if (!weightFocused) {
      setWeightDraft(formatStored(set.weight));
    }
  }, [set.weight, weightFocused]);

  useEffect(() => {
    if (!repsFocused) {
      setRepsDraft(formatStored(set.reps));
    }
  }, [set.reps, repsFocused]);

  return (
    <tr className={`${styles.row} animate-fade-in`}>
      <td className={styles.cellNumber}>
        {index + 1}
      </td>
      <td className={styles.cellInput}>
        <Input
          type="text"
          inputMode="decimal"
          enterKeyHint="next"
          value={weightDraft}
          onFocus={() => setWeightFocused(true)}
          onBlur={() => {
            setWeightFocused(false);
            setWeightDraft(formatStored(set.weight));
          }}
          onChange={(e) => {
            const raw = sanitizeDecimal(e.target.value);
            setWeightDraft(raw);
            onUpdate(set.id, 'weight', raw === '' || raw === '.' ? 0 : Number(raw));
          }}
          className={styles.inputField}
          placeholder="0"
          aria-label={`Set ${index + 1} weight`}
        />
      </td>
      <td className={styles.cellInput}>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="done"
          value={repsDraft}
          onFocus={() => setRepsFocused(true)}
          onBlur={() => {
            setRepsFocused(false);
            setRepsDraft(formatStored(set.reps));
          }}
          onChange={(e) => {
            const raw = sanitizeInteger(e.target.value);
            setRepsDraft(raw);
            onUpdate(set.id, 'reps', raw === '' ? 0 : Number(raw));
          }}
          className={styles.inputField}
          placeholder="0"
          aria-label={`Set ${index + 1} reps`}
        />
      </td>
      <td
        className={styles.cellIntensity}
        aria-label={`Set ${index + 1} intensity`}
      >
        {formatIntensity(set.weight, oneRm)}
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
