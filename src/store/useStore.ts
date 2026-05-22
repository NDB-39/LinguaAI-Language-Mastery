import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export type Message = { role: 'system' | 'user' | 'assistant', content: string };

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  targetLanguage: string;
  nativeLanguage: string;
  geminiApiKey: string;
  imageModelId: string;
  savedRoadmap: string | null;
  assistantHistory: Message[];
  teacherHistory: Message[];
  xpHistory?: { date: string, xp: number }[];
}

interface StoreState {
  progress: UserProgress;
  addXp: (amount: number) => void;
  setTargetLanguage: (lang: string) => void;
  setGeminiApiKey: (key: string) => void;
  setImageModelId: (modelId: string) => void;
  setSavedRoadmap: (roadmap: string | null) => void;
  incrementStreak: () => void;
  setAssistantHistory: (messages: Message[]) => void;
  setTeacherHistory: (messages: Message[]) => void;
  clearHistories: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      progress: {
        xp: 0,
        level: 1,
        streak: 1,
        targetLanguage: 'en',
        nativeLanguage: 'vi',
        geminiApiKey: '',
        imageModelId: 'flux',
        savedRoadmap: null,
        assistantHistory: [],
        teacherHistory: [],
      },
      addXp: (amount) => set((state) => {
        const newXp = state.progress.xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;
        
        const today = new Date().toISOString().split('T')[0];
        const history = state.progress.xpHistory || [];
        const todayEntryIndex = history.findIndex(entry => entry.date === today);
        let newHistory = [...history];
        
        if (todayEntryIndex >= 0) {
          newHistory[todayEntryIndex] = { ...newHistory[todayEntryIndex], xp: newHistory[todayEntryIndex].xp + amount };
        } else {
          newHistory.push({ date: today, xp: amount });
        }
        
        // Keep only the last 30 days of history to prevent unbounded growth
        if (newHistory.length > 30) {
          newHistory = newHistory.slice(-30);
        }

        return { progress: { ...state.progress, xp: newXp, level: newLevel, xpHistory: newHistory } };
      }),
      setTargetLanguage: (lang) => set((state) => ({
        progress: { ...state.progress, targetLanguage: lang }
      })),
      setGeminiApiKey: (key) => set((state) => ({
        progress: { ...state.progress, geminiApiKey: key }
      })),
      setImageModelId: (modelId) => set((state) => ({
        progress: { ...state.progress, imageModelId: modelId }
      })),
      setSavedRoadmap: (roadmap) => set((state) => ({
        progress: { ...state.progress, savedRoadmap: roadmap }
      })),
      incrementStreak: () => set((state) => ({
        progress: { ...state.progress, streak: state.progress.streak + 1 }
      })),
      setAssistantHistory: (messages) => set((state) => ({
        progress: { ...state.progress, assistantHistory: messages }
      })),
      setTeacherHistory: (messages) => set((state) => ({
        progress: { ...state.progress, teacherHistory: messages }
      })),
      clearHistories: () => set((state) => ({
        progress: { ...state.progress, assistantHistory: [], teacherHistory: [] }
      }))
    }),
    {
      name: 'lingua-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
