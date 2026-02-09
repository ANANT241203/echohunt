export type QuestStep = {
  id: number;
  description: string;
  target: string;
};

export type ScanResponse = {
  matched: boolean;
  confidence: number;
  short_hint: string;
  voice_line: string;
  overlay_mode: 'searching' | 'almost' | 'success';
  next_step_unlocked: boolean;
};

export type GameState = 'intro' | 'playing' | 'completed';

export const QUEST_STEPS: QuestStep[] = [
  { id: 1, description: "Scan visible text", target: "object with visible text" },
  { id: 2, description: "Scan a reflective surface", target: "reflective object like mirror, glass, or metal" },
  { id: 3, description: "Scan something red", target: "mostly red object" },
];