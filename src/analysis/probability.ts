import { BoardState } from '../game/types';
import { runRolloutsAsync, RolloutOptions, RolloutResult } from '../ai/montecarlo';

export interface ProbPoint {
  ply: number;
  pX: number;
  pO: number;
  pDraw: number;
}

/**
 * Compute estimated probabilities from the current position. Cancellable.
 */
export async function estimateProb(
  board: BoardState,
  ply: number,
  opts: RolloutOptions = {},
): Promise<ProbPoint> {
  const r: RolloutResult = await runRolloutsAsync(board, { samples: 200, ...opts });
  return { ply, pX: r.pX, pO: r.pO, pDraw: r.pDraw };
}

/**
 * Identify the ply where probability for either side swung the most between consecutive plies.
 * Returns null if the history is too short.
 */
export interface TurningPoint {
  ply: number;
  delta: number;
  side: 'X' | 'O';
}

export function findTurningPoint(history: ReadonlyArray<ProbPoint>): TurningPoint | null {
  if (history.length < 2) return null;
  let best: TurningPoint | null = null;
  for (let i = 1; i < history.length; i++) {
    const dX = Math.abs(history[i].pX - history[i - 1].pX);
    const dO = Math.abs(history[i].pO - history[i - 1].pO);
    const candidate: TurningPoint =
      dX >= dO
        ? { ply: history[i].ply, delta: dX, side: 'X' }
        : { ply: history[i].ply, delta: dO, side: 'O' };
    if (best === null || candidate.delta > best.delta) best = candidate;
  }
  return best;
}
