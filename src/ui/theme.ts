import {
  ACCENT_VALUES,
  AccentChoice,
  CODER_PALETTE,
  ColorScheme,
  SELECTION_OPACITY,
  blend,
  selectionTint,
} from '../settings/appearance';

/**
 * The game palette, fixed in both modes (see DECISIONS.md, "Appearance"): the board panes, cells,
 * marks, winning line, heat scale, 3D projection and probability chart. Colour-blind safe (avoids
 * red/green): X = deep blue, O = warm yellow-orange, distinguishable for protanopia, deuteranopia
 * and tritanopia.
 */
export const theme = {
  bg: '#0b0e14',
  panel: '#141923',
  panelStrong: '#1d2433',
  border: '#2a3346',
  text: '#e8eef7',
  textMuted: '#8a98b0',
  accent: '#7aa7ff',
  X: '#3aa0ff', // deep blue
  O: '#ffb455', // warm orange
  win: '#9af7c8',
  overlayHalo: 'rgba(154, 247, 200, 0.45)',
  heatMin: '#2c3e66',
  heatMid: '#7aa7ff',
  heatMax: '#fff0a8',
} as const;

export type Theme = typeof theme;

/** Colours of the UI chrome around the game surfaces: the chosen mode (Hugo Coder neutrals) and accent. */
export interface Chrome {
  readonly scheme: ColorScheme;
  readonly bg: string;
  readonly surface: string;
  readonly border: string;
  readonly text: string;
  /** Secondary text; at least 4.5:1 on `bg` and `surface`. */
  readonly textDim: string;
  readonly accent: string;
  readonly onAccent: string;
  /** Opaque selection fill: the selection tint at SELECTION_OPACITY over `surface`. */
  readonly selection: string;
  readonly statusBar: 'light-content' | 'dark-content';
}

export const TEXT_DIM = { light: '#5C5C5C', dark: '#B8B8B8' } as const;

export function chromeColors(scheme: ColorScheme, accent: AccentChoice): Chrome {
  const dark = scheme === 'dark';
  const surface = dark ? CODER_PALETTE.surfaceDark : CODER_PALETTE.surfaceLight;
  return {
    scheme,
    bg: dark ? CODER_PALETTE.backgroundDark : CODER_PALETTE.backgroundLight,
    surface,
    border: dark ? CODER_PALETTE.borderDark : CODER_PALETTE.borderLight,
    text: dark ? CODER_PALETTE.foregroundDark : CODER_PALETTE.foregroundLight,
    textDim: TEXT_DIM[scheme],
    accent: ACCENT_VALUES[accent][scheme],
    onAccent: dark ? CODER_PALETTE.onAccentDark : CODER_PALETTE.onAccentLight,
    selection: blend(selectionTint(accent, scheme), surface, SELECTION_OPACITY),
    statusBar: dark ? 'light-content' : 'dark-content',
  };
}
