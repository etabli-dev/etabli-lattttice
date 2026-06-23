import { BoardState, Line, Mark, Player, TOTAL_CELLS } from './types';
import { LINES, LINES_THROUGH_CELL } from './lines';

export function createEmptyBoard(): BoardState {
  return {
    cells: new Array<Mark>(TOTAL_CELLS).fill(null),
    toMove: 'X',
    winner: null,
    winningLine: null,
    moveLog: [],
  };
}

export function otherPlayer(p: Player): Player {
  return p === 'X' ? 'O' : 'X';
}

export function isLegal(board: BoardState, idx: number): boolean {
  if (board.winner !== null) return false;
  if (idx < 0 || idx >= TOTAL_CELLS) return false;
  return board.cells[idx] === null;
}

/**
 * Check whether the cell just played at `idx` completes a winning line for `mark`.
 * Returns the line if yes, otherwise null.
 */
export function findWinningLineAt(
  cells: ReadonlyArray<Mark>,
  idx: number,
  mark: Player,
): Line | null {
  const candidates = LINES_THROUGH_CELL[idx];
  for (let i = 0; i < candidates.length; i++) {
    const line = LINES[candidates[i]];
    if (
      cells[line[0]] === mark &&
      cells[line[1]] === mark &&
      cells[line[2]] === mark &&
      cells[line[3]] === mark
    ) {
      return line;
    }
  }
  return null;
}

/**
 * Full-board winner scan (used by tests & rollouts; per-move uses findWinningLineAt for speed).
 */
export function fullScanWinner(
  cells: ReadonlyArray<Mark>,
): { winner: Player; line: Line } | null {
  for (let li = 0; li < LINES.length; li++) {
    const line = LINES[li];
    const a = cells[line[0]];
    if (a === null) continue;
    if (cells[line[1]] === a && cells[line[2]] === a && cells[line[3]] === a) {
      return { winner: a, line };
    }
  }
  return null;
}

export function isBoardFull(cells: ReadonlyArray<Mark>): boolean {
  for (let i = 0; i < cells.length; i++) if (cells[i] === null) return false;
  return true;
}

export function isDraw(board: BoardState): boolean {
  return board.winner === null && isBoardFull(board.cells);
}

/**
 * Apply a move and return a new board state. Throws if illegal.
 */
export function applyMove(board: BoardState, idx: number): BoardState {
  if (!isLegal(board, idx)) {
    throw new Error(`Illegal move at idx ${idx}`);
  }
  const mark = board.toMove;
  const newCells = board.cells.slice();
  newCells[idx] = mark;
  const winningLine = findWinningLineAt(newCells, idx, mark);
  return {
    cells: newCells,
    toMove: winningLine ? mark : otherPlayer(mark),
    winner: winningLine ? mark : null,
    winningLine: winningLine,
    moveLog: [...board.moveLog, idx],
  };
}

export function legalMoves(board: BoardState): number[] {
  if (board.winner !== null) return [];
  const out: number[] = [];
  for (let i = 0; i < board.cells.length; i++) {
    if (board.cells[i] === null) out.push(i);
  }
  return out;
}
