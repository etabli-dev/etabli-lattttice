/**
 * Every user-facing string of the game, in English and German. `short` entries are the visible
 * labels of controls that must fit on one line down to a 375-pt-wide iPhone SE; the matching full
 * text stays the accessibility label. Pure TypeScript, so tests can compare both catalogues.
 */
import type { Language } from '../settings/appearance';

type MarkName = 'X' | 'O';

const en = {
  loadingSaved: 'Loading saved game…',
  loading: 'loading…',
  saveFailed: 'Could not save this game. Keep the app open and free some storage.',
  loadFailed: 'The saved game could not be loaded and has been preserved. New game replaces it.',
  engineLoading: 'Loading game…',

  views: {
    grid: { short: 'Grid', full: 'Grid' },
    slices: { short: 'Slices', full: 'Slices' },
    projection: { short: '3D', full: '3D' },
    heat: { short: 'Heat', full: 'Heat' },
  },
  viewA11y: 'View',

  wins: (mark: MarkName) => `${mark} wins!`,
  draw: 'Draw',
  computerThinking: 'Computer thinking…',
  toMove: (mark: MarkName) => `${mark} to move`,
  analysing: 'analysing…',

  cellA11y: (x: number, y: number, z: number, w: number, mark: MarkName | null) =>
    `x${x} y${y} z${z} w${w}, ${mark ?? 'empty'}`,
  paneA11y: (z: number, w: number) => `z${z} w${w}`,
  wSlider: 'w slider',
  setW: (w: number) => `set w to ${w}`,

  heatCaption: (mark: MarkName) => `Heat-view — every empty cell shaded by strength for ${mark}`,
  heatLegendA11y: 'heat scale legend',
  projectionCaption: '3D Schlegel projection (read-only)',
  projectionHint: 'Tap a cell in the 2D views to play. This projection is for spatial insight.',

  probTitle: 'Win probability',
  probEmpty: 'Play a move to see analysis.',
  probDraw: 'Draw',
  turningPoint: (ply: number, side: string, delta: string) => `Turning point — ply ${ply}, Δp(${side}) ≈ ${delta}`,
  probScale: (xMax: number) => `x: ply 0…${xMax}   y: 0…1`,

  modeLabel: 'Mode',
  modeA11y: 'Game mode',
  hotseat: { short: 'Hotseat', full: 'Hotseat' },
  vsComputer: { short: 'vs Computer', full: 'vs Computer' },
  aiLevelLabel: 'AI level',
  aiLevelA11y: 'AI difficulty',
  aiEasy: 'Easy',
  aiMedium: 'Medium',
  aiHard: 'Hard',
  overlayLabel: 'Overlay (per player)',
  hints: (mark: MarkName) => ({ short: `${mark} hints`, full: `${mark} — strength hints` }),
  newGame: 'New Game',

  appearanceTitle: 'Appearance',
  languageLabel: 'App language',
  languageSystem: 'System',
  appearanceModeLabel: 'Mode',
  modeSystem: 'System',
  modeLight: 'Light',
  modeDark: 'Dark',
  accentLabel: 'Accent colour',
  accentNames: {
    coderBlue: 'Coder blue',
    green: 'Green',
    yellow: 'Yellow',
    orange: 'Orange',
    red: 'Red',
    purple: 'Purple',
    graphite: 'Graphite',
  },
  appearanceNote: 'Language, mode and accent apply at once. The board keeps the game palette.',
};

export type Strings = typeof en;

const de: Strings = {
  loadingSaved: 'Gespeichertes Spiel wird geladen…',
  loading: 'Lädt…',
  saveFailed: 'Das Spiel konnte nicht gespeichert werden. App geöffnet lassen und Speicherplatz freigeben.',
  loadFailed:
    'Das gespeicherte Spiel konnte nicht geladen werden und bleibt erhalten. „Neues Spiel“ ersetzt es.',
  engineLoading: 'Spiel wird geladen…',

  views: {
    grid: { short: 'Raster', full: 'Raster' },
    slices: { short: 'Ebenen', full: 'Ebenen' },
    projection: { short: '3D', full: '3D' },
    heat: { short: 'Heatmap', full: 'Heatmap' },
  },
  viewA11y: 'Ansicht',

  wins: (mark) => `${mark} gewinnt!`,
  draw: 'Unentschieden',
  computerThinking: 'Computer denkt nach…',
  toMove: (mark) => `${mark} am Zug`,
  analysing: 'Analyse läuft…',

  cellA11y: (x, y, z, w, mark) => `x${x} y${y} z${z} w${w}, ${mark ?? 'leer'}`,
  paneA11y: (z, w) => `z${z} w${w}`,
  wSlider: 'w-Auswahl',
  setW: (w) => `w auf ${w} setzen`,

  heatCaption: (mark) => `Heatmap – jedes freie Feld nach Zugstärke für ${mark} eingefärbt`,
  heatLegendA11y: 'Legende der Farbskala',
  projectionCaption: '3D-Schlegel-Projektion (nur Ansicht)',
  projectionHint: 'Gespielt wird in den 2D-Ansichten. Die Projektion zeigt die räumliche Lage.',

  probTitle: 'Gewinnchance',
  probEmpty: 'Nach dem ersten Zug erscheint die Analyse.',
  probDraw: 'Remis',
  turningPoint: (ply, side, delta) => `Wendepunkt – Zug ${ply}, Δp(${side}) ≈ ${delta}`,
  probScale: (xMax) => `x: Zug 0…${xMax}   y: 0…1`,

  modeLabel: 'Spielmodus',
  modeA11y: 'Spielmodus',
  hotseat: { short: 'Zu zweit', full: 'Zu zweit an einem Gerät' },
  vsComputer: { short: 'Gegen Computer', full: 'Gegen den Computer' },
  aiLevelLabel: 'Computerstärke',
  aiLevelA11y: 'Computerstärke',
  aiEasy: 'Leicht',
  aiMedium: 'Mittel',
  aiHard: 'Schwer',
  overlayLabel: 'Zughilfe (je Spieler)',
  hints: (mark) => ({ short: `Tipps ${mark}`, full: `${mark} – Hinweise zur Zugstärke` }),
  newGame: 'Neues Spiel',

  appearanceTitle: 'Darstellung',
  languageLabel: 'App-Sprache',
  languageSystem: 'System',
  appearanceModeLabel: 'Modus',
  modeSystem: 'System',
  modeLight: 'Hell',
  modeDark: 'Dunkel',
  accentLabel: 'Akzentfarbe',
  accentNames: {
    coderBlue: 'Coder-Blau',
    green: 'Grün',
    yellow: 'Gelb',
    orange: 'Orange',
    red: 'Rot',
    purple: 'Violett',
    graphite: 'Graphit',
  },
  appearanceNote: 'Sprache, Modus und Akzentfarbe gelten sofort. Das Brett behält die Spielfarben.',
};

export const STRINGS: Readonly<Record<Language, Strings>> = { en, de };
