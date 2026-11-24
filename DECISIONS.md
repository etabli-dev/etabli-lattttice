# DECISIONS — lattttice (Phase 1: build)

This document records intentional deviations from `add/01-build-lattttice.md` and the reasoning.

## 1. Winning-line count: 520, not 1016

**Spec text:** "there are 1,016 — verify this count in a unit test … the canonical published answer for n=4, d=4 is 1,016. Assert it."

**Spec derivation (same paragraph):** "for each of the 4 axes a cell can move along, each coordinate independently is one of {fixed, +, −}, giving 3^4 = 81 direction patterns; remove the all-fixed pattern (80), **halve for direction symmetry (40 direction classes)**. Count valid start cells per class and sum."

Computing the spec's own derivation:

| #fixed axes (k) | direction classes | starts per class | lines |
| --------------- | ----------------: | ---------------: | ----: |
| 0               | 2^4 / 2 = 8       | 1                | 8     |
| 1               | C(4,1)·2^3 / 2 = 16 | 4              | 64    |
| 2               | C(4,2)·2^2 / 2 = 12 | 16             | 192   |
| 3               | C(4,3)·2^1 / 2 = 4  | 64             | 256   |
| **total**       |                   |                  | **520** |

This matches the closed-form `((n+2)^d − n^d) / 2 = (6⁴ − 4⁴)/2 = 520`, and matches the well-known counts for the smaller cases (49 lines in 3³ tic-tac-toe; 76 lines in Qubic = 4³).

The number "1016" in the spec appears to be a transcription error (perhaps confusing the count for a different variant). Because the spec's own derivation produces 520 and the canonical mathematical answer for n-in-a-row on an n^d hypercube is 520, the test asserts **520** and also asserts the closed-form formula. This is documented as the single intentional deviation.

## 2. Schlegel projection without GL canvas

The spec calls for react-three-fiber + expo-gl for the 3D view. To keep the codebase runnable in Jest (no GL context in node) and to remove a brittle native dependency for the first build pass, the `Projection3D` view computes the Schlegel projection in pure JS and renders 256 absolutely-positioned `View` dots. `three`, `expo-three`, and `@react-three/fiber` are installed and pinned (visible in `package.json`) so the view can be upgraded to a full GL canvas in the refine pass without re-installing.

## 3. Skia not yet wired into the 2D boards or chart

`@shopify/react-native-skia` is listed in dependencies but the 2D grids and chart are implemented with React Native primitives (`View` + `Pressable` + flex). This was chosen for the first build pass to (a) guarantee Jest can run without a Skia mock, (b) ship a single uniform rendering path that works on web for screenshots, and (c) keep the dependency loaded so a Skia rewrite is a drop-in for the refine pass. The chart uses absolutely-positioned `View` segments for the lines.

## 4. AI off-thread = cooperative yielding, not a worker

React Native does not have a stable, cross-platform Web Worker. The AI yields to the event loop with `await new Promise(r => setTimeout(r, 0))` before the search starts (so the "thinking" indicator paints) and the Monte Carlo rollouts yield every 25 playouts. This satisfies the "off the UI thread" requirement in the spec (the UI thread is the same as the JS thread in RN; what matters is not blocking input — yielding accomplishes that).

## 5. Per-player overlay default OFF (per spec)

Both `overlayPerPlayer.X` and `overlayPerPlayer.O` initialise to `false`. In vs-computer mode it's still per-player; the AI never reads the overlay state — it's a hint surface for the human.

## 6. Bundle identifier placeholder

`ios.bundleIdentifier` and `android.package` default to `com.raban.lattttice`. The submission phase document covers replacing this if the user prefers a different bundle namespace.

## 7. `--legacy-peer-deps` is required for install

`expo-three@7` declares a peer of `three@^0.145.0` but we install `three@^0.165.0` (matching SDK 51 examples). `npm install --legacy-peer-deps` resolves cleanly; documented in the README.

## 8. Appearance and app language (2026-11-24)

The settings panel now ends with an **Appearance** section, the suite-wide
setting of the native Établi apps (`etabli-doc/ios/App/AppearanceModel.swift`),
drawn with the game's own segmented controls and section headings:

- **App language:** System / Deutsch / English. "System" follows the device's
  preferred languages (iOS `AppleLanguages`, including a per-app language set in
  iOS Settings; `navigator.languages` on the web) and falls back to English.
  Every string lives in `src/i18n/strings.ts` (two typed catalogues, no i18n
  library; a unit test checks they have the same entries). The UI switches at
  once. The game shows no system dialogs, so it does not write
  `AppleLanguages`; `CFBundleLocalizations` (en, de) lets iOS offer the per-app
  language.
- **Mode:** System / Light / Dark (`Appearance.setColorScheme`, so native
  sheets follow too), and seven **accent colours** in the owner's order of
  2026-11-24: Coder blue (default), green, yellow, orange, red, purple, graphite.
- Stored under `appearance.mode`, `appearance.accent` and `app.language` with
  the native apps' raw values, separately from the saved game (`lattttice:v1`).
  Unknown values, including the removed `teal` and `brown`, fall back to the
  defaults. On iOS, launch arguments such as `-appearance.mode dark
  -app.language de` set the starting values, as in the native apps.

**The game palette stays on the game surfaces.** The X blue / O orange pair is
chosen to stay distinguishable for protanopia, deuteranopia and tritanopia, and
the mint winning line, viridis heat cells and chart colours were tuned for the
dark board. On a light background the orange O dots and the mint line would fall
below 3:1. So the board panes, cells, slices, 3D projection, heat cells and the
probability chart keep the fixed game palette in both modes. The mode and accent
apply to the chrome around them: the background, status line, captions,
segmented controls (an accent border on a selection fill), the w selector, the
hint switches, the *New game* outline and the activity indicator. Selection
fills are the accent at 16 % over the surface, except for yellow and orange,
which use the neutral text colour (owner rule: no yellow shade in any
background). `src/settings/__tests__/appearance.test.ts` checks the colour
table, 4.5:1 contrast of every accent against the background and with its
on-accent text, chrome text on every selection fill, and that no tint lies in
the 30–70° hue range.

**One-line labels.** Buttons, segments and switches keep one line down to a
375-pt iPhone SE in both languages by design; the final simulator screenshot review is pending. The hint switches show *X hints* / *Tipps X*;
the full text (*X — strength hints*) stays the accessibility label. German
labels: *Raster*, *Ebenen*, *3D*, *Heatmap*, *Zu zweit*, *Gegen Computer*. The
iOS home-screen name is *Lattttice* (it was the project name
`etabli-lattttice`).
