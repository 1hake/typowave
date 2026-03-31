export type AudioBand = "bass" | "mids" | "highs" | "volume";
export type ReactProperty = "scale" | "letterSpacing" | "opacity" | "x" | "y" | "blur" | "rotate";

export interface AudioReaction {
  band: AudioBand;
  property: ReactProperty;
  intensity: number; // 0 to 1
  invert?: boolean;
}

export interface TextBlock {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // px
  fontWeight: number;
  fontFamily: "sans" | "mono";
  letterSpacing: number; // em
  lineHeight: number;
  textTransform: "none" | "uppercase" | "lowercase";
  opacity: number;
  color: string;
  maxWidth?: number; // percentage 0-100
  reactions: AudioReaction[];
}

export interface Scene {
  id: string;
  name: string;
  bgColor: string;
  textColor: string; // default color for blocks
  blocks: TextBlock[];
}

export interface TypowaveConfig {
  scenes: Scene[];
  activeSceneIndex: number;
  sensitivity: number;
  smoothing: number;
  autoTransition: boolean;
  transitionInterval: number; // seconds
}

let blockCounter = 0;
export function makeBlockId(): string {
  return `blk_${Date.now()}_${blockCounter++}`;
}

export function createDefaultBlock(partial?: Partial<TextBlock>): TextBlock {
  return {
    id: makeBlockId(),
    text: "TEXT",
    x: 50,
    y: 50,
    fontSize: 48,
    fontWeight: 900,
    fontFamily: "sans",
    letterSpacing: 0,
    lineHeight: 1.0,
    textTransform: "uppercase",
    opacity: 1,
    color: "#000000",
    reactions: [],
    ...partial,
  };
}

// ── Preset scenes inspired by reference images ──

