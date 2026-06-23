import { BoardState, Mark, Player } from '../game/types';
import { findWinningLineAt } from '../game/rules';
import { LINES, LINES_THROUGH_CELL } from '../game/lines';

export interface RolloutResult {
  pX: number;
  pO: number;
  pDraw: number;
  samples: number;
}

export interface RolloutOptions {
  samples?: number; // default 200
  aborted?: () => boolean;
  yieldEvery?: number; // cooperative yield interval for async API
}

function findImmediateWinFast(
  cells: Mark[],
  side: Player,
  legal: number[],
): number | null {
  for (let li = 0; li < legal.length; li++) {
    const i = legal[li];
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

function pickGreedyRandom(
  cells: Mark[],
  side: Player,
  legal: number[],
): number {
  const win = findImmediateWinFast(cells, side, legal);
  if (win !== null) return win;
  const opp: Player = side === 'X' ? 'O' : 'X';
  const block = findImmediateWinFast(cells, opp, legal);
  if (block !== null) return block;
  const pick = Math.floor(Math.random() * legal.length);
  return legal[Math.min(pick, legal.length - 1)];
}

function playOneRollout(start: BoardState): Player | 'draw' {
  const cells = start.cells.slice();
  // legal moves list, kept synchronized.
  const legal: number[] = [];
  for (let i = 0; i < cells.length; i++) if (cells[i] === null) legal.push(i);
  let toMove: Player = start.toMove;
  if (start.winner !== null) return start.winner;
  while (legal.length > 0) {
    const choice = pickGreedyRandom(cells, toMove, legal);
    cells[choice] = toMove;
    // remove from legal
    const li = legal.indexOf(choice);
    if (li >= 0) legal.splice(li, 1);
    const winLine = findWinningLineAt(cells, choice, toMove);
    if (winLine) return toMove;
    toMove = toMove === 'X' ? 'O' : 'X';
  }
  return 'draw';
}

export function runRolloutsSync(
  board: BoardState,
  opts: RolloutOptions = {},
): RolloutResult {
  const samples = opts.samples ?? 200;
  let x = 0;
  let o = 0;
  let d = 0;
  for (let i = 0; i < samples; i++) {
    if (opts.aborted && opts.aborted()) break;
    const r = playOneRollout(board);
    if (r === 'X') x++;
    else if (r === 'O') o++;
    else d++;
  }
  const total = x + o + d || 1;
  return { pX: x / total, pO: o / total, pDraw: d / total, samples: total };
}

/**
 * Cooperative async version: yields control to the event loop between batches so input
 * is not blocked on the UI thread.
 */
export async function runRolloutsAsync(
  board: BoardState,
  opts: RolloutOptions = {},
): Promise<RolloutResult> {
  const samples = opts.samples ?? 200;
  const yieldEvery = opts.yieldEvery ?? 25;
  let x = 0;
  let o = 0;
  let d = 0;
  for (let i = 0; i < samples; i++) {
    if (opts.aborted && opts.aborted()) break;
    const r = playOneRollout(board);
    if (r === 'X') x++;
    else if (r === 'O') o++;
    else d++;
    if ((i + 1) % yieldEvery === 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  const total = x + o + d || 1;
  return { pX: x / total, pO: o / total, pDraw: d / total, samples: total };
}
