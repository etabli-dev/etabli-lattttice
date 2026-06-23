import { Mark, TOTAL_CELLS } from '../../game/types';
import { toIdx } from '../../game/coords';
import { scoreAllEmpty, strengthForCell, topNRanked } from '../strength';

function empty(): Mark[] {
  return new Array<Mark>(TOTAL_CELLS).fill(null);
}

describe('strengthForCell', () => {
  it('on an empty board returns positive centrality for every empty cell', () => {
    const cells = empty();
    for (let i = 0; i < TOTAL_CELLS; i++) {
      expect(strengthForCell(cells, i, 'X')).toBeGreaterThan(0);
    }
  });

  it('mixed (dead) lines contribute 0 (same cell, before/after contamination)', () => {
    const candidate = toIdx(2, 0, 0, 0);
    // Baseline: same candidate cell on a board that already has just X at (0,0,0,0).
    // The x-axis line through y=z=w=0 still has my (X) mark only — contributes 3^1 = 3 for X
    // and 0 for O.
    const baseCells = empty();
    baseCells[toIdx(0, 0, 0, 0)] = 'X';
    const sXBase = strengthForCell(baseCells, candidate, 'X');
    const sOBase = strengthForCell(baseCells, candidate, 'O');

    // Now contaminate the same line by adding an O — line becomes dead.
    const deadCells = baseCells.slice();
    deadCells[toIdx(1, 0, 0, 0)] = 'O';
    const sXDead = strengthForCell(deadCells, candidate, 'X');
    const sODead = strengthForCell(deadCells, candidate, 'O');

    // For X: previously the line contributed 3 (1 X mark). Now it contributes 0 (mixed).
    // So sXDead = sXBase - 3.
    expect(sXDead).toBeCloseTo(sXBase - 3, 9);
    // For O: previously the line contributed 0.9 * 3^1 = 2.7 (1 opponent mark).
    // Now mixed → 0. So sODead = sOBase - 2.7.
    expect(sODead).toBeCloseTo(sOBase - 2.7, 9);
  });

  it('adding one of my marks to an otherwise-empty line strictly increases that line contribution', () => {
    // Score (2,0,0,0) for X on an empty board.
    const baseline = strengthForCell(empty(), toIdx(2, 0, 0, 0), 'X');
    // Add one of my (X) marks elsewhere on the x-axis line — must increase the score.
    const cells = empty();
    cells[toIdx(0, 0, 0, 0)] = 'X';
    const boosted = strengthForCell(cells, toIdx(2, 0, 0, 0), 'X');
    expect(boosted).toBeGreaterThan(baseline);
  });

  it('opponent threat increases my defensive score for blocking cells', () => {
    const baseline = strengthForCell(empty(), toIdx(3, 0, 0, 0), 'X');
    const cells = empty();
    // O has three in a row on the x-axis at y=z=w=0; X's score for (3,0,0,0) should jump.
    cells[toIdx(0, 0, 0, 0)] = 'O';
    cells[toIdx(1, 0, 0, 0)] = 'O';
    cells[toIdx(2, 0, 0, 0)] = 'O';
    const block = strengthForCell(cells, toIdx(3, 0, 0, 0), 'X');
    expect(block).toBeGreaterThan(baseline);
  });

  it('occupied cells are skipped in scoreAllEmpty', () => {
    const cells = empty();
    cells[10] = 'X';
    cells[20] = 'O';
    const scores = scoreAllEmpty(cells, 'X');
    expect(scores[10]).toBe(0);
    expect(scores[20]).toBe(0);
    expect(scores[0]).toBeGreaterThan(0);
  });

  it('topNRanked matches raw score ordering and assigns ranks 1..N', () => {
    const cells = empty();
    cells[toIdx(0, 0, 0, 0)] = 'X';
    cells[toIdx(1, 0, 0, 0)] = 'X';
    const scores = scoreAllEmpty(cells, 'X');
    const top5 = topNRanked(scores, 5);
    expect(top5.length).toBeLessThanOrEqual(5);
    for (let i = 0; i < top5.length; i++) {
      expect(top5[i].rank).toBe(i + 1);
    }
    for (let i = 1; i < top5.length; i++) {
      expect(top5[i - 1].score).toBeGreaterThanOrEqual(top5[i].score);
    }
  });
});
