/**
 * Core game types for lattttice — 4D 4x4x4x4 tic-tac-toe.
 */

export type Mark = 'X' | 'O' | null;
export type Player = 'X' | 'O';

export const SIZE = 4 as const;
export const DIM = 4 as const;
export const TOTAL_CELLS = SIZE ** DIM; // 256

export interface Coord {
  x: number;
  y: number;
  z: number;
  w: number;
}

export type Line = readonly [number, number, number, number]; // 4 cell indices

export interface BoardState {
  cells: ReadonlyArray<Mark>;
  toMove: Player;
  winner: Player | null;
  winningLine: Line | null;
  moveLog: ReadonlyArray<number>; // sequence of cell indices played
}

export type Mode = 'hotseat' | 'vs-computer';
export type AiLevel = 'easy' | 'medium' | 'hard';
export type ViewKind = 'grid-of-grids' | 'z-slices' | 'projection-3d' | 'heat-view';
