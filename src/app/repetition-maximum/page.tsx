'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrainingStore } from '@/lib/store';
import {
  calculateEpleyOneRm,
  formatOneRm,
  getAvailableExercises,
} from '@/lib/exercises';
import type { OneRmEntry } from '@/lib/types';
import styles from './repetition-maximum.module.scss';

type Mode = 'direct' | 'epley';

export default function RepetitionMaximumPage() {
  const router = useRouter();
  const customExercises = useTrainingStore((s) => s.customExercises);
  const oneRm = useTrainingStore((s) => s.oneRm);
  const saveOneRm = useTrainingStore((s) => s.saveOneRm);
  const deleteOneRm = useTrainingStore((s) => s.deleteOneRm);

  const [scrolled, setScrolled] = useState(false);
  const [editing, setEditing] = useState<OneRmEntry | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [mode, setMode] = useState<Mode>('direct');
  const [directOneRm, setDirectOneRm] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const availableExercises = useMemo(
    () => getAvailableExercises(customExercises),
    [customExercises],
  );

  const calculated = useMemo(() => {
    const w = Number(weight);
    const r = Number(reps);
    if (!w || !r) return 0;
    return calculateEpleyOneRm(w, r);
  }, [weight, reps]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const resetForm = () => {
    setEditing(null);
    setExerciseName('');
    setMode('direct');
    setDirectOneRm('');
    setWeight('');
    setReps('');
    setError('');
  };

  const startEdit = (entry: OneRmEntry) => {
    setEditing(entry);
    setExerciseName(entry.exerciseName);
    setMode('direct');
    setDirectOneRm(String(entry.oneRm));
    setWeight('');
    setReps('');
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const name = exerciseName.trim();
    if (!name) {
      setError('Select an exercise');
      return;
    }

    let value = 0;
    if (mode === 'direct') {
      value = Number(directOneRm);
      if (!value || value <= 0) {
        setError('Enter a valid 1RM');
        return;
      }
    } else {
      value = calculated;
      if (!value || value <= 0) {
        setError('Enter weight and reps to calculate');
        return;
      }
    }

    value = Math.round(value * 10) / 10;
    setSaving(true);
    try {
      await saveOneRm(name, value);
      resetForm();
    } catch {
      setError('Could not save');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this 1RM entry?')) return;
    await deleteOneRm(id);
    if (editing?.id === id) resetForm();
  };

  const sortedOneRm = useMemo(
    () => [...oneRm].sort((a, b) => a.exerciseName.localeCompare(b.exerciseName, 'en')),
    [oneRm],
  );

  return (
    <main className={styles.page}>
      <div className={`${styles.header}${scrolled ? ` ${styles.headerScrolled}` : ''}`}>
        <div className={styles.headerInner}>
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            Back
          </Button>
          <h1 className={styles.headerTitle}>1RM</h1>
          <div className={styles.headerSpacer} />
        </div>
      </div>

      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.formTitle}>
            {editing ? 'Edit 1RM' : 'Add 1RM'}
          </p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="exercise">
              Exercise
            </label>
            <select
              id="exercise"
              className={styles.select}
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              disabled={!!editing}
            >
              <option value="">Select an exercise</option>
              {availableExercises.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modeSwitch}>
            <button
              type="button"
              className={`${styles.modeButton}${mode === 'direct' ? ` ${styles.modeButtonActive}` : ''}`}
              onClick={() => setMode('direct')}
            >
              Enter 1RM
            </button>
            <button
              type="button"
              className={`${styles.modeButton}${mode === 'epley' ? ` ${styles.modeButtonActive}` : ''}`}
              onClick={() => setMode('epley')}
            >
              Calculate (Epley)
            </button>
          </div>

          {mode === 'direct' ? (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="oneRm">
                1RM, kg
              </label>
              <Input
                id="oneRm"
                type="number"
                min={0}
                step={0.5}
                value={directOneRm}
                onChange={(e) => setDirectOneRm(e.target.value)}
                placeholder="100"
              />
            </div>
          ) : (
            <>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="weight">
                    Weight, kg
                  </label>
                  <Input
                    id="weight"
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="next"
                    value={weight}
                    onChange={(e) => {
                      const raw = e.target.value.replace(',', '.').replace(/[^\d.]/g, '');
                      setWeight(raw);
                    }}
                    placeholder="80"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reps">
                    Reps
                  </label>
                  <Input
                    id="reps"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    enterKeyHint="done"
                    value={reps}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setReps(raw);
                    }}
                    placeholder="5"
                  />
                </div>
              </div>
              <p className={styles.preview}>
                1RM = weight × (1 + reps / 30)
                {calculated > 0 && (
                  <>
                    {' → '}
                    <span className={styles.previewValue}>
                      {formatOneRm(calculated)} kg
                    </span>
                  </>
                )}
              </p>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formActions}>
            {editing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : editing ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>

        <div>
          <p className={styles.listTitle}>Saved 1RM</p>
          {sortedOneRm.length === 0 ? (
            <p className={styles.emptyHint}>No entries yet</p>
          ) : (
            <div className={styles.list}>
              {sortedOneRm.map((entry) => (
                <div key={entry.id} className={styles.listItem}>
                  <div className={styles.listItemInfo}>
                    <span className={styles.listItemName}>{entry.exerciseName}</span>
                    <span className={styles.listItemValue}>
                      1RM: {formatOneRm(entry.oneRm)} kg
                    </span>
                  </div>
                  <div className={styles.listItemActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => startEdit(entry)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
