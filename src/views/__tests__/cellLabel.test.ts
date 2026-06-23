import { describeCell } from '../cellLabel';
import { fromIdx, toIdx } from '../../game/coords';

describe('describeCell', () => {
  it('formats empty cell as "x# y# z# w#, empty" per spec §7', () => {
    expect(describeCell({ x: 3, y: 1, z: 0, w: 2 }, null)).toBe('x3 y1 z0 w2, empty');
  });

  it('formats X-occupied cell as "x# y# z# w#, X"', () => {
    expect(describeCell({ x: 0, y: 0, z: 0, w: 0 }, 'X')).toBe('x0 y0 z0 w0, X');
  });

  it('formats O-occupied cell as "x# y# z# w#, O"', () => {
    expect(describeCell({ x: 1, y: 2, z: 3, w: 0 }, 'O')).toBe('x1 y2 z3 w0, O');
  });

  it('round-trips with toIdx/fromIdx for all 256 cells', () => {
    for (let i = 0; i < 256; i++) {
      const c = fromIdx(i);
      const label = describeCell(c, null);
      // Label embeds the exact integer axis values
      expect(label).toMatch(/^x[0-3] y[0-3] z[0-3] w[0-3], empty$/);
      // And the coords map back via toIdx
      expect(toIdx(c.x, c.y, c.z, c.w)).toBe(i);
    }
  });
});
