export const PREDEFINED_EXERCISES = [
  'Жим лёжа',
  'Жим лежа узким хватом',
  'Приседания со штангой',
  'Подтягивания',
  'Сгибание рук со штангой',
  'Становая тяга',
  'Тяга штанги в наклоне',
  'Отжимания на брусьях',
  'Французский жим',
] as const;

export function getAvailableExercises(customExercises: string[]): string[] {
  const predefined = new Set<string>(PREDEFINED_EXERCISES);
  const custom = customExercises.filter((name) => !predefined.has(name));
  return [...PREDEFINED_EXERCISES, ...custom];
}

/** Epley formula (1985): 1RM = weight × (1 + reps / 30) */
export function calculateEpleyOneRm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function formatOneRm(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
