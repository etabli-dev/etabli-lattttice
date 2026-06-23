import { LINES, LINES_THROUGH_CELL } from '../game/lines';
import { Mark, Player } from '../game/types';
import { otherPlayer } from '../game/rules';

/**
 * Find the first cell that, if played by `side`, completes a winning line. null if none.
 */
export function findImmediateWin(
  cells: ReadonlyArray<Mark>,
  side: Player,
): number | null {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] !== null) continue;
    const lineIds = LINES_THROUGH_CELL[i];
    for (let j = 0; j < lineIds.length; j++) {
      const line = LINES[lineIds[j]];
      let mine = 0;
      let opp = 0;
      for (let k = 0; k < 4; k++) {
        const idx = line[k];
        if (idx === i) continue;
        const m = cells[idx];
        if (m === side) mine++;
        else if (m !== null) opp++;
      }
      if (mine === 3 && opp === 0) return i;
    }
  }
  return null;
}

/**
 * Find a cell that blocks an immediate opponent win. null if none.
 */
export function findBlockingMove(
  cells: ReadonlyArray<Mark>,
  side: Player,
): number | null {
  return findImmediateWin(cells, otherPlayer(side));
}
