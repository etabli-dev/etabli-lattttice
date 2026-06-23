import { fromCoord, fromIdx, isValidCoord, isValidIdx, toCoord, toIdx } from '../coords';
import { TOTAL_CELLS } from '../types';

describe('coord round-trip', () => {
  it('fromCoord(toCoord(idx)) === idx for all 256 indices', () => {
    for (let i = 0; i < TOTAL_CELLS; i++) {
      expect(fromCoord(toCoord(i))).toBe(i);
    }
  });

  it('toCoord(fromCoord(c)) === c for all valid coordinates', () => {
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        for (let z = 0; z < 4; z++) {
          for (let w = 0; w < 4; w++) {
            const c = { x, y, z, w };
            expect(toCoord(fromCoord(c))).toEqual(c);
          }
        }
      }
    }
  });

  it('toIdx matches the documented formula', () => {
    expect(toIdx(0, 0, 0, 0)).toBe(0);
    expect(toIdx(0, 0, 0, 1)).toBe(1);
    expect(toIdx(0, 0, 1, 0)).toBe(4);
    expect(toIdx(0, 1, 0, 0)).toBe(16);
    expect(toIdx(1, 0, 0, 0)).toBe(64);
    expect(toIdx(3, 3, 3, 3)).toBe(255);
  });

  it('isValidIdx / isValidCoord guard ranges', () => {
    expect(isValidIdx(-1)).toBe(false);
    expect(isValidIdx(256)).toBe(false);
    expect(isValidIdx(0)).toBe(true);
    expect(isValidIdx(255)).toBe(true);
    expect(isValidCoord({ x: 0, y: 0, z: 0, w: 0 })).toBe(true);
    expect(isValidCoord({ x: 4, y: 0, z: 0, w: 0 })).toBe(false);
    expect(isValidCoord({ x: -1, y: 0, z: 0, w: 0 })).toBe(false);
  });

  it('fromIdx and toCoord are equivalent', () => {
    for (let i = 0; i < TOTAL_CELLS; i++) {
      expect(toCoord(i)).toEqual(fromIdx(i));
    }
  });
});
