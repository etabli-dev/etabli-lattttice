import { LINES, LINES_THROUGH_CELL } from '../game/lines';
import { Mark, Player, TOTAL_CELLS } from '../game/types';
import { otherPlayer } from '../game/rules';

/**
 * Compute strength score for a candidate empty cell `c` for `side`.
 *
 *   strength(c) = Σ over winning lines L through c:
 *                   w_offense(L) + w_defense(L)
 *   where, counting marks on L:
 *     - only my marks (k of them):       w_offense = 3^k
 *     - only opponent marks (k of them): w_defense = 0.9 * 3^k
 *     - mixed (both present):            0           (dead line)
 *     - empty line:                      1           (centrality)
 *
 * The cell itself is treated as empty for scoring purposes.
 */
export function strengthForCell(
  cells: ReadonlyArray<Mark>,
  cellIdx: number,
  side: Player,
): number {
  const opp = otherPlayer(side);
  const lineIds = LINES_THROUGH_CELL[cellIdx];
  let score = 0;
  for (let i = 0; i < lineIds.length; i++) {
    const line = LINES[lineIds[i]];
    let myCount = 0;
    let oppCount = 0;
    for (let k = 0; k < line.length; k++) {
      const idx = line[k];
      if (idx === cellIdx) continue; // candidate cell treated as empty
      const m = cells[idx];
      if (m === side) myCount++;
      else if (m === opp) oppCount++;
    }
    if (myCount > 0 && oppCount > 0) continue; // dead line
    if (myCount === 0 && oppCount === 0) {
      score += 1; // centrality bonus
    } else if (oppCount === 0) {
      score += Math.pow(3, myCount); // offense
    } else {
      score += 0.9 * Math.pow(3, oppCount); // defense
    }
  }
  return score;
}

/**
 * Score every empty cell for `side`. Returns an array length TOTAL_CELLS;
 * occupied cells have score 0.
 */
export function scoreAllEmpty(
  cells: ReadonlyArray<Mark>,
  side: Player,
): number[] {
  const out = new Array<number>(TOTAL_CELLS).fill(0);
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (cells[i] === null) out[i] = strengthForCell(cells, i, side);
  }
  return out;
}

export interface RankedMove {
  idx: number;
  score: number;
  rank: number; // 1 = strongest
}

export function topNRanked(scores: ReadonlyArray<number>, n: number): RankedMove[] {
  const withIdx = scores
    .map((s, idx) => ({ idx, score: s }))
    .filter((m) => m.score > 0);
  withIdx.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return withIdx.slice(0, n).map((m, i) => ({ ...m, rank: i + 1 }));
}
