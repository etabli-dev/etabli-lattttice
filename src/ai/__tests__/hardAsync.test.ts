import { applyMove, createEmptyBoard } from '../../game/rules';
import { toIdx } from '../../game/coords';
import { searchHardMoveAsync } from '../hard';
import { findImmediateWin } from '../threats';

describe('searchHardMoveAsync — yields and respects budget', () => {
  it('still finds the immediate win', async () => {
    let b = createEmptyBoard();
    b = applyMove(b, toIdx(0, 0, 0, 0));
    b = applyMove(b, toIdx(1, 1, 1, 1));
    b = applyMove(b, toIdx(1, 0, 0, 0));
    b = applyMove(b, toIdx(2, 2, 2, 2));
    b = applyMove(b, toIdx(2, 0, 0, 0));
    b = applyMove(b, toIdx(3, 3, 3, 3));
    const res = await searchHardMoveAsync(b, { depth: 3, timeBudgetMs: 800 });
    expect(res.move).toBe(toIdx(3, 0, 0, 0));
  });

  it('returns a legal move on the empty board within the soft budget', async () => {
    const b = createEmptyBoard();
    const t0 = Date.now();
    const res = await searchHardMoveAsync(b, { depth: 4, timeBudgetMs: 600, branchCap: 24 });
    const elapsed = Date.now() - t0;
    expect(res.move).not.toBeNull();
    expect(res.move).toBeGreaterThanOrEqual(0);
    expect(res.move).toBeLessThan(256);
    // Allow generous overhead — yields + in-flight branch.
    expect(elapsed).toBeLessThan(3000);
  });

  it('honours abort signal', async () => {
    const b = createEmptyBoard();
    let aborted = false;
    setTimeout(() => (aborted = true), 5);
    const res = await searchHardMoveAsync(b, {
      depth: 5,
      timeBudgetMs: 5000,
      branchCap: 24,
      aborted: () => aborted,
    });
    expect(res.move).not.toBeNull();
  });

  it('does not block input — interleaves with other promises', async () => {
    // Start the search; concurrently, count how many "ticks" the event loop processes.
    const b = createEmptyBoard();
    let ticks = 0;
    let stop = false;
    const tickLoop = (async (): Promise<void> => {
      while (!stop) {
        ticks++;
        await new Promise<void>((r) => setTimeout(r, 0));
      }
    })();
    const res = await searchHardMoveAsync(b, { depth: 3, timeBudgetMs: 400, branchCap: 12 });
    stop = true;
    await tickLoop;
    // We expect at least a handful of ticks during the search — proves it yielded.
    expect(ticks).toBeGreaterThan(1);
    expect(res.move).not.toBeNull();
  });

  it('does not return an occupied / illegal move when there is a forced block', async () => {
    let b = createEmptyBoard();
    // X has 3 in a row at y=0,z=0,w=0. O to move.
    b = applyMove(b, toIdx(0, 0, 0, 0)); // X
    b = applyMove(b, toIdx(0, 1, 0, 0)); // O
    b = applyMove(b, toIdx(1, 0, 0, 0)); // X
    b = applyMove(b, toIdx(0, 2, 0, 0)); // O
    b = applyMove(b, toIdx(2, 0, 0, 0)); // X
    const forced = findImmediateWin(b.cells, 'X');
    expect(forced).toBe(toIdx(3, 0, 0, 0));
    const res = await searchHardMoveAsync(b, { depth: 3, timeBudgetMs: 600 });
    expect(res.move).toBe(toIdx(3, 0, 0, 0));
  });
});