const SCENE_CHAOS: Scene = {
  id: "scene_chaos",
  name: "CHAOS",
  bgColor: "#f0ede8",
  textColor: "#0a0a0a",
  blocks: [
    createDefaultBlock({ text: "( version1_new )", x: 3, y: 3, fontSize: 14, fontWeight: 400, fontFamily: "mono", letterSpacing: 0.05, reactions: [{ band: "highs", property: "opacity", intensity: 0.4 }] }),
    createDefaultBlock({ text: "CHAOS", x: 3, y: 10, fontSize: 110, fontWeight: 900, letterSpacing: 0.08, reactions: [{ band: "bass", property: "letterSpacing", intensity: 0.8 }, { band: "bass", property: "scale", intensity: 0.3 }] }),
    createDefaultBlock({ text: "SOCIAL\nCREATIVE\nBRAND", x: 3, y: 26, fontSize: 13, fontWeight: 700, letterSpacing: 0.02, lineHeight: 1.5, reactions: [{ band: "mids", property: "opacity", intensity: 0.5 }] }),
    createDefaultBlock({ text: "DIRECTION\nIDENTITY", x: 30, y: 26, fontSize: 13, fontWeight: 700, letterSpacing: 0.02, lineHeight: 1.5, reactions: [{ band: "mids", property: "x", intensity: 0.3 }] }),
    createDefaultBlock({ text: "TONE\nOF\nVOICE", x: 55, y: 26, fontSize: 13, fontWeight: 700, letterSpacing: 0.02, lineHeight: 1.5, reactions: [] }),
    createDefaultBlock({ text: "MEDIA\nPRINT", x: 78, y: 26, fontSize: 13, fontWeight: 700, letterSpacing: 0.02, lineHeight: 1.5, reactions: [{ band: "highs", property: "opacity", intensity: 0.5 }] }),
    createDefaultBlock({ text: "(38)", x: 6, y: 42, fontSize: 72, fontWeight: 400, fontFamily: "sans", letterSpacing: -0.02, reactions: [{ band: "bass", property: "scale", intensity: 0.5 }] }),
    createDefaultBlock({ text: "untitled_01.ai\nuntitled_02.ai", x: 58, y: 38, fontSize: 13, fontWeight: 400, fontFamily: "mono", letterSpacing: 0.02, lineHeight: 1.6, reactions: [{ band: "highs", property: "blur", intensity: 0.6 }] }),
    createDefaultBlock({ text: "SIZE: 3  390 655 538 bytes for", x: 3, y: 54, fontSize: 12, fontWeight: 400, fontFamily: "mono", reactions: [{ band: "mids", property: "letterSpacing", intensity: 0.4 }] }),
    createDefaultBlock({ text: "( 3 8 )   items", x: 55, y: 54, fontSize: 12, fontWeight: 400, fontFamily: "mono", reactions: [] }),
    createDefaultBlock({ text: "CREATED: 8 Nov 2022      08:49\nMODIFIED: 8 Nov 2022      10:11", x: 3, y: 59, fontSize: 12, fontWeight: 400, fontFamily: "mono", lineHeight: 1.8, reactions: [{ band: "mids", property: "opacity", intensity: 0.3 }] }),
    createDefaultBlock({ text: "proposal_final.pdf", x: 1, y: 78, fontSize: 11, fontWeight: 400, fontFamily: "mono", reactions: [{ band: "highs", property: "opacity", intensity: 0.5 }] }),
    createDefaultBlock({ text: "(            )", x: 28, y: 72, fontSize: 100, fontWeight: 300, letterSpacing: -0.02, reactions: [{ band: "bass", property: "scale", intensity: 0.4 }, { band: "bass", property: "rotate", intensity: 0.2 }] }),
    createDefaultBlock({ text: "( No. 08 - new )", x: 56, y: 82, fontSize: 13, fontWeight: 400, fontFamily: "mono", reactions: [{ band: "highs", property: "x", intensity: 0.3 }] }),
    createDefaultBlock({ text: "THE\nBEGIN", x: 3, y: 90, fontSize: 16, fontWeight: 900, letterSpacing: 0.02, lineHeight: 1.3, reactions: [{ band: "bass", property: "y", intensity: 0.2 }] }),
    createDefaultBlock({ text: "MOST\nIN", x: 22, y: 90, fontSize: 16, fontWeight: 900, letterSpacing: 0.02, lineHeight: 1.3, reactions: [] }),
    createDefaultBlock({ text: "BEAUTIFUL", x: 45, y: 90, fontSize: 16, fontWeight: 900, letterSpacing: 0.02, reactions: [{ band: "mids", property: "letterSpacing", intensity: 0.5 }] }),
    createDefaultBlock({ text: "THINGS\nCHAOS", x: 75, y: 90, fontSize: 16, fontWeight: 900, letterSpacing: 0.02, lineHeight: 1.3, reactions: [{ band: "bass", property: "scale", intensity: 0.3 }] }),
  ],
};

const SCENE_PORTFOLIO: Scene = {
  id: "scene_portfolio",
  name: "PORTFOLIO",
  bgColor: "#ffffff",
  textColor: "#0a0a0a",
  blocks: [
    createDefaultBlock({ text: "COTURE\nPORTFOLIO\nARCHIVE 0024", x: 3, y: 4, fontSize: 42, fontWeight: 900, letterSpacing: -0.01, lineHeight: 1.1, reactions: [{ band: "bass", property: "letterSpacing", intensity: 0.5 }] }),
    createDefaultBlock({ text: "SELECTED WORKS\n2022\u20132025\nDESIGN\nPHOTOGRAPHY\nTYPOGRAPHY\nLAYOUT", x: 3, y: 32, fontSize: 36, fontWeight: 900, letterSpacing: -0.01, lineHeight: 1.15, reactions: [{ band: "bass", property: "scale", intensity: 0.2 }, { band: "mids", property: "letterSpacing", intensity: 0.4 }] }),
    createDefaultBlock({ text: "RELEASED ON\n22.04. 2025", x: 3, y: 82, fontSize: 42, fontWeight: 900, letterSpacing: -0.01, lineHeight: 1.1, reactions: [{ band: "bass", property: "y", intensity: 0.3 }] }),
    createDefaultBlock({ text: "No. 024", x: 85, y: 4, fontSize: 12, fontWeight: 400, fontFamily: "mono", reactions: [{ band: "highs", property: "opacity", intensity: 0.6 }] }),
    createDefaultBlock({ text: "CREATIVE DIRECTION\nART & DESIGN\nEDITORIAL", x: 70, y: 40, fontSize: 11, fontWeight: 400, fontFamily: "mono", lineHeight: 1.8, letterSpacing: 0.05, reactions: [{ band: "mids", property: "opacity", intensity: 0.4 }] }),
    createDefaultBlock({ text: "\u2014", x: 70, y: 52, fontSize: 24, fontWeight: 100, reactions: [{ band: "bass", property: "letterSpacing", intensity: 1.0 }] }),
  ],
};

