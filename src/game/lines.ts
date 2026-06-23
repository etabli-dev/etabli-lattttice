import { Line, SIZE, TOTAL_CELLS } from './types';
import { toIdx } from './coords';

/**
 * Enumerate every winning line in the 4D 4x4x4x4 tesseract.
 *
 * A line is 4 cells where each coordinate is either:
 *   - constant (0)
 *   - strictly increasing (+1 each step, starting at 0)
 *   - strictly decreasing (-1 each step, starting at 3)
 * …and at least one coordinate varies.
 *
 * For n=4, d=4 the canonical count is 1016.
 *
 * Direction patterns: each of 4 axes ∈ {fixed, +, -}.
 * Exclude all-fixed.
 * For each non-all-fixed pattern, count valid starting cells:
 *   - axis fixed:        start ∈ [0,3]            → 4 choices
 *   - axis increasing:   start must be 0          → 1 choice
 *   - axis decreasing:   start must be 3          → 1 choice
 * Then we deduplicate lines (a line and its reverse are identical).
 */

const STEP_FIXED = 0;
const STEP_INC = 1;
const STEP_DEC = -1;
const STEPS = [STEP_FIXED, STEP_INC, STEP_DEC] as const;
type Step = (typeof STEPS)[number];

function startsForStep(step: Step): number[] {
  if (step === STEP_FIXED) return [0, 1, 2, 3];
  if (step === STEP_INC) return [0];
  return [3]; // STEP_DEC
}

function canonicalKey(cells: readonly number[]): string {
  // A line is the same forwards and backwards. Use the lexicographically smaller representation.
  const fwd = cells.join(',');
  const rev = [...cells].reverse().join(',');
  return fwd < rev ? fwd : rev;
}

export function enumerateLines(): Line[] {
  const seen = new Set<string>();
  const lines: Line[] = [];

  for (const sx of STEPS) {
    for (const sy of STEPS) {
      for (const sz of STEPS) {
        for (const sw of STEPS) {
          if (sx === 0 && sy === 0 && sz === 0 && sw === 0) continue;
          for (const x0 of startsForStep(sx)) {
            for (const y0 of startsForStep(sy)) {
              for (const z0 of startsForStep(sz)) {
                for (const w0 of startsForStep(sw)) {
                  const cells: number[] = [];
                  let ok = true;
                  for (let k = 0; k < SIZE; k++) {
                    const x = x0 + sx * k;
                    const y = y0 + sy * k;
                    const z = z0 + sz * k;
                    const w = w0 + sw * k;
                    if (
                      x < 0 ||
                      x >= SIZE ||
                      y < 0 ||
                      y >= SIZE ||
                      z < 0 ||
                      z >= SIZE ||
                      w < 0 ||
                      w >= SIZE
                    ) {
                      ok = false;
                      break;
                    }
                    cells.push(toIdx(x, y, z, w));
                  }
                  if (!ok) continue;
                  const key = canonicalKey(cells);
                  if (!seen.has(key)) {
                    seen.add(key);
                    lines.push([cells[0], cells[1], cells[2], cells[3]] as Line);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return lines;
}

/**
 * Build per-cell index: cell idx → list of line ids that pass through that cell.
 */
export function buildLineIndex(lines: ReadonlyArray<Line>): number[][] {
  const idx: number[][] = Array.from({ length: TOTAL_CELLS }, () => []);
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    for (let k = 0; k < line.length; k++) {
      idx[line[k]].push(li);
    }
  }
  return idx;
}

// Singleton tables — computed once at module load.
export const LINES: ReadonlyArray<Line> = enumerateLines();
export const LINES_THROUGH_CELL: ReadonlyArray<ReadonlyArray<number>> = buildLineIndex(LINES);
