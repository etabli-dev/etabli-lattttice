import { BoardState, Mark, Player } from '../game/types';
import { LINES } from '../game/lines';
import { applyMove, isLegal, legalMoves, otherPlayer } from '../game/rules';
import { findBlockingMove, findImmediateWin } from './threats';
import { scoreAllEmpty } from '../overlay/strength';

/**
 * Hard AI: iterative-deepening negamax with alpha-beta pruning over the strength heuristic.
 *
 * Time budget is soft: we check elapsed time between branches and abort gracefully if exceeded.
 *
 * The strength heuristic is symmetric — we evaluate from `side`'s perspective by computing
 *   eval(board, side) = sum_offense(side) - sum_offense(otherPlayer(side))
 * derived from the same per-line offense scoring used in the overlay strength function.
 */

const WIN_SCORE = 1e9;

function evaluate(cells: ReadonlyArray<Mark>, side: Player): number {
  const opp = otherPlayer(side);
  let me = 0;
  let them = 0;
  for (let li = 0; li < LINES.length; li++) {
    const line = LINES[li];
    let myCount = 0;
    let oppCount = 0;
    for (let k = 0; k < 4; k++) {
      const m = cells[line[k]];
      if (m === side) myCount++;
      else if (m === opp) oppCount++;
    }
    if (myCount > 0 && oppCount > 0) continue;
    if (myCount > 0) me += Math.pow(3, myCount);
    else if (oppCount > 0) them += Math.pow(3, oppCount);
  }
  return me - them;
}

/**
 * Ordered candidate moves: prioritize immediate wins / blocks, then strength-scored cells.
 * Cap to keep branching factor manageable (the empty board has 256 legal cells).
 */
function orderedCandidates(
  board: BoardState,
  side: Player,
  cap: number,
): number[] {
  const legal = legalMoves(board);
  if (legal.length === 0) return legal;
  const win = findImmediateWin(board.cells, side);
  if (win !== null) return [win];
  const block = findBlockingMove(board.cells, side);
  const scores = scoreAllEmpty(board.cells, side);
  const sorted = legal.slice().sort((a, b) => scores[b] - scores[a] || a - b);
  if (block !== null) {
    const filtered = sorted.filter((idx) => idx !== block);
    return [block, ...filtered].slice(0, cap);
  }
  return sorted.slice(0, cap);
}

interface SearchOptions {
  depth: number;
  timeBudgetMs: number;
  branchCap?: number;
  aborted?: () => boolean;
}

interface SearchResult {
  move: number | null;
  score: number;
  completed: boolean;
}

function negamax(
  board: BoardState,
  side: Player,
  depth: number,
  alpha: number,
  beta: number,
  deadline: number,
  branchCap: number,
  aborted: () => boolean,
): { score: number; completed: boolean } {
  if (board.winner !== null) {
    // Whoever just moved won — that's the opposite of the side to move.
    if (board.winner === side) return { score: WIN_SCORE - 1, completed: true };
    return { score: -WIN_SCORE + 1, completed: true };
  }
  if (depth === 0) {
    return { score: evaluate(board.cells, side), completed: true };
  }
  if (Date.now() > deadline || aborted()) {
    return { score: evaluate(board.cells, side), completed: false };
  }
  const candidates = orderedCandidates(board, side, branchCap);
  if (candidates.length === 0) {
    return { score: 0, completed: true }; // draw
  }
  let best = -Infinity;
  let completed = true;
  for (const idx of candidates) {
    if (!isLegal(board, idx)) continue;
    const next = applyMove(board, idx);
    const child = negamax(
      next,
      otherPlayer(side),
      depth - 1,
      -beta,
      -alpha,
      deadline,
      branchCap,
      aborted,
    );
    if (!child.completed) completed = false;
    const score = -child.score;
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
    if (Date.now() > deadline || aborted()) {
      completed = false;
      break;
    }
  }
  if (best === -Infinity) best = evaluate(board.cells, side);
  return { score: best, completed };
}

