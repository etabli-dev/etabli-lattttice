import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AiLevel,
  BoardState,
  Mark,
  Mode,
  Player,
  TOTAL_CELLS,
  ViewKind,
} from '../game/types';
import { applyMove, createEmptyBoard, isLegal } from '../game/rules';
import { log } from '../ui/logger';
import { ProbPoint, estimateProb, findTurningPoint, TurningPoint } from '../analysis/probability';
import { chooseEasyMove } from '../ai/easy';
import { chooseMediumMove } from '../ai/medium';
import { searchHardMoveAsync } from '../ai/hard';

const STORAGE_KEY = 'lattttice:v1';

export interface PersistedState {
  cells: ReadonlyArray<Mark>;
  toMove: Player;
  winner: Player | null;
  winningLine: ReadonlyArray<number> | null;
  moveLog: ReadonlyArray<number>;
  mode: Mode;
  aiLevel: AiLevel;
  view: ViewKind;
  overlayPerPlayer: { X: boolean; O: boolean };
  probHistory: ReadonlyArray<ProbPoint>;
  currentZ: number; // for z-slices view
  currentW: number; // for grid-of-grids w-slider, etc.
}

export interface LattticeStore {
  // board
  cells: ReadonlyArray<Mark>;
  toMove: Player;
  winner: Player | null;
  winningLine: ReadonlyArray<number> | null;
  moveLog: ReadonlyArray<number>;

  // settings
  mode: Mode;
  aiLevel: AiLevel;
  view: ViewKind;
  overlayPerPlayer: { X: boolean; O: boolean };

  // analysis
  probHistory: ReadonlyArray<ProbPoint>;
  turningPoint: TurningPoint | null;
  isThinking: boolean;
  isAnalysing: boolean;

  // axis slider state (for views)
  currentZ: number;
  currentW: number;

  // actions
  hydrated: boolean;
  hydrate: () => Promise<void>;
  newGame: () => void;
  playAt: (idx: number) => void;
  setMode: (mode: Mode) => void;
  setAiLevel: (level: AiLevel) => void;
  setView: (view: ViewKind) => void;
  setOverlayForPlayer: (p: Player, on: boolean) => void;
  setCurrentZ: (z: number) => void;
  setCurrentW: (w: number) => void;
  runAiIfNeeded: () => Promise<void>;
  recomputeProb: () => Promise<void>;
}

function boardStateFromSlice(s: {
  cells: ReadonlyArray<Mark>;
  toMove: Player;
  winner: Player | null;
  winningLine: ReadonlyArray<number> | null;
  moveLog: ReadonlyArray<number>;
}): BoardState {
  return {
    cells: s.cells,
    toMove: s.toMove,
    winner: s.winner,
    winningLine: s.winningLine
      ? ([s.winningLine[0], s.winningLine[1], s.winningLine[2], s.winningLine[3]] as BoardState['winningLine'])
      : null,
    moveLog: s.moveLog,
  };
}

let probAbort: { cancelled: boolean } = { cancelled: false };
let probTimer: ReturnType<typeof setTimeout> | null = null;
let aiAbort: { cancelled: boolean } = { cancelled: false };

async function persist(state: LattticeStore): Promise<void> {
  const snapshot: PersistedState = {
    cells: state.cells,
    toMove: state.toMove,
    winner: state.winner,
    winningLine: state.winningLine,
    moveLog: state.moveLog,
    mode: state.mode,
    aiLevel: state.aiLevel,
    view: state.view,
    overlayPerPlayer: state.overlayPerPlayer,
    probHistory: state.probHistory,
    currentZ: state.currentZ,
    currentW: state.currentW,
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    // best-effort; swallow to avoid crashing on storage failure
    log.warn('persist failed', e);
  }
}

