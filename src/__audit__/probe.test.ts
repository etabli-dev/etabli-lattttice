/**
 * Audit-only probe: emits diagnostic numbers via console.log so the auditor can quote
 * them in AUDIT-lattttice.md. Always passes; treats logged metrics as the deliverable.
 */
import { LINES, LINES_THROUGH_CELL } from '../game/lines';
import { applyMove, createEmptyBoard } from '../game/rules';
import { toIdx, fromIdx } from '../game/coords';
import { searchHardMove } from '../ai/hard';
import { chooseEasyMove } from '../ai/easy';
import { chooseMediumMove } from '../ai/medium';
import { runRolloutsSync } from '../ai/montecarlo';

describe('AUDIT diagnostics', () => {
  it('reports invariant counts and timings', () => {
    /* eslint-disable no-console */
    console.log(`[AUDIT] LINES.length=${LINES.length}`);
    console.log(`[AUDIT] LINES_THROUGH_CELL[0].length=${LINES_THROUGH_CELL[0].length}`);
    console.log(`[AUDIT] LINES_THROUGH_CELL[255].length=${LINES_THROUGH_CELL[255].length}`);
    console.log(
      `[AUDIT] LINES_THROUGH_CELL[toIdx(1,1,1,1)].length=${
        LINES_THROUGH_CELL[toIdx(1, 1, 1, 1)].length
      }`,
    );

    // Spot-check 5 lines for "valid 4D direction" rule.
    for (let i = 0; i < 5; i++) {
      const line = LINES[i * Math.floor(LINES.length / 7)];
      const coords = line.map(fromIdx);
      console.log(`[AUDIT] line[${i}] coords=${JSON.stringify(coords)}`);
    }

    // Hard search timing on the empty board (worst case for branching).
    const b = createEmptyBoard();
    const t0 = Date.now();
    const res = searchHardMove(b, { depth: 3, timeBudgetMs: 600, branchCap: 12 });
    console.log(`[AUDIT] hard search empty-board ms=${Date.now() - t0}`);
    console.log(`[AUDIT] hard search empty-board move=${res.move}`);

    // Mid-game timing — play 8 random moves, then re-search.
    let mid = createEmptyBoard();
    for (let i = 0; i < 8 && mid.winner === null; i++) {
      const legal: number[] = [];
      for (let k = 0; k < 256; k++) if (mid.cells[k] === null) legal.push(k);
      mid = applyMove(mid, legal[Math.floor(Math.random() * legal.length)]);
    }
    const t1 = Date.now();
    const res1 = searchHardMove(mid, { depth: 3, timeBudgetMs: 600, branchCap: 12 });
    console.log(`[AUDIT] hard search mid-game ms=${Date.now() - t1}`);
    console.log(`[AUDIT] hard search mid-game move=${res1.move}`);

    // 100 random positions × 3 AIs → none illegal/occupied.
    let illegal = 0;
    for (let t = 0; t < 100; t++) {
      let pb = createEmptyBoard();
      const ms = Math.floor(Math.random() * 30);
      for (let i = 0; i < ms && pb.winner === null; i++) {
        const legal: number[] = [];
        for (let k = 0; k < 256; k++) if (pb.cells[k] === null) legal.push(k);
        pb = applyMove(pb, legal[Math.floor(Math.random() * legal.length)]);
      }
      if (pb.winner !== null) continue;
      // Use fast hard params here — we're checking legality, not depth quality.
      const moves: Array<number | null> = [
        chooseEasyMove(pb),
        chooseMediumMove(pb),
        searchHardMove(pb, { depth: 2, timeBudgetMs: 50, branchCap: 8 }).move,
      ];
      for (const m of moves) {
        if (m === null) {
          illegal++;
          continue;
        }
        if (pb.cells[m] !== null) illegal++;
      }
    }
    console.log(`[AUDIT] illegal-AI-moves over 100 randomized positions: ${illegal}`);

    // Winning-position rollout.
    let wb = createEmptyBoard();
    wb = applyMove(wb, toIdx(0, 0, 0, 0));
    wb = applyMove(wb, toIdx(1, 1, 0, 0));
    wb = applyMove(wb, toIdx(1, 0, 0, 0));
    wb = applyMove(wb, toIdx(2, 1, 0, 0));
    wb = applyMove(wb, toIdx(2, 0, 0, 0));
    wb = applyMove(wb, toIdx(3, 1, 0, 0));
    wb = applyMove(wb, toIdx(3, 0, 0, 0));
    const r = runRolloutsSync(wb, { samples: 50 });
    console.log(
      `[AUDIT] won-position rollout pX=${r.pX.toFixed(2)} pO=${r.pO.toFixed(2)} pDraw=${r.pDraw.toFixed(2)}`,
    );
    expect(true).toBe(true);
    /* eslint-enable no-console */
  });
});
