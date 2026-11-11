import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { scenes, sectionOrder } from '../script/scenes';
import type {
  BacklogEntry,
  BgId,
  GameState,
  Mood,
  Scene,
  SceneId,
  SectionId,
  Settings,
} from './types';

const BACKLOG_CAP = 200;

const DEFAULT_SETTINGS: Settings = { textSpeed: 45, effects: true, sound: false };

/** localStorage wrapper that never throws (private mode, blocked storage). */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export type GameStore = GameState & { seenPrologue: boolean };

const isSection = (id: SceneId): id is SectionId => (sectionOrder as SceneId[]).includes(id);

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: 'menu',
      overlay: null,
      sceneId: 'prologue',
      lineIndex: 0,
      visited: [],
      backlog: [],
      settings: { ...DEFAULT_SETTINGS },
      auto: false,
      skipping: false,
      hackMode: false,
      seenPrologue: false,

      currentScene: (): Scene => scenes[get().sceneId],

      currentLine: () => {
        const scene = scenes[get().sceneId];
        return scene.lines[get().lineIndex] ?? scene.lines[scene.lines.length - 1];
      },

      stageView: (): { bg: BgId; mood: Mood } => {
        const s = get();
        switch (s.screen) {
          case 'menu':
            return { bg: 'road_day', mood: 'day' };
          case 'hub':
            return { bg: 'square_day', mood: 'day' };
          case 'cv':
          case 'gallery':
            return { bg: 'beach_day', mood: 'day' };
          case 'play': {
            const scene = scenes[s.sceneId];
            let bg: BgId = scene.bg;
            let mood: Mood = scene.mood;
            const upto = Math.min(s.lineIndex, scene.lines.length - 1);
            for (let i = 0; i <= upto; i++) {
              const line = scene.lines[i];
              if (line.bg) bg = line.bg;
              if (line.mood) mood = line.mood;
            }
            return { bg, mood };
          }
        }
      },

      startGame: () => {
        if (get().seenPrologue) set({ screen: 'hub' });
        else get().playScene('prologue');
      },

      goMenu: () =>
        set({ screen: 'menu', overlay: null, auto: false, skipping: false, hackMode: false }),

      openScreen: (s) => set({ screen: s, overlay: null, hackMode: false }),

      setOverlay: (o) => set({ overlay: o }),

      playScene: (id) =>
        set({
          sceneId: id,
          lineIndex: 0,
          auto: false,
          skipping: false,
          screen: 'play',
          hackMode: id === 'secret',
        }),

      next: () => {
        const s = get();
        const scene = scenes[s.sceneId];
        const line = scene.lines[s.lineIndex];

        const entry: BacklogEntry | null = line ? { who: line.who, text: line.text } : null;
        const backlog = entry ? [...s.backlog, entry].slice(-BACKLOG_CAP) : s.backlog;

        if (s.lineIndex + 1 < scene.lines.length) {
          set({ backlog, lineIndex: s.lineIndex + 1 });
          return;
        }

        // End of scene.
        const base = { backlog, lineIndex: s.lineIndex, auto: false, skipping: false };
        if (isSection(s.sceneId)) {
          const visited = s.visited.includes(s.sceneId) ? s.visited : [...s.visited, s.sceneId];
          set({ ...base, visited, screen: 'hub' });
        } else if (s.sceneId === 'prologue') {
          set({ ...base, seenPrologue: true, screen: 'hub' });
        } else if (s.sceneId === 'ending') {
          set({ ...base, screen: 'menu' });
        } else if (s.sceneId === 'secret') {
          set({ ...base, hackMode: false, screen: 'hub' });
        }
      },

      back: () => {
        const { lineIndex } = get();
        if (lineIndex > 0) set({ lineIndex: lineIndex - 1 });
      },

      toggleAuto: () => {
        const auto = !get().auto;
        set({ auto, skipping: auto ? false : get().skipping });
      },

      toggleSkip: () => {
        const skipping = !get().skipping;
        set({ skipping, auto: skipping ? false : get().auto });
      },

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      triggerSecret: () => {
        get().playScene('secret');
      },

      resetProgress: () => set({ visited: [], seenPrologue: false, backlog: [] }),
    }),
    {
      name: 'metaxxd-vn-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ visited: s.visited, settings: s.settings, seenPrologue: s.seenPrologue }),
    },
  ),
);
