import { Mark, Player } from '../game/types';
import { legalMoves } from '../game/rules';
import { findBlockingMove, findImmediateWin } from './threats';
import { BoardState } from '../game/types';

export interface RngLike {
  next(): number; // [0, 1)
}

export const defaultRng: RngLike = {
  next: () => Math.random(),
};

/**
 * Easy AI: take an immediate win, else block an immediate loss, else random legal move.
 */
export function chooseEasyMove(board: BoardState, rng: RngLike = defaultRng): number | null {
  if (board.winner !== null) return null;
  const cells = board.cells;
  const side: Player = board.toMove;
  const win = findImmediateWin(cells, side);
  if (win !== null) return win;
  const block = findBlockingMove(cells, side);
  if (block !== null) return block;
  const legal = legalMoves(board);
  if (legal.length === 0) return null;
  const pick = Math.floor(rng.next() * legal.length);
  return legal[Math.min(pick, legal.length - 1)];
}

// Re-export Mark to satisfy `noUnusedLocals` consumers if they import only chooseEasyMove.
export type { Mark };
