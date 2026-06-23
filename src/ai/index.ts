import { AiLevel, BoardState } from '../game/types';
import { chooseEasyMove } from './easy';
import { chooseMediumMove } from './medium';
import { chooseHardMove, searchHardMove } from './hard';

export * from './easy';
export * from './medium';
export * from './hard';
export * from './threats';
export * from './montecarlo';

export function chooseMove(level: AiLevel, board: BoardState): number | null {
  switch (level) {
    case 'easy':
      return chooseEasyMove(board);
    case 'medium':
      return chooseMediumMove(board);
    case 'hard':
      return chooseHardMove(board);
    default:
      return chooseEasyMove(board);
  }
}

export { searchHardMove };
