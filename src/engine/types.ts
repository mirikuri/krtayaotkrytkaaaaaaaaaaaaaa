// Shared contract for the visual-novel site. DO NOT change these signatures
// without updating every consumer (engine, stage, ui).

/** Backgrounds live in /public/bg as `${id}.webp` (1920w) and `${id}-sm.webp` (960w). */
export type BgId =
  | 'road_day'
  | 'bus_day'
  | 'square_day'
  | 'house_day'
  | 'club_day'
  | 'workshop'
  | 'beach_sunset'
  | 'beach_night'
  | 'road_dusk'
  | 'square_night'
  | 'beach_day';

/** Drives particles + colour mood on the stage. */
export type Mood = 'day' | 'sunset' | 'night' | 'dawn';

export type SectionId = 'about' | 'skills' | 'practice' | 'interests' | 'hobby' | 'goal';
export type SceneId = 'prologue' | SectionId | 'ending' | 'secret';

/**
 * Text markup: `[[word]]` marks a highlighted keyword. Nothing else is special.
 * Example: "Пишу на [[C]] и [[C++]] (смотрю на ошибки с уважением)".
 */
export type Markup = string;

export interface Line {
  /** Speaker name shown on the name plate; omit for narration. */
  who?: string;
  text: Markup;
  /** Switch background starting with this line. */
  bg?: BgId;
  mood?: Mood;
}

export interface Scene {
  id: SceneId;
  title: string;
  bg: BgId;
  mood: Mood;
  lines: Line[];
}

export interface ProfileSection {
  id: SectionId;
  title: string;
  /** Full résumé text of the block, with [[keyword]] markup. */
  body: Markup;
}

export interface Contact {
  label: string;
  href: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
}

export type Screen = 'menu' | 'play' | 'hub' | 'cv' | 'gallery';
export type Overlay = null | 'backlog' | 'settings' | 'credits';

export interface Settings {
  /** Characters per second for the typewriter; 0 = instant. */
  textSpeed: number;
  /** Particles + parallax on/off. */
  effects: boolean;
  sound: boolean;
}

export interface BacklogEntry {
  who?: string;
  text: Markup;
}

/** Zustand store shape, exported from src/engine/store.ts as `useGame`. */
export interface GameState {
  screen: Screen;
  overlay: Overlay;
  sceneId: SceneId;
  lineIndex: number;
  /** Sections whose scene has been read to the end. */
  visited: SectionId[];
  backlog: BacklogEntry[];
  settings: Settings;
  auto: boolean;
  skipping: boolean;
  /** True while the secret (Konami) scene effects should run. */
  hackMode: boolean;

  // derived helpers
  currentScene: () => Scene;
  currentLine: () => Line;
  /** Background + mood that the stage should show right now (menu/hub/cv included). */
  stageView: () => { bg: BgId; mood: Mood };

  // actions
  startGame: () => void; // menu -> prologue (or hub if prologue already seen)
  goMenu: () => void;
  openScreen: (s: Screen) => void;
  setOverlay: (o: Overlay) => void;
  playScene: (id: SceneId) => void;
  /** Advance one line; at scene end: prologue/section -> hub, ending -> menu, secret -> hub. */
  next: () => void;
  /** Step one line back inside the current scene (no-op at index 0). */
  back: () => void;
  toggleAuto: () => void;
  toggleSkip: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  triggerSecret: () => void;
  resetProgress: () => void;
}
