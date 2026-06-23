import { Coord, SIZE, TOTAL_CELLS } from './types';

/**
 * Flat index layout: idx = ((x*4 + y)*4 + z)*4 + w
 * Each axis range: [0, 3].
 */
export function toIdx(x: number, y: number, z: number, w: number): number {
  return ((x * SIZE + y) * SIZE + z) * SIZE + w;
}

export function fromIdx(idx: number): Coord {
  const w = idx % SIZE;
  const z = Math.floor(idx / SIZE) % SIZE;
  const y = Math.floor(idx / (SIZE * SIZE)) % SIZE;
  const x = Math.floor(idx / (SIZE * SIZE * SIZE)) % SIZE;
  return { x, y, z, w };
}

export function fromCoord(c: Coord): number {
  return toIdx(c.x, c.y, c.z, c.w);
}

export function toCoord(idx: number): Coord {
  return fromIdx(idx);
}

export function isValidIdx(idx: number): boolean {
  return Number.isInteger(idx) && idx >= 0 && idx < TOTAL_CELLS;
}

export function isValidCoord(c: Coord): boolean {
  return (
    Number.isInteger(c.x) &&
    Number.isInteger(c.y) &&
    Number.isInteger(c.z) &&
    Number.isInteger(c.w) &&
    c.x >= 0 &&
    c.x < SIZE &&
    c.y >= 0 &&
    c.y < SIZE &&
    c.z >= 0 &&
    c.z < SIZE &&
    c.w >= 0 &&
    c.w < SIZE
  );
}
