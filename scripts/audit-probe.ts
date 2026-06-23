/* eslint-disable */
/**
 * One-off audit probe script. Confirms a few invariants from outside Jest.
 * Run with: npx ts-node scripts/audit-probe.ts (or via tsx if installed)
 */
import { LINES, LINES_THROUGH_CELL } from '../src/game/lines';
import { applyMove, createEmptyBoard } from '../src/game/rules';
import { toIdx } from '../src/game/coords';
import { searchHardMove } from '../src/ai/hard';
import { chooseEasyMove, chooseMediumMove, chooseHardMove } from '../src/ai';
import { runRolloutsSync } from '../src/ai/montecarlo';

function p(label: string, value: unknown) {
  console.log(label.padEnd(50, ' '), value);
}

p('LINES.length', LINES.length);
p('LINES_THROUGH_CELL[0].length', LINES_THROUGH_CELL[0].length);
p('LINES_THROUGH_CELL[255].length', LINES_THROUGH_CELL[255].length);

// hard AI worst-case timing on the empty board
{
  let b = createEmptyBoard();
  const t0 = Date.now();
  const res = searchHardMove(b, { depth: 3, timeBudgetMs: 600, branchCap: 12 });
  p('hard search on empty board ms', Date.now() - t0);
  p('hard move', res.move);
}

// confirm AI choices remain legal across 50 random positions
{
  let illegal = 0;
  for (let t = 0; t < 50; t++) {
    let b = createEmptyBoard();
    const ms = Math.floor(Math.random() * 30);
    for (let i = 0; i < ms && b.winner === null; i++) {
      const legal: number[] = [];
      for (let k = 0; k < 256; k++) if (b.cells[k] === null) legal.push(k);
      b = applyMove(b, legal[Math.floor(Math.random() * legal.length)]);
    }
    if (b.winner !== null) continue;
    for (const f of [chooseEasyMove, chooseMediumMove, chooseHardMove]) {
      const m = f(b);
      if (m === null || b.cells[m] !== null) illegal++;
    }
  }
  p('illegal AI choices over 50 randomized positions', illegal);
}

// Win-prob from a winning position
{
  let b = createEmptyBoard();
  b = applyMove(b, toIdx(0, 0, 0, 0));
  b = applyMove(b, toIdx(1, 1, 0, 0));
  b = applyMove(b, toIdx(1, 0, 0, 0));
  b = applyMove(b, toIdx(2, 1, 0, 0));
  b = applyMove(b, toIdx(2, 0, 0, 0));
  b = applyMove(b, toIdx(3, 1, 0, 0));
  b = applyMove(b, toIdx(3, 0, 0, 0));
  p('winner', b.winner);
  const r = runRolloutsSync(b, { samples: 50 });
  p('rollouts pX/pO/pDraw', `${r.pX.toFixed(2)} / ${r.pO.toFixed(2)} / ${r.pDraw.toFixed(2)}`);
}
