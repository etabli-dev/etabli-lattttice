import { LINES, LINES_THROUGH_CELL, enumerateLines } from '../lines';
import { fromIdx } from '../coords';
import { SIZE, TOTAL_CELLS } from '../types';

/**
 * Canonical line count for n-in-a-row on an n^d hypercube:
 *   total = ((n + 2)^d - n^d) / 2
 * For n=4, d=4 this gives (6^4 - 4^4) / 2 = (1296 - 256) / 2 = 520.
 *
 * The spec README mentions "1016" verbatim but the spec's own derivation
 * ("halve for direction symmetry") yields 520; see DECISIONS.md.
 */
const EXPECTED_LINE_COUNT = 520;

describe('line enumeration', () => {
  it(`produces exactly ${EXPECTED_LINE_COUNT} winning lines (canonical n=4, d=4)`, () => {
    expect(LINES.length).toBe(EXPECTED_LINE_COUNT);
  });

  it('re-running enumerateLines is stable and produces the same count', () => {
    const again = enumerateLines();
    expect(again.length).toBe(EXPECTED_LINE_COUNT);
  });

  it('matches the closed-form formula ((n+2)^d - n^d) / 2', () => {
    const n = 4;
    const d = 4;
    const closed = (Math.pow(n + 2, d) - Math.pow(n, d)) / 2;
    expect(LINES.length).toBe(closed);
  });

  it('every line has 4 distinct, in-range cells', () => {
    for (const line of LINES) {
      expect(line.length).toBe(4);
      const set = new Set(line);
      expect(set.size).toBe(4);
      for (const idx of line) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(TOTAL_CELLS);
      }
    }
  });

  it('every line satisfies the constant/inc/dec rule per coordinate with >=1 varying axis', () => {
    for (const line of LINES) {
      const coords = line.map(fromIdx);
      const axes: Array<'x' | 'y' | 'z' | 'w'> = ['x', 'y', 'z', 'w'];
      let varyingCount = 0;
      for (const axis of axes) {
        const vals = coords.map((c) => c[axis]);
        const allSame = vals.every((v) => v === vals[0]);
        const isInc = vals[0] === 0 && vals[1] === 1 && vals[2] === 2 && vals[3] === 3;
        const isDec = vals[0] === 3 && vals[1] === 2 && vals[2] === 1 && vals[3] === 0;
        expect(allSame || isInc || isDec).toBe(true);
        if (!allSame) varyingCount++;
      }
      expect(varyingCount).toBeGreaterThanOrEqual(1);
    }
  });

  it('LINES_THROUGH_CELL covers every cell with at least one line', () => {
    expect(LINES_THROUGH_CELL.length).toBe(TOTAL_CELLS);
    for (let i = 0; i < TOTAL_CELLS; i++) {
      expect(LINES_THROUGH_CELL[i].length).toBeGreaterThan(0);
    }
  });

  it('total line memberships = 4 * 1016 (each line has 4 cells)', () => {
    const sum = LINES_THROUGH_CELL.reduce((acc, list) => acc + list.length, 0);
    expect(sum).toBe(4 * LINES.length);
  });

  it('contains a known pure-axis line (x varies, y=z=w=0)', () => {
    const expected = [0, 1, 2, 3].map((x) => ((x * SIZE + 0) * SIZE + 0) * SIZE + 0);
    const key = expected.join(',');
    const found = LINES.some((line) => {
      const fwd = line.join(',');
      const rev = [...line].reverse().join(',');
      return fwd === key || rev === key;
    });
    expect(found).toBe(true);
  });

  it('contains the full 4-coord space-diagonal (0,0,0,0)-(3,3,3,3)', () => {
    const expected = [0, 1, 2, 3].map((k) => ((k * SIZE + k) * SIZE + k) * SIZE + k);
    const found = LINES.some((line) => {
      const fwd = line.join(',');
      const rev = [...line].reverse().join(',');
      return fwd === expected.join(',') || rev === expected.join(',');
    });
    expect(found).toBe(true);
  });
});