export const useStore = create<LattticeStore>((set, get) => ({
  cells: new Array<Mark>(TOTAL_CELLS).fill(null),
  toMove: 'X',
  winner: null,
  winningLine: null,
  moveLog: [],
  mode: 'hotseat',
  aiLevel: 'medium',
  view: 'grid-of-grids',
  overlayPerPlayer: { X: false, O: false },
  probHistory: [],
  turningPoint: null,
  isThinking: false,
  isAnalysing: false,
  currentZ: 0,
  currentW: 0,
  hydrated: false,

  hydrate: async (): Promise<void> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        set({
          cells: parsed.cells,
          toMove: parsed.toMove,
          winner: parsed.winner,
          winningLine: parsed.winningLine,
          moveLog: parsed.moveLog,
          mode: parsed.mode,
          aiLevel: parsed.aiLevel,
          view: parsed.view,
          overlayPerPlayer: parsed.overlayPerPlayer,
          probHistory: parsed.probHistory,
          currentZ: parsed.currentZ,
          currentW: parsed.currentW,
          turningPoint: findTurningPoint(parsed.probHistory),
          hydrated: true,
        });
      } else {
        set({ hydrated: true });
      }
    } catch (e) {
      log.warn('hydrate failed', e);
      set({ hydrated: true });
    }
  },

  newGame: (): void => {
    aiAbort.cancelled = true;
    aiAbort = { cancelled: false };
    probAbort.cancelled = true;
    probAbort = { cancelled: false };
    if (probTimer) {
      clearTimeout(probTimer);
      probTimer = null;
    }
    const fresh = createEmptyBoard();
    set({
      cells: fresh.cells,
      toMove: fresh.toMove,
      winner: fresh.winner,
      winningLine: fresh.winningLine,
      moveLog: fresh.moveLog,
      probHistory: [],
      turningPoint: null,
      isThinking: false,
      isAnalysing: false,
    });
    void persist(get());
  },

  playAt: (idx: number): void => {
    const state = get();
    const board = boardStateFromSlice(state);
    if (!isLegal(board, idx)) return;
    // D4 gate: in vs-computer mode the AI (O) is the only legal mover when it's O's turn.
    // Block fast double-taps that would otherwise let the human play O's move.
    if (state.mode === 'vs-computer' && state.toMove === 'O') return;
    if (state.isThinking) return;
    const next = applyMove(board, idx);
    set({
      cells: next.cells,
      toMove: next.toMove,
      winner: next.winner,
      winningLine: next.winningLine,
      moveLog: next.moveLog,
    });
    void persist(get());
    void get().recomputeProb();
    if (next.winner === null && get().mode === 'vs-computer') {
      void get().runAiIfNeeded();
    }
  },

  setMode: (mode: Mode): void => {
    set({ mode });
    void persist(get());
    if (get().mode === 'vs-computer') void get().runAiIfNeeded();
  },
  setAiLevel: (level: AiLevel): void => {
    set({ aiLevel: level });
    void persist(get());
  },
  setView: (view: ViewKind): void => {
    set({ view });
    void persist(get());
  },
  setOverlayForPlayer: (p: Player, on: boolean): void => {
    set((s) => ({ overlayPerPlayer: { ...s.overlayPerPlayer, [p]: on } }));
    void persist(get());
  },
  setCurrentZ: (z: number): void => {
    set({ currentZ: Math.max(0, Math.min(3, Math.floor(z))) });
  },
  setCurrentW: (w: number): void => {
    set({ currentW: Math.max(0, Math.min(3, Math.floor(w))) });
  },

  runAiIfNeeded: async (): Promise<void> => {
    const s = get();
    if (s.mode !== 'vs-computer') return;
    if (s.winner !== null) return;
    // In vs-computer, by convention the AI plays O. (Human is X, moves first.)
    if (s.toMove !== 'O') return;
    if (s.isThinking) return;
    set({ isThinking: true });
    aiAbort.cancelled = false;
    // Yield once so the UI can render the "thinking" indicator before search starts.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    if (aiAbort.cancelled) {
      set({ isThinking: false });
      return;
    }
    const board = boardStateFromSlice(get());
    let move: number | null = null;
    try {
      if (s.aiLevel === 'easy') {
        move = chooseEasyMove(board);
      } else if (s.aiLevel === 'medium') {
        move = chooseMediumMove(board);
      } else {
        const res = await searchHardMoveAsync(board, {
          timeBudgetMs: 600,
          depth: 4,
          branchCap: 24,
          aborted: () => aiAbort.cancelled,
        });
        move = res.move;
      }
    } catch (e) {
      log.warn('AI search failed', e);
    }
    if (aiAbort.cancelled) {
      set({ isThinking: false });
      return;
    }
    set({ isThinking: false });
    if (move !== null) {
      // playAt enforces its own gating; bypass the vs-computer-O guard by clearing it temporarily?
      // Simpler: call applyMove path directly here so we don't recurse into runAiIfNeeded.
      const board2 = boardStateFromSlice(get());
      if (isLegal(board2, move) && board2.toMove === 'O') {
        const next = applyMove(board2, move);
        set({
          cells: next.cells,
          toMove: next.toMove,
          winner: next.winner,
          winningLine: next.winningLine,
          moveLog: next.moveLog,
        });
        void persist(get());
        void get().recomputeProb();
      }
    }
  },

  recomputeProb: async (): Promise<void> => {
    probAbort.cancelled = true;
    probAbort = { cancelled: false };
    const myAbort = probAbort;
    if (probTimer) {
      clearTimeout(probTimer);
      probTimer = null;
    }
    set({ isAnalysing: true });
    probTimer = setTimeout(async () => {
      const s = get();
      const board = boardStateFromSlice(s);
      const ply = s.moveLog.length;
      try {
        const point = await estimateProb(board, ply, {
          aborted: () => myAbort.cancelled,
        });
        if (myAbort.cancelled) return;
        set((cur) => {
          // Replace any existing entry at this ply, else append.
          const filtered = cur.probHistory.filter((p) => p.ply !== ply);
          const nextHistory = [...filtered, point].sort((a, b) => a.ply - b.ply);
          return {
            probHistory: nextHistory,
            turningPoint: findTurningPoint(nextHistory),
            isAnalysing: false,
          };
        });
        void persist(get());
      } catch (e) {
        log.warn('prob estimate failed', e);
        set({ isAnalysing: false });
      }
    }, 120);
  },
}));
