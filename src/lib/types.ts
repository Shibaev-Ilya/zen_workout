export interface Set {
  id: string;
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface CompletedTraining {
  id: string;
  exercises: Exercise[];
  duration: number;
  completedAt: string;
}

export interface OneRmEntry {
  id: string;
  exerciseName: string;
  oneRm: number;
  updatedAt: string;
}

export interface TrainingStore {
  exercises: Exercise[];
  startTime: number | null;
  isActive: boolean;
  history: CompletedTraining[];
  customExercises: string[];
  oneRm: OneRmEntry[];
  token: string | null;
  login: string | null;
  guestMode: boolean;
  serverAvailable: boolean;

  startTraining: () => void;
  finishTraining: () => CompletedTraining | null;
  addExercise: (name?: string) => void;
  addCustomExercise: (name: string) => void;
  removeExercise: (id: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateExerciseName: (id: string, name: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: number,
  ) => void;

  setToken: (token: string | null) => void;
  setServerAvailable: (available: boolean) => void;
  loadFromServer: () => Promise<void>;
  saveTrainingToServer: (training: CompletedTraining) => Promise<void>;
  deleteTraining: (id: string) => Promise<void>;
  saveOneRm: (exerciseName: string, oneRm: number) => Promise<void>;
  deleteOneRm: (id: string) => Promise<void>;
  getOneRmForExercise: (exerciseName: string) => number | null;
  register: (login: string, password: string) => Promise<void>;
  loginUser: (login: string, password: string) => Promise<void>;
  enterGuestMode: () => void;
  logout: () => void;
}
