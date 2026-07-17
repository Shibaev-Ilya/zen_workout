export const PREDEFINED_EXERCISES = [
  'Жим лёжа',
  'Приседания со штангой',
  'Становая тяга',
  'Армейский жим',
  'Тяга штанги в наклоне',
  'Подтягивания',
  'Отжимания на брусьях',
  'Жим гантелей сидя',
  'Тяга верхнего блока',
  'Французский жим',
  'Сгибание рук со штангой',
  'Жим ногами',
  'Разгибание ног в тренажёре',
  'Скручивания',
  'Гиперэкстензия',
] as const;

export function getAvailableExercises(customExercises: string[]): string[] {
  const predefined = new Set<string>(PREDEFINED_EXERCISES);
  const custom = customExercises.filter((name) => !predefined.has(name));
  return [...PREDEFINED_EXERCISES, ...custom];
}

/** Формула Эпли (Epley, 1985): 1RM = вес × (1 + повторения / 30) */
export function calculateEpleyOneRm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function formatOneRm(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
