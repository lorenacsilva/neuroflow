import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTasks, Task, trustedContact as defaultTrustedContact, calmingThings as defaultCalming, phaseTrack } from '../data/mock';

export type Mood = 'tranquilo' | 'agitado' | 'dificil' | null;

export type CrisisAttempt = { id: string; date: string; worked: boolean };

export type CrisisCategory = 'sensorial' | 'emocional';
export type CrisisSession = { category: CrisisCategory; step: number } | null;

export type AppState = {
  hasOnboarded: boolean;
  parentName: string;
  childName: string;
  childAge: number;
  diagnoses: string[];
  calmingThings: string[];
  trustedContact: { name: string; relation: string; phone: string } | null;
  tasks: Task[];
  mood: Mood;
  plan: 'base' | 'plus';
  phase: typeof phaseTrack;
  crisisAttempts: CrisisAttempt[];
  hasFirstTask: boolean; // false -> Home shows the empty 3b state
  crisisSession: CrisisSession; // set while inside the step guide, cleared on resolution
  simulateOffline: boolean; // Accessibility demo toggle -> Crisis step guide shows the offline variant (5f)
  phaseAttempts: number; // attempts registered on the current phase step (6b/6c)
};

const STORAGE_KEY = 'vita.demo.v1';

const initialState: AppState = {
  hasOnboarded: false,
  parentName: 'Camila',
  childName: 'Téo',
  childAge: 7,
  diagnoses: ['TDAH'],
  calmingThings: defaultCalming,
  trustedContact: null,
  tasks: [],
  mood: null,
  plan: 'base',
  phase: phaseTrack,
  crisisAttempts: [],
  hasFirstTask: false,
  crisisSession: null,
  simulateOffline: false,
  phaseAttempts: 4,
};

type Ctx = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  toggleTask: (id: string) => void;
  addTask: (label: string, time: string) => void;
  setMood: (m: Mood) => void;
  completeOnboarding: (patch?: Partial<AppState>) => void;
  addCrisisAttempt: (worked: boolean) => void;
  registerPhaseAttempt: (advanced: boolean) => void;
  setCrisisSession: (s: CrisisSession) => void;
  resetDemo: () => void;
  loaded: boolean;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...initialState, ...JSON.parse(raw) });
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const toggleTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  }, []);

  const addTask = useCallback((label: string, time: string) => {
    setState((s) => ({
      ...s,
      hasFirstTask: true,
      tasks: [...s.tasks, { id: `t${Date.now()}`, label, time, done: false }],
    }));
  }, []);

  const setMood = useCallback((m: Mood) => {
    setState((s) => ({ ...s, mood: m }));
  }, []);

  const completeOnboarding = useCallback((patch?: Partial<AppState>) => {
    setState((s) => ({ ...s, hasOnboarded: true, ...patch }));
  }, []);

  const addCrisisAttempt = useCallback((worked: boolean) => {
    setState((s) => ({
      ...s,
      crisisAttempts: [...s.crisisAttempts, { id: `a${Date.now()}`, date: new Date().toISOString(), worked }],
    }));
  }, []);

  const registerPhaseAttempt = useCallback((advanced: boolean) => {
    setState((s) => ({
      ...s,
      phaseAttempts: advanced ? 1 : s.phaseAttempts + 1,
      phase: advanced && s.phase.stepIndex < s.phase.stepTotal ? { ...s.phase, stepIndex: s.phase.stepIndex + 1 } : s.phase,
    }));
  }, []);

  const setCrisisSession = useCallback((cs: CrisisSession) => {
    setState((s) => ({ ...s, crisisSession: cs }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(initialState);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ state, setState, toggleTask, addTask, setMood, completeOnboarding, addCrisisAttempt, registerPhaseAttempt, setCrisisSession, resetDemo, loaded }),
    [state, loaded, toggleTask, addTask, setMood, completeOnboarding, addCrisisAttempt, registerPhaseAttempt, setCrisisSession, resetDemo]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { defaultTasks };
