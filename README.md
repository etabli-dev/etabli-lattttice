# lattttice

A 4D 4×4×4×4 tic-tac-toe app — a tesseract of 256 cells with **520 winning lines**. Cross-platform React Native + Expo (TypeScript, strict).

> Naming: R/Bioconductor-style playful lowercase, stretching "lattice" (the 4D grid) into `lattttice`.

## Running

```bash
npm install --legacy-peer-deps
npx expo start
```

Then press `i` / `a` to launch the iOS Simulator or Android Emulator (Expo Go is fine for development).

Scripts:

| command           | what it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm test`        | Jest unit suite                                  |
| `npm run lint`    | ESLint over `src/` and `App.tsx`                 |
| `npm run typecheck` | `tsc --noEmit` (strict)                        |
| `npm start`       | `expo start`                                     |

## The game

A win is 4 cells in a 4D-straight line. Each coordinate of a line is either constant, strictly increasing (0→3), or strictly decreasing (3→0), and at least one coordinate varies. The total number of distinct winning lines for n=4 in d=4 is

```
((n+2)^d − n^d) / 2 = (1296 − 256) / 2 = 520
```

(`src/game/lines.ts` enumerates them; `src/game/__tests__/lines.test.ts` asserts the count and matches the closed-form formula. See `DECISIONS.md` for the deviation from the spec's verbatim "1016".)

## Views

The view switcher (segmented control at the top of the board) cycles through:

1. **Grid** — 4×4 outer panes of `(z, w)`, each pane a 4×4 `(x, y)` board. Default. Primary input surface.
2. **Slices** — 4 z-layers side by side; w slider on top scrubs the 4th dimension. Tap to play.
3. **3D** — Schlegel-style projection of the tesseract for spatial insight (read-only).
4. **Heat** — every empty cell shaded by move-strength for the side to move (viridis).

Switching views never mutates state.

## AI

Toggle **Mode → vs Computer** to play the AI as O. Three levels:

- **Easy** — random legal, but always takes an immediate win and blocks an immediate loss.
- **Medium** — 1-ply strength heuristic (`src/overlay/strength.ts`).
- **Hard** — iterative-deepening negamax with alpha-beta pruning over the same heuristic. Soft 600 ms budget, branching cap 12. Runs asynchronously off the UI thread (yields via `setTimeout(0)`).

## Strength overlay & top moves

Toggleable per player (Settings). When on, the top 5 cells for the side to move are ranked 1–5 with a colored halo in the active 2D view. **Heat** view shades every empty cell.

Strength function:

```
strength(c) = Σ over winning lines L through c:
                w_offense(L) + w_defense(L)
  empty line:        1            (centrality)
  only my marks:     3^k          (offense)
  only opp marks:    0.9 × 3^k    (defense)
  mixed:             0            (dead line)
```

## Win-probability analysis

After every move, an async, cancellable, debounced Monte-Carlo rollout (200 greedy-random playouts) estimates P(X), P(O), P(draw). The series is plotted at the bottom of the screen; the turning-point ply (largest swing) is annotated.

## Input gating

In **vs Computer** mode, the human plays X (moves first). The board accepts no taps while it's the AI's turn or while the AI is thinking — cells are disabled at the `Pressable` level and the store's `playAt` enforces the same guard so even programmatic dispatches respect it.

## Smooth transitions

View switching uses Reanimated for a 220 ms crossfade — visual continuity between the four very different visualisations of the same 4D board.

## Architecture

```
/src
  /game        engine: lines, win-check, rules, types
  /ai          easy / medium / hard, negamax, monte-carlo
  /state       Zustand store + AsyncStorage persistence
  /views       GridOfGrids, ZSlices, Projection3D, HeatView, ViewSwitcher
  /overlay     strength function, ranked badges
  /analysis    probability rollouts, ProbChart
  /ui          theme, segmented control, status bar, settings
App.tsx
```

## Accessibility

- Color-blind-safe palette (blue / orange, no red/green).
- Every cell carries an accessible label of the form `x3 y1 z0 w2, empty` for VoiceOver / TalkBack.
- Status text uses an `accessibilityLiveRegion="polite"` region for turn changes and wins.

## Persistence

The current game and all settings are persisted via `@react-native-async-storage/async-storage` and restored on relaunch. "New Game" resets the board and probability history.
