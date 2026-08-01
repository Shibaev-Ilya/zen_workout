'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { getAvailableExercises } from '@/lib/exercises';
import styles from './exercise-name-dialog.module.scss';

interface ExerciseNameDialogProps {
  onConfirm: (name: string) => void;
  onClose: () => void;
  customExercises: string[];
}

export function ExerciseNameDialog({ onConfirm, onClose, customExercises }: ExerciseNameDialogProps) {
  const [name, setName] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const allExercises = useMemo(
    () => getAvailableExercises(customExercises),
    [customExercises],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onConfirm(trimmed);
    }
  };

  const handleSelect = (exercise: string) => {
    onConfirm(exercise);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && activeIndex === -1) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, allExercises.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(allExercises[activeIndex]);
      return;
    }

    if (e.key === 'Escape') {
      onClose();
      return;
    }
  };

  const filtered = name.trim()
    ? allExercises.filter((e) => e.toLowerCase().includes(name.toLowerCase()))
    : allExercises;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className={styles.header}>
          <h2 className={styles.title}>New exercise</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className={styles.body}>
          <input
            ref={inputRef}
            className={styles.input}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setActiveIndex(-1);
            }}
            placeholder="Enter a name or pick from the list"
          />

          <ul className={styles.list} ref={listRef}>
            {filtered.map((exercise, i) => (
              <li
                key={exercise}
                className={`${styles.listItem} ${i === activeIndex ? styles.listItemActive : ''}`}
                onClick={() => handleSelect(exercise)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {exercise}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footer}>
          <Button
            variant="outline"
            className={styles.footerButton}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className={styles.footerButton}
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
