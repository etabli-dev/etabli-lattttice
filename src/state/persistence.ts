import { applyMove, createEmptyBoard } from '../game/rules';
import type { PersistedState } from './store';

/** Reconstruct game truth from legal moves; reject corrupted snapshots as a whole. */
export function decodeSavedGame(raw: string): PersistedState {
  const value: PersistedState = JSON.parse(raw);
  if (!value || !Array.isArray(value.moveLog) || value.moveLog.length > 256 ||
      !Array.isArray(value.cells) || value.cells.length !== 256) throw new Error('Invalid saved board');
  let board = createEmptyBoard();
  for (const move of value.moveLog) {
    if (!Number.isInteger(move)) throw new Error('Invalid saved move');
    board = applyMove(board, move);
  }
  if (board.cells.some((cell, i) => cell !== value.cells[i]) || value.toMove !== board.toMove || value.winner !== board.winner ||
      JSON.stringify(board.winningLine) !== JSON.stringify(value.winningLine)) throw new Error('Saved board disagrees with move history');
  if (!['hotseat', 'vs-computer'].includes(value.mode) || !['easy', 'medium', 'hard'].includes(value.aiLevel) ||
      !['grid-of-grids', 'z-slices', 'projection-3d', 'heat-view'].includes(value.view) ||
      !value.overlayPerPlayer || typeof value.overlayPerPlayer.X !== 'boolean' || typeof value.overlayPerPlayer.O !== 'boolean' ||
      !Number.isInteger(value.currentZ) || value.currentZ < 0 || value.currentZ > 3 ||
      !Number.isInteger(value.currentW) || value.currentW < 0 || value.currentW > 3 || !Array.isArray(value.probHistory)) {
    throw new Error('Invalid saved settings');
  }
  let previous = -1;
  for (const point of value.probHistory) {
    if (!point || !Number.isInteger(point.ply) || point.ply <= previous || point.ply > value.moveLog.length ||
        [point.pX, point.pO, point.pDraw].some((p) => !Number.isFinite(p) || p < 0 || p > 1) ||
        Math.abs(point.pX + point.pO + point.pDraw - 1) > 0.000001) throw new Error('Invalid saved probabilities');
    previous = point.ply;
  }
  return { ...value, ...board };
}
