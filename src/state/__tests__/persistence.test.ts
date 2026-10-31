import { decodeSavedGame } from '../persistence';
import { applyMove, createEmptyBoard } from '../../game/rules';

function snapshot(): Record<string, unknown> {
  const board = applyMove(applyMove(createEmptyBoard(), 0), 85);
  return { ...board, mode: 'hotseat', aiLevel: 'medium', view: 'heat-view',
    overlayPerPlayer: { X: true, O: false }, probHistory: [], currentZ: 1, currentW: 3 };
}

describe('saved game validation', () => {
  it('restores a legal game with its settings', () => {
    const value = snapshot();
    expect(decodeSavedGame(JSON.stringify(value))).toEqual(value);
  });
  it.each([
    ['repeated move', { moveLog: [0, 0] }],
    ['fractional move', { moveLog: [0, 1.5] }],
    ['invented board', { cells: new Array(256).fill('X') }],
    ['wrong turn', { toMove: 'O' }],
    ['impossible result', { winner: 'X' }],
    ['bad view', { view: 'missing-view' }],
    ['bad axis', { currentW: 4 }],
    ['invalid probability', { probHistory: [{ ply: 1, pX: 1, pO: 1, pDraw: 0 }] }],
  ])('refuses %s without treating it as an empty saved game', (_, corrupt) => {
    expect(() => decodeSavedGame(JSON.stringify({ ...snapshot(), ...corrupt }))).toThrow();
  });
});
