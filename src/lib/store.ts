'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { TrainingStore, CompletedTraining } from './types';
import {
  fetchTrainings as apiFetchTrainings,
  saveTraining as apiSaveTraining,
  deleteTraining as apiDeleteTraining,
  registerUser as apiRegisterUser,
  loginUser as apiLoginUser,
  fetchOneRm as apiFetchOneRm,
  saveOneRm as apiSaveOneRm,
  deleteOneRm as apiDeleteOneRm,
} from './api';

if (typeof window !== 'undefined') {
  const oldKey = 'training-storage';
  const newKey = 'training-storage-v2';
  const oldData = localStorage.getItem(oldKey);
  const newData = localStorage.getItem(newKey);
  if (oldData && !newData) {
    try {
      const parsed = JSON.parse(oldData);
      const state = parsed?.state ?? parsed;
      if (state && typeof state === 'object') {
        localStorage.setItem(newKey, JSON.stringify(state));
      }
    } catch {
      // ignore migration errors
    }
    localStorage.removeItem(oldKey);
  }
}

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      exercises: [],
      startTime: null,
      isActive: false,
      history: [],
      customExercises: [],
      oneRm: [],
      token: null,
      login: null,
      guestMode: false,
      serverAvailable: true,

      startTraining: () => {
        set({
          exercises: [],
          startTime: Date.now(),
          isActive: true,
        });
      },

      finishTraining: () => {
        const state = get();
        if (!state.startTime) return null;

        const exercises = state.exercises.filter(
          (e) => e.name.trim().length > 0 && e.sets.some((s) => s.reps > 0),
        );

        if (exercises.length === 0) {
          set({
            exercises: [],
            startTime: null,
            isActive: false,
          });
          return null;
        }

        const duration = Math.floor((Date.now() - state.startTime) / 1000);
        const training: CompletedTraining = {
          id: uuidv4(),
          exercises,
          duration,
          completedAt: new Date().toISOString(),
        };

        const existingCustom = new Set(state.customExercises);
        const newNames = exercises
          .map((e) => e.name)
          .filter((n) => !existingCustom.has(n));

        set({
          exercises: [],
          startTime: null,
          isActive: false,
          history: [training, ...state.history],
          customExercises: [...state.customExercises, ...newNames],
        });

        return training;
      },

      addExercise: (name?: string) => {
        const newExercise = {
          id: uuidv4(),
          name: name ?? '',
          sets: [],
        };
        set((state) => ({
          exercises: [...state.exercises, newExercise],
        }));
      },

      addCustomExercise: (name: string) => {
        set((state) => {
          if (state.customExercises.includes(name)) return state;
          return { customExercises: [...state.customExercises, name] };
        });
      },

      removeExercise: (id: string) => {
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
        }));
      },

      addSet: (exerciseId: string) => {
        const newSet = {
          id: uuidv4(),
          reps: 0,
          weight: 0,
        };
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === exerciseId
              ? { ...e, sets: [...e.sets, newSet] }
              : e,
          ),
        }));
      },

      removeSet: (exerciseId: string, setId: string) => {
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === exerciseId
              ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
              : e,
          ),
        }));
      },

      updateExerciseName: (id: string, name: string) => {
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === id ? { ...e, name } : e,
          ),
        }));
      },

      updateSet: (
        exerciseId: string,
        setId: string,
        field: 'reps' | 'weight',
        value: number,
      ) => {
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === exerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.id === setId ? { ...s, [field]: value } : s,
                  ),
                }
              : e,
          ),
        }));
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      setServerAvailable: (available: boolean) => {
        set({ serverAvailable: available });
      },

      logout: () => {
        set({
          token: null,
          login: null,
          guestMode: false,
          history: [],
          customExercises: [],
          oneRm: [],
          exercises: [],
          startTime: null,
          isActive: false,
          serverAvailable: true,
        });
      },

      enterGuestMode: () => {
        set({
          guestMode: true,
          token: null,
          login: null,
          serverAvailable: false,
        });
      },

      getOneRmForExercise: (exerciseName: string) => {
        const entry = get().oneRm.find((e) => e.exerciseName === exerciseName);
        return entry ? entry.oneRm : null;
      },

      loadFromServer: async () => {
        const { token, guestMode, logout } = get();
        if (!token || guestMode) return;

        const [trainingsRes, oneRmRes] = await Promise.all([
          apiFetchTrainings(token),
          apiFetchOneRm(token),
        ]);

        if (trainingsRes.status === 401 || oneRmRes.status === 401) {
          logout();
          return;
        }

        if (trainingsRes.data) {
          set({
            history: trainingsRes.data.history,
            customExercises: trainingsRes.data.customExercises,
            ...(oneRmRes.data ? { oneRm: oneRmRes.data.oneRm } : {}),
            serverAvailable: true,
          });
        } else {
          set({ serverAvailable: false });
        }
      },

      saveOneRm: async (exerciseName: string, oneRmValue: number) => {
        const { token, guestMode, oneRm, logout } = get();
        const now = new Date().toISOString();
        const existing = oneRm.find((e) => e.exerciseName === exerciseName);
        const nextLocal: typeof oneRm = existing
          ? oneRm.map((e) =>
              e.exerciseName === exerciseName
                ? { ...e, oneRm: oneRmValue, updatedAt: now }
                : e,
            )
          : [
              ...oneRm,
              {
                id: uuidv4(),
                exerciseName,
                oneRm: oneRmValue,
                updatedAt: now,
              },
            ];

        set({ oneRm: nextLocal });

        if (!token || guestMode) return;

        const res = await apiSaveOneRm(token, exerciseName, oneRmValue);
        if (res.data) {
          set({ oneRm: res.data.oneRm, serverAvailable: true });
        } else if (res.status === 401) {
          logout();
        } else {
          set({ serverAvailable: false });
        }
      },

      deleteOneRm: async (id: string) => {
        const { token, guestMode, oneRm, logout } = get();
        set({ oneRm: oneRm.filter((e) => e.id !== id) });

        if (!token || guestMode) return;

        const res = await apiDeleteOneRm(token, id);
        if (res.data) {
          set({ oneRm: res.data.oneRm, serverAvailable: true });
        } else if (res.status === 401) {
          logout();
        } else {
          set({ serverAvailable: false });
        }
      },

      saveTrainingToServer: async (training: CompletedTraining) => {
        const { token, guestMode, logout } = get();
        if (!token || guestMode) return;

        const res = await apiSaveTraining(token, training);
        if (res.data) {
          set({ history: res.data.history, serverAvailable: true });
        } else if (res.status === 401) {
          logout();
        } else {
          set({ serverAvailable: false });
        }
      },

      deleteTraining: async (id: string) => {
        const { token, history, guestMode, logout } = get();
        const nextHistory = history.filter((t) => t.id !== id);
        set({ history: nextHistory });

        if (!token || guestMode) return;

        const res = await apiDeleteTraining(token, id);
        if (res.data) {
          set({ history: res.data.history, serverAvailable: true });
        } else if (res.status === 401) {
          logout();
        } else {
          set({ serverAvailable: false });
        }
      },

      register: async (login: string, password: string) => {
        const res = await apiRegisterUser(login, password);
        if (res.data) {
          set({
            token: res.data.token,
            login: res.data.login,
            guestMode: false,
            history: [],
            customExercises: [],
            oneRm: [],
            serverAvailable: true,
          });
          return;
        }
        set({ serverAvailable: res.error !== 'Network error' });
        throw new Error(res.error ?? 'Registration failed');
      },

      loginUser: async (login: string, password: string) => {
        const res = await apiLoginUser(login, password);
        if (res.data) {
          set({
            token: res.data.token,
            login: res.data.login,
            guestMode: false,
            serverAvailable: true,
          });
          await get().loadFromServer();
          return;
        }
        if (res.error === 'Network error') {
          set({ serverAvailable: false });
        }
        throw new Error(res.error ?? 'Login failed');
      },
    }),
    {
      name: 'training-storage-v2',
      partialize: (state) => ({
        exercises: state.exercises,
        startTime: state.startTime,
        isActive: state.isActive,
        token: state.token,
        login: state.login,
        guestMode: state.guestMode,
        history: state.history,
        customExercises: state.customExercises,
        oneRm: state.oneRm,
      }),
    },
  ),
);
