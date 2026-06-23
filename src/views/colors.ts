import { theme } from '../ui/theme';
import { Mark } from '../game/types';

export function colorForMark(m: Mark): string {
  if (m === 'X') return theme.X;
  if (m === 'O') return theme.O;
  return theme.panel;
}

/**
 * Approximate viridis gradient. t ∈ [0,1].
 */
export function viridis(t: number): string {
  const stops: ReadonlyArray<{ t: number; rgb: [number, number, number] }> = [
    { t: 0.0, rgb: [68, 1, 84] },
    { t: 0.25, rgb: [59, 82, 139] },
    { t: 0.5, rgb: [33, 145, 140] },
    { t: 0.75, rgb: [94, 201, 98] },
    { t: 1.0, rgb: [253, 231, 37] },
  ];
  const x = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i].t) {
      const a = stops[i - 1];
      const b = stops[i];
      const span = b.t - a.t;
      const k = span === 0 ? 0 : (x - a.t) / span;
      const r = Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * k);
      const g = Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * k);
      const bl = Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * k);
      return `rgb(${r},${g},${bl})`;
    }
  }
  return 'rgb(253,231,37)';
}
