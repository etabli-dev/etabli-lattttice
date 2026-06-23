/**
 * Color-blind-safe palette (avoids red/green).
 * X = deep blue, O = warm yellow-orange — distinguishable for protanopia/deuteranopia/tritanopia.
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
