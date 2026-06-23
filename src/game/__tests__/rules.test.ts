import { Mark, TOTAL_CELLS } from '../types';
import { toIdx } from '../coords';
import {
  applyMove,
  createEmptyBoard,
  findWinningLineAt,
  fullScanWinner,
  isBoardFull,
  isLegal,
  legalMoves,
} from '../rules';

function emptyCells(): Mark[] {
  return new Array<Mark>(TOTAL_CELLS).fill(null);
}

describe('win detection — positive cases', () => {
  it('pure axis line: y=z=w=0, x varies', () => {
    const cells = emptyCells();
    [0, 1, 2, 3].forEach((x) => (cells[toIdx(x, 0, 0, 0)] = 'X'));
    const line = findWinningLineAt(cells, toIdx(3, 0, 0, 0), 'X');
    expect(line).not.toBeNull();
  });

  it('2-coord diagonal: x=y, z=w=0', () => {
    const cells = emptyCells();
    [0, 1, 2, 3].forEach((k) => (cells[toIdx(k, k, 0, 0)] = 'O'));
    const line = findWinningLineAt(cells, toIdx(2, 2, 0, 0), 'O');
    expect(line).not.toBeNull();
  });

  it('3-coord diagonal: x=y=z, w=0', () => {
    const cells = emptyCells();
    [0, 1, 2, 3].forEach((k) => (cells[toIdx(k, k, k, 0)] = 'X'));
    const line = findWinningLineAt(cells, toIdx(1, 1, 1, 0), 'X');
    expect(line).not.toBeNull();
  });

  it('full 4-coord space diagonal: x=y=z=w', () => {
    const cells = emptyCells();
    [0, 1, 2, 3].forEach((k) => (cells[toIdx(k, k, k, k)] = 'O'));
    const line = findWinningLineAt(cells, toIdx(0, 0, 0, 0), 'O');
    expect(line).not.toBeNull();
  });

  it('anti-diagonal: x increases, y decreases, z=w=0', () => {
    const cells = emptyCells();
    for (let k = 0; k < 4; k++) cells[toIdx(k, 3 - k, 0, 0)] = 'X';
    const line = findWinningLineAt(cells, toIdx(3, 0, 0, 0), 'X');
    expect(line).not.toBeNull();
  });
});

describe('win detection — negative cases', () => {
  it('three in a line + a gap is NOT a win', () => {
    const cells = emptyCells();
    [0, 1, 3].forEach((x) => (cells[toIdx(x, 0, 0, 0)] = 'X'));
    expect(findWinningLineAt(cells, toIdx(3, 0, 0, 0), 'X')).toBeNull();
    expect(fullScanWinner(cells)).toBeNull();
  });

  it('mixed line (X and O) is NOT a win', () => {
    const cells = emptyCells();
    cells[toIdx(0, 0, 0, 0)] = 'X';
    cells[toIdx(1, 0, 0, 0)] = 'O';
    cells[toIdx(2, 0, 0, 0)] = 'X';
    cells[toIdx(3, 0, 0, 0)] = 'O';
    expect(fullScanWinner(cells)).toBeNull();
  });

  it('bent / non-line (not along a valid direction) is NOT a win', () => {
    const cells = emptyCells();
    // y=0,0,1,0 — not a valid step pattern
    cells[toIdx(0, 0, 0, 0)] = 'X';
    cells[toIdx(1, 0, 0, 0)] = 'X';
    cells[toIdx(2, 1, 0, 0)] = 'X';
    cells[toIdx(3, 0, 0, 0)] = 'X';
    // No straight line through all four; the actual straight-axis line is missing one mark.
    expect(fullScanWinner(cells)).toBeNull();
  });
});

describe('applyMove and turn order', () => {
  it('alternates X and O; rejects occupied cells', () => {
    let b = createEmptyBoard();
    expect(b.toMove).toBe('X');
    b = applyMove(b, 0);
    expect(b.toMove).toBe('O');
    expect(b.cells[0]).toBe('X');
    expect(() => applyMove(b, 0)).toThrow();
    b = applyMove(b, 1);
    expect(b.toMove).toBe('X');
    expect(b.cells[1]).toBe('O');
  });

  it('detects a winning move and sets winner + winningLine', () => {
    let b = createEmptyBoard();
    // X aims to complete the x-axis line at y=z=w=0.
    // X: (0,0,0,0)  O: (1,1,0,0)
    // X: (1,0,0,0)  O: (2,1,0,0)
    // X: (2,0,0,0)  O: (3,1,0,0)
    // X: (3,0,0,0)  → wins on x-axis line at y=z=w=0
    b = applyMove(b, toIdx(0, 0, 0, 0)); // X
    b = applyMove(b, toIdx(1, 1, 0, 0)); // O
    b = applyMove(b, toIdx(1, 0, 0, 0)); // X
    b = applyMove(b, toIdx(2, 1, 0, 0)); // O
    b = applyMove(b, toIdx(2, 0, 0, 0)); // X
    b = applyMove(b, toIdx(3, 1, 0, 0)); // O
    b = applyMove(b, toIdx(3, 0, 0, 0)); // X — winning move
    expect(b.winner).toBe('X');
    expect(b.winningLine).not.toBeNull();
    // After a win, toMove should remain the winner (no further moves).
    expect(b.toMove).toBe('X');
  });

  it('isLegal / legalMoves shrink as moves are played', () => {
    let b = createEmptyBoard();
    expect(legalMoves(b).length).toBe(TOTAL_CELLS);
    b = applyMove(b, 7);
    expect(legalMoves(b).length).toBe(TOTAL_CELLS - 1);
    expect(isLegal(b, 7)).toBe(false);
    expect(isLegal(b, 8)).toBe(true);
  });

  it('isBoardFull works', () => {
    const cells = emptyCells();
    expect(isBoardFull(cells)).toBe(false);
    for (let i = 0; i < TOTAL_CELLS; i++) cells[i] = i % 2 === 0 ? 'X' : 'O';
    expect(isBoardFull(cells)).toBe(true);
  });
});
