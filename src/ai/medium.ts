import { BoardState } from '../game/types';
import { legalMoves } from '../game/rules';
import { findBlockingMove, findImmediateWin } from './threats';
import { scoreAllEmpty } from '../overlay/strength';

/**
 * Medium AI: take a win, block a loss, otherwise pick the highest-strength empty cell.
 */
export function chooseMediumMove(board: BoardState): number | null {
  if (board.winner !== null) return null;
  const side = board.toMove;
  const win = findImmediateWin(board.cells, side);
  if (win !== null) return win;
  const block = findBlockingMove(board.cells, side);
  if (block !== null) return block;
  const legal = legalMoves(board);
  if (legal.length === 0) return null;
  const scores = scoreAllEmpty(board.cells, side);
  let bestIdx = legal[0];
  let bestScore = -Infinity;
  for (const idx of legal) {
    if (scores[idx] > bestScore) {
      bestScore = scores[idx];
      bestIdx = idx;
    }
  }
  return bestIdx;
}