const SCENE_BOUNDARIES: Scene = {
  id: "scene_boundaries",
  name: "BOUNDARIES",
  bgColor: "#f5f5f5",
  textColor: "#0a0a0a",
  blocks: [
    createDefaultBlock({ text: "BOUNDARIES\nBETWEEN", x: 3, y: 3, fontSize: 64, fontWeight: 900, letterSpacing: -0.02, lineHeight: 1.05, reactions: [{ band: "bass", property: "letterSpacing", intensity: 0.6 }] }),
    createDefaultBlock({ text: "FASHION\n& ART", x: 40, y: 18, fontSize: 64, fontWeight: 900, letterSpacing: -0.02, lineHeight: 1.05, reactions: [{ band: "bass", property: "scale", intensity: 0.3 }] }),
    createDefaultBlock({ text: "Curated by\nChroma Studio", x: 5, y: 36, fontSize: 11, fontWeight: 400, fontFamily: "mono", lineHeight: 1.6, letterSpacing: 0.02, reactions: [{ band: "highs", property: "opacity", intensity: 0.5 }] }),
    createDefaultBlock({ text: "HAVE\nBECOME\nBLURRED", x: 3, y: 46, fontSize: 72, fontWeight: 900, letterSpacing: -0.02, lineHeight: 1.05, reactions: [{ band: "bass", property: "letterSpacing", intensity: 0.7 }, { band: "mids", property: "blur", intensity: 0.5 }] }),
    createDefaultBlock({ text: "18\u201324*", x: 3, y: 76, fontSize: 56, fontWeight: 900, letterSpacing: -0.02, reactions: [{ band: "bass", property: "scale", intensity: 0.4 }] }),
    createDefaultBlock({ text: "MMA\nCHROMA\n& BLST 02", x: 55, y: 78, fontSize: 42, fontWeight: 900, letterSpacing: -0.01, lineHeight: 1.1, reactions: [{ band: "mids", property: "x", intensity: 0.3 }] }),
    createDefaultBlock({ text: "Author\nEmily Harper", x: 3, y: 94, fontSize: 10, fontWeight: 400, fontFamily: "mono", lineHeight: 1.6, letterSpacing: 0.02, reactions: [{ band: "highs", property: "opacity", intensity: 0.4 }] }),
  ],
};

