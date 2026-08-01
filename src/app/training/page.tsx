'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Timer } from '@/components/timer';
import { ExerciseCard } from '@/components/exercise-card';
import { ExerciseNameDialog } from '@/components/exercise-name-dialog';
import { useTrainingStore } from '@/lib/store';
import styles from './training.module.scss';

export default function TrainingPage() {
  const router = useRouter();
  const isActive = useTrainingStore((s) => s.isActive);
  const startTime = useTrainingStore((s) => s.startTime);
  const exercises = useTrainingStore((s) => s.exercises);
  const addExercise = useTrainingStore((s) => s.addExercise);
  const removeExercise = useTrainingStore((s) => s.removeExercise);
  const addSet = useTrainingStore((s) => s.addSet);
  const removeSet = useTrainingStore((s) => s.removeSet);
  const updateSet = useTrainingStore((s) => s.updateSet);
  const finishTraining = useTrainingStore((s) => s.finishTraining);
  const saveTrainingToServer = useTrainingStore((s) => s.saveTrainingToServer);
  const customExercises = useTrainingStore((s) => s.customExercises);
  const oneRmList = useTrainingStore((s) => s.oneRm);
  const [hydrated, setHydrated] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = useTrainingStore.persist.onFinishHydration(() => {
      queueMicrotask(() => setHydrated(true));
    });
    if (useTrainingStore.persist.hasHydrated()) {
      queueMicrotask(() => setHydrated(true));
    }
    return unsub;
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (hydrated && !isActive && !startTime) {
      router.replace('/');
    }
  }, [hydrated, isActive, startTime, router]);

  const handleFinish = async () => {
    const training = finishTraining();
    if (training) {
      saveTrainingToServer(training);
      router.push('/history');
    }
  };

  const handleAddExercise = () => {
    setShowDialog(true);
  };

  const handleDialogConfirm = (name: string) => {
    addExercise(name);
    const exercises = useTrainingStore.getState().exercises;
    const newId = exercises[exercises.length - 1]?.id;
    if (newId) addSet(newId);
    setShowDialog(false);
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  };

  if (!hydrated || (!isActive && !startTime)) return null;

  return (
    <main className={styles.page}>
      <div className='container'>
          <div className={`${styles.header}${scrolled ? ` ${styles.headerScrolled}` : ''}`}>
            <div className={styles.headerInner}>
              <Timer isRunning={true} startTimeMs={startTime} />
              <span className={styles.tonnage}>
                Tonnage: {exercises.reduce(
                  (sum, e) => sum + e.sets.reduce((s, set) => s + set.reps * set.weight, 0),
                  0,
                )} kg
              </span>
            </div>
          </div>

        <div className={styles.exerciseList}>
          {exercises.length === 0 ? (
              <div className={styles.emptyState}>
                Tap “+ Add exercise” to get started
              </div>
          ) : (
              exercises.map((exercise) => (
                  <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      oneRm={
                        oneRmList.find((e) => e.exerciseName === exercise.name)?.oneRm
                        ?? null
                      }
                      onAddSet={() => addSet(exercise.id)}
                      onRemove={() => removeExercise(exercise.id)}
                      onUpdateSet={(setId, field, value) =>
                          updateSet(exercise.id, setId, field, value)
                      }
                      onRemoveSet={(setId) => removeSet(exercise.id, setId)}
                  />
              ))
          )}
        </div>

        <div className={styles.fixedBottom}>
            <div className={styles.fixedBottomInner}>
              <Button
                  onClick={handleAddExercise}
                  className={styles.addButton}
              >
                + Add exercise
              </Button>
              <Button
                  onClick={handleFinish}
                  className={styles.addButton}
                  style={{ marginTop: '0.5rem' }}
              >
                Finish
              </Button>
          </div>
        </div>
      </div>

      {showDialog && (
        <ExerciseNameDialog
          onConfirm={handleDialogConfirm}
          onClose={() => setShowDialog(false)}
          customExercises={customExercises}
        />
      )}
    </main>
  );
}
