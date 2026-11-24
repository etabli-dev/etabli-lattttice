import { Mark } from '../game/types';
import { Coord } from '../game/types';
import { STRINGS, Strings } from '../i18n/strings';

export function describeCell(coord: Coord, mark: Mark, t: Strings = STRINGS.en): string {
  return t.cellA11y(coord.x, coord.y, coord.z, coord.w, mark);
}
