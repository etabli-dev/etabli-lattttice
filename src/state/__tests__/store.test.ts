/**
 * Store-level tests. We mock @react-native-async-storage/async-storage with an in-memory
 * implementation so persist/hydrate round-trip can be tested in node.
 */
import { useStore } from '../store';
import { toIdx } from '../../game/coords';
import { TOTAL_CELLS } from '../../game/types';

jest.mock('@react-native-async-storage/async-storage', () => {
  let mem = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((k: string): Promise<string | null> => Promise.resolve(mem.get(k) ?? null)),
      setItem: jest.fn((k: string, v: string): Promise<void> => {
        mem.set(k, v);
        return Promise.resolve();
      }),
      removeItem: jest.fn((k: string): Promise<void> => {
        mem.delete(k);
        return Promise.resolve();
      }),
      __reset: (): void => {
        mem = new Map<string, string>();
      },
    },
  };
});

function reset(): void {
  useStore.setState({
    cells: new Array(TOTAL_CELLS).fill(null),
    toMove: 'X',
    winner: null,
    winningLine: null,
    moveLog: [],
    mode: 'hotseat',
    aiLevel: 'medium',
    view: 'grid-of-grids',
    overlayPerPlayer: { X: false, O: false },
    probHistory: [],
    turningPoint: null,
    isThinking: false,
    isAnalysing: false,
    currentZ: 0,
    currentW: 0,
    hydrated: true,
  });
}

describe('store.playAt — input gating during AI turn (D4)', () => {
  beforeEach(reset);

  it('hotseat: each tap alternates X and O', () => {
    useStore.getState().setMode('hotseat');
    useStore.getState().playAt(toIdx(0, 0, 0, 0));
    expect(useStore.getState().cells[toIdx(0, 0, 0, 0)]).toBe('X');
    expect(useStore.getState().toMove).toBe('O');
    useStore.getState().playAt(toIdx(1, 0, 0, 0));
    expect(useStore.getState().cells[toIdx(1, 0, 0, 0)]).toBe('O');
  });

  it("vs-computer: human cannot tap during AI's turn (toMove === 'O')", () => {
    // Manually arm state: vs-computer mode, board where O is to move.
    useStore.setState({
      mode: 'vs-computer',
      toMove: 'O',
    });
    // Human attempts to play in O's slot via playAt.
    useStore.getState().playAt(toIdx(0, 0, 0, 0));
    // The cell must remain empty — the AI is the only legal mover.
    expect(useStore.getState().cells[toIdx(0, 0, 0, 0)]).toBeNull();
  });

  it("vs-computer: human can tap when it's X's turn", () => {
    useStore.setState({ mode: 'vs-computer', toMove: 'X' });
    useStore.getState().playAt(toIdx(0, 0, 0, 0));
    expect(useStore.getState().cells[toIdx(0, 0, 0, 0)]).toBe('X');
  });
});

describe('store persist / hydrate round-trip (E3)', () => {
  beforeEach(reset);

  it('persists current game and restores it via hydrate', async () => {
    useStore.getState().setMode('hotseat');
    useStore.getState().playAt(toIdx(0, 0, 0, 0));
    useStore.getState().playAt(toIdx(1, 1, 1, 1));
    useStore.getState().setOverlayForPlayer('X', true);
    useStore.getState().setView('heat-view');
    // Wait a microtask so the async persist completes.
    await new Promise<void>((r) => setTimeout(r, 0));

    // Reset all in-memory state but leave the AsyncStorage mock intact.
    reset();
    useStore.setState({ hydrated: false });
    await useStore.getState().hydrate();

    expect(useStore.getState().cells[toIdx(0, 0, 0, 0)]).toBe('X');
    expect(useStore.getState().cells[toIdx(1, 1, 1, 1)]).toBe('O');
    expect(useStore.getState().overlayPerPlayer.X).toBe(true);
    expect(useStore.getState().view).toBe('heat-view');
  });
});

describe('view switching never mutates board (D1 add-on)', () => {
  beforeEach(reset);

  it('cycling all 4 views after 5 moves leaves cells / toMove unchanged', () => {
    const moves = [
      toIdx(0, 0, 0, 0),
      toIdx(1, 1, 1, 1),
      toIdx(2, 2, 2, 2),
      toIdx(0, 1, 2, 3),
      toIdx(3, 0, 1, 2),
    ];
    for (const m of moves) useStore.getState().playAt(m);
    const before = useStore.getState();
    const cellsBefore = before.cells.slice();
    const toMoveBefore = before.toMove;

    const views = ['grid-of-grids', 'z-slices', 'projection-3d', 'heat-view'] as const;
    for (const v of views) useStore.getState().setView(v);

    const after = useStore.getState();
    expect(after.cells).toEqual(cellsBefore);
    expect(after.toMove).toBe(toMoveBefore);
  });
});