const SCENE_STUDIO: Scene = {
  id: "scene_studio",
  name: "STUDIO",
  bgColor: "#0a0a0a",
  textColor: "#f0ede8",
  blocks: [
    createDefaultBlock({ text: "SOUND", x: 5, y: 8, fontSize: 120, fontWeight: 900, letterSpacing: 0.1, color: "#f0ede8", reactions: [{ band: "bass", property: "letterSpacing", intensity: 1.0 }, { band: "bass", property: "scale", intensity: 0.3 }] }),
    createDefaultBlock({ text: "& VISION", x: 50, y: 25, fontSize: 80, fontWeight: 100, letterSpacing: 0.15, color: "#f0ede8", reactions: [{ band: "mids", property: "letterSpacing", intensity: 0.6 }] }),
    createDefaultBlock({ text: "FREQ: ████████░░░░", x: 5, y: 45, fontSize: 13, fontWeight: 400, fontFamily: "mono", letterSpacing: 0.08, color: "#555555", reactions: [{ band: "bass", property: "opacity", intensity: 0.8 }] }),
    createDefaultBlock({ text: "AMP: ██████░░░░░░░", x: 5, y: 49, fontSize: 13, fontWeight: 400, fontFamily: "mono", letterSpacing: 0.08, color: "#555555", reactions: [{ band: "mids", property: "opacity", intensity: 0.8 }] }),
    createDefaultBlock({ text: "HI:  ████░░░░░░░░░", x: 5, y: 53, fontSize: 13, fontWeight: 400, fontFamily: "mono", letterSpacing: 0.08, color: "#555555", reactions: [{ band: "highs", property: "opacity", intensity: 0.8 }] }),
    createDefaultBlock({ text: "WAVE\nFORM\nANALYSIS", x: 70, y: 50, fontSize: 14, fontWeight: 700, letterSpacing: 0.15, lineHeight: 1.5, color: "#444444", reactions: [{ band: "mids", property: "opacity", intensity: 0.5 }] }),
    createDefaultBlock({ text: "001", x: 92, y: 4, fontSize: 12, fontWeight: 400, fontFamily: "mono", color: "#333333", reactions: [{ band: "highs", property: "opacity", intensity: 0.6 }] }),
    createDefaultBlock({ text: "LISTEN", x: 5, y: 70, fontSize: 100, fontWeight: 900, letterSpacing: -0.02, color: "#f0ede8", reactions: [{ band: "bass", property: "y", intensity: 0.3 }, { band: "bass", property: "blur", intensity: 0.3 }] }),
    createDefaultBlock({ text: "( NOW PLAYING )", x: 5, y: 88, fontSize: 14, fontWeight: 400, fontFamily: "mono", letterSpacing: 0.2, color: "#666666", reactions: [{ band: "volume", property: "opacity", intensity: 0.6 }] }),
    createDefaultBlock({ text: "\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014", x: 5, y: 92, fontSize: 14, fontWeight: 100, color: "#222222", reactions: [{ band: "bass", property: "letterSpacing", intensity: 1.0 }] }),
  ],
};

const SCENE_MINIMAL: Scene = {
  id: "scene_minimal",
  name: "MINIMAL",
  bgColor: "#ffffff",
  textColor: "#0a0a0a",
  blocks: [
    createDefaultBlock({ text: "A", x: 10, y: 15, fontSize: 200, fontWeight: 100, letterSpacing: 0, color: "#0a0a0a", reactions: [{ band: "bass", property: "scale", intensity: 0.5 }] }),
    createDefaultBlock({ text: "AUDIO", x: 30, y: 30, fontSize: 14, fontWeight: 400, fontFamily: "mono", letterSpacing: 0.3, color: "#999999", reactions: [{ band: "mids", property: "letterSpacing", intensity: 0.8 }] }),
    createDefaultBlock({ text: "\u2022", x: 50, y: 50, fontSize: 8, fontWeight: 400, color: "#0a0a0a", reactions: [{ band: "bass", property: "scale", intensity: 3.0 }] }),
    createDefaultBlock({ text: "REACTIVE", x: 55, y: 65, fontSize: 14, fontWeight: 400, fontFamily: "mono", letterSpacing: 0.3, color: "#999999", reactions: [{ band: "highs", property: "letterSpacing", intensity: 0.8 }] }),
    createDefaultBlock({ text: "Z", x: 70, y: 60, fontSize: 200, fontWeight: 100, letterSpacing: 0, color: "#0a0a0a", reactions: [{ band: "bass", property: "scale", intensity: 0.5 }, { band: "mids", property: "rotate", intensity: 0.3 }] }),
    createDefaultBlock({ text: "2025", x: 90, y: 94, fontSize: 10, fontWeight: 400, fontFamily: "mono", color: "#cccccc", reactions: [] }),
  ],
};

export const PRESET_SCENES: Scene[] = [
  SCENE_CHAOS,
  SCENE_PORTFOLIO,
  SCENE_BOUNDARIES,
  SCENE_STUDIO,
  SCENE_MINIMAL,
];

export const DEFAULT_CONFIG: TypowaveConfig = {
  scenes: [...PRESET_SCENES],
  activeSceneIndex: 0,
  sensitivity: 1.5,
  smoothing: 0.82,
  autoTransition: false,
  transitionInterval: 30,
};

const STORAGE_KEY = "typowave-config";

export function loadConfig(): TypowaveConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_CONFIG;
}

export function saveConfig(config: TypowaveConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