export function searchHardMove(
  board: BoardState,
  opts: Partial<SearchOptions> = {},
): SearchResult {
  if (board.winner !== null) return { move: null, score: 0, completed: true };
  const side = board.toMove;
  // Immediate tactical moves always win the search.
  const win = findImmediateWin(board.cells, side);
  if (win !== null) return { move: win, score: WIN_SCORE, completed: true };
  const block = findBlockingMove(board.cells, side);
  if (block !== null) return { move: block, score: WIN_SCORE / 2, completed: true };

  const timeBudgetMs = opts.timeBudgetMs ?? 600;
  const maxDepth = opts.depth ?? 4;
  const branchCap = opts.branchCap ?? 24;
  const aborted = opts.aborted ?? ((): boolean => false);
  const startedAt = Date.now();
  const deadline = startedAt + timeBudgetMs;

  let bestMove: number | null = null;
  let bestScore = -Infinity;
  let completed = true;

  for (let d = 1; d <= maxDepth; d++) {
    if (Date.now() > deadline || aborted()) break;
    const candidates = orderedCandidates(board, side, branchCap);
    let iterBest: number | null = null;
    let iterScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;
    let iterCompleted = true;
    for (const idx of candidates) {
      if (!isLegal(board, idx)) continue;
      const next = applyMove(board, idx);
      const child = negamax(
        next,
        otherPlayer(side),
        d - 1,
        -beta,
        -alpha,
        deadline,
        branchCap,
        aborted,
      );
      const score = -child.score;
      if (!child.completed) iterCompleted = false;
      if (score > iterScore) {
        iterScore = score;
        iterBest = idx;
      }
      if (score > alpha) alpha = score;
      if (Date.now() > deadline || aborted()) {
        iterCompleted = false;
        break;
      }
    }
    if (iterBest !== null && iterCompleted) {
      bestMove = iterBest;
      bestScore = iterScore;
    } else if (iterBest !== null && bestMove === null) {
      // Even if not completed, take the best partial answer if we have nothing yet.
      bestMove = iterBest;
      bestScore = iterScore;
    }
    if (!iterCompleted) {
      completed = false;
      break;
    }
  }
  if (bestMove === null) {
    const legal = legalMoves(board);
    bestMove = legal.length > 0 ? legal[0] : null;
    completed = true;
  }
  return { move: bestMove, score: bestScore, completed };
}

export function chooseHardMove(board: BoardState): number | null {
  return searchHardMove(board).move;
}

/**
 * Async, yielding version. Same search as searchHardMove but `await`s a microtask between
 * root branches so input is never blocked for more than one branch's worth of compute.
 * Use this from the store / UI.
 */
export async function searchHardMoveAsync(
  board: BoardState,
  opts: Partial<SearchOptions> = {},
): Promise<SearchResult> {
  if (board.winner !== null) return { move: null, score: 0, completed: true };
  const side = board.toMove;
  const win = findImmediateWin(board.cells, side);
  if (win !== null) return { move: win, score: WIN_SCORE, completed: true };
  const block = findBlockingMove(board.cells, side);
  if (block !== null) return { move: block, score: WIN_SCORE / 2, completed: true };

  const timeBudgetMs = opts.timeBudgetMs ?? 600;
  const maxDepth = opts.depth ?? 4;
  const branchCap = opts.branchCap ?? 24;
  const aborted = opts.aborted ?? ((): boolean => false);
  const startedAt = Date.now();
  const deadline = startedAt + timeBudgetMs;

  let bestMove: number | null = null;
  let bestScore = -Infinity;

  for (let d = 1; d <= maxDepth; d++) {
    if (Date.now() > deadline || aborted()) break;
    const candidates = orderedCandidates(board, side, branchCap);
    let iterBest: number | null = null;
    let iterScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;
    let iterCompleted = true;
    for (const idx of candidates) {
      if (!isLegal(board, idx)) continue;
      // Yield before each root branch so the JS thread can paint / process input.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      if (Date.now() > deadline || aborted()) {
        iterCompleted = false;
        break;
      }
      const next = applyMove(board, idx);
      const child = negamax(
        next,
        otherPlayer(side),
        d - 1,
        -beta,
        -alpha,
        deadline,
        branchCap,
        aborted,
      );
      const score = -child.score;
      if (!child.completed) iterCompleted = false;
      if (score > iterScore) {
        iterScore = score;
        iterBest = idx;
      }
      if (score > alpha) alpha = score;
      if (Date.now() > deadline || aborted()) {
        iterCompleted = false;
        break;
      }
    }
    if (iterBest !== null && (iterCompleted || bestMove === null)) {
      bestMove = iterBest;
      bestScore = iterScore;
    }
    if (!iterCompleted) break;
  }
  if (bestMove === null) {
    const legal = legalMoves(board);
    bestMove = legal.length > 0 ? legal[0] : null;
  }
  return { move: bestMove, score: bestScore, completed: bestMove !== null };
}

export { evaluate as hardEvaluate };
