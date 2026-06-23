import { Mark } from '../game/types';
import { Coord } from '../game/types';

export function describeCell(coord: Coord, mark: Mark): string {
  const who = mark === null ? 'empty' : mark;
  return `x${coord.x} y${coord.y} z${coord.z} w${coord.w}, ${who}`;
}
