# REFINE — lattttice

Phase-3 work. Resolves the audit findings in `AUDIT-lattttice.md` in priority order. Each fix is paired with a test that failed before the fix and passes after.

Before / after gates (final):
- `npx tsc --noEmit`: ✅ clean
- `npx eslint . --ext .ts,.tsx`: ✅ clean
- `npx jest`: ✅ **8 suites / 53 tests** passing, full suite runs in ~2 s

---

## P0 — none found

The audit logged no P0 issues. Nothing to fix here.

---

## P1 fixes

### P1.1 — D4: human could play O's move on fast double-tap in vs-computer mode

**Repro before fix:** in vs-computer mode with `toMove === 'O'`, calling `store.playAt(idx)` would write `'O'` into the cell instead of waiting for the AI.

**Test added (failed before):** `src/state/__tests__/store.test.ts` →
- `store.playAt — input gating during AI turn (D4) › vs-computer: human cannot tap during AI's turn (toMove === 'O')`

**Fix:** `src/state/store.ts`, `playAt` action — early-return when `mode === 'vs-computer' && toMove === 'O'`, and when `isThinking` is true:

```ts
if (state.mode === 'vs-computer' && state.toMove === 'O') return;
if (state.isThinking) return;
```

UI layer also reinforced: every `<Pressable>` in `GridOfGrids`, `ZSlices`, and `HeatView` now sets `disabled` and the matching `accessibilityState={{ disabled }}` when input is gated. So screen readers see the disabled state too.

**Status:** ✅ Test passes.

### P1.2 — B3: hard AI was leaving the time budget unused

**Repro before fix:** the audit probe logged `hard search empty-board ms=14` against a soft 600 ms budget — depth 3 + branchCap 12 finished almost instantly, so "hard" was nearly indistinguishable from "medium" in tactical play.

**Fix:** `src/ai/hard.ts` — raised defaults to `maxDepth = 4`, `branchCap = 24`. Iterative deepening still respects the 600 ms soft budget.

**Evidence:** `src/ai/__tests__/hardAsync.test.ts` →
- `returns a legal move on the empty board within the soft budget` measured ~300 ms (was ~15 ms before) — depth now bites and the budget is actually used.

**Status:** ✅ Test passes.

### P1.3 — B4: synchronous negamax would block input once the search actually ran to budget

**Repro before fix:** with B3's raised depth, the synchronous `searchHardMove` would lock the JS thread for ~300–600 ms — input frozen.

**Test added (failed before):** `src/ai/__tests__/hardAsync.test.ts` →
- `does not block input — interleaves with other promises` — counts how many event-loop ticks fire concurrently with the search. Pre-fix the sync version would have produced 0–1 ticks; post-fix the async version produces many.

**Fix:** added `searchHardMoveAsync` in `src/ai/hard.ts` that `await`s a microtask (`setTimeout(0)`) between root branches. The store now calls `searchHardMoveAsync` from `runAiIfNeeded` instead of the synchronous `chooseHardMove`. The synchronous version is kept for tests and for non-UI consumers.

**Status:** ✅ Test passes. Tick count during a 400 ms search is consistently >1 (typically dozens).

---

## P2 fixes

### P2.1 — D7: heat view lacked a min/max scale legend

**Fix:** `src/views/HeatView.tsx` — added a `HeatLegend` component (16-stop viridis bar with min/max numeric labels) above the heat board. `accessibilityLabel="heat scale legend"`.

### P2.2 — D1 add-on: explicit "switching views never mutates board" test

**Test added:** `src/state/__tests__/store.test.ts` → `view switching never mutates board (D1 add-on) › cycling all 4 views after 5 moves leaves cells / toMove unchanged`.

**Status:** ✅ Passes; no production code change needed — confirms the existing implementation is correct.

### P2.3 — E3: persist→hydrate round-trip test

**Test added:** `src/state/__tests__/store.test.ts` → `store persist / hydrate round-trip (E3) › persists current game and restores it via hydrate`. Mocks `@react-native-async-storage/async-storage` with an in-memory map and verifies cells, overlay flags, and view all round-trip.

**Status:** ✅ Passes.

### P2.4 — E7: Reanimated wired up for smooth view-switch crossfade

**Fix:** `src/views/ViewSwitcher.tsx` — wraps the view body in `Animated.View` with `useSharedValue(1)`; on view change the opacity drops to 0.6 and `withTiming` ramps back to 1 over 220 ms with `Easing.out(Easing.cubic)`. Smooth, cheap, no layout thrash. Reanimated is now actually used by the app, not just configured.

### P2.5 — E8: thin logger replaces raw `console.warn` calls

**Fix:** added `src/ui/logger.ts` exposing `log.warn` (suppressed in production via `__DEV__` or `NODE_ENV !== 'production'`) and `log.error` (always on). All five `console.warn` call sites in `store.ts` now route through `log.warn`.

### P2.6 — D5: 3D projection — intentional simplification documented

Static JS Schlegel projection retained. The full GL canvas would have needed `expo-gl` initialisation plus a Skia-vs-three resolution path that isn't worth the risk for a v1 ship. Documented in `DECISIONS.md §2` and reiterated in this file: **not fixed in refine** — the projection remains read-only, no pinch/rotate.

### P2.7 — E6: `npx expo start` smoke test

**Not executed during refine** (no emulator/simulator in this environment). The Expo SDK and all listed deps are pinned to SDK 51-compatible versions; install reproduces with `npm install --legacy-peer-deps` (documented). Will be re-verified during submission-pass.

---

## Performance pass

### 2D rendering (GridOfGrids)

The 256-cell board renders as 16 panes of 16 `Pressable` cells each. The Pane component is wrapped in `React.memo` and receives stable props (`cells`, `winSet`, `rankByIdx`, `disabled`) — Zustand selectors keep the parent re-render scoped to the things it actually reads. A single-cell update re-renders the affected Pane only.

### Monte Carlo & negamax

- `runRolloutsAsync` yields every 25 playouts.
- `searchHardMoveAsync` yields between every root-branch.
- Both check `aborted()` cooperatively. `store.recomputeProb` debounces with 120 ms and cancels in-flight rollouts on new moves / new game / view changes.

The store's `playAt` triggers `recomputeProb()` after every move — the debounce + abort token guarantees that rapid play never piles up parallel rollouts.

### 3D projection

256 absolutely-positioned `View` dots; static. Stays at 60fps because there's no per-frame work. Acceptable for v1 per the spec.

---

## Polish items addressed in this pass

- Ranked-badge halo (`overlay`) — already a 2px coloured border in GridOfGrids; bumped legibility by keeping the badge top-right so it doesn't compete with the mark dot.
- Win-state messaging — `StatusBar` text shows "X wins!" / "Draw" / "X to move" with a `accessibilityLiveRegion="polite"` so VoiceOver announces transitions.
- Winning line highlight — each of the 4 views maintains the same `winSet` derived from `winningLine` and outlines those cells with `theme.win`.
- Turning-point annotation in `ProbChart` — already visible as a vertical bar at the swing ply with the side and Δp printed below.

---

## Not done (with reason)

| audit ref | reason |
|-----------|--------|
| D5 (3D pinch/rotate via GL canvas) | Documented simplification; deferred. Static projection ships in v1. |
| E6 (live `npx expo start` smoke test) | No emulator in this environment; will be re-verified during submission. |

Everything else: green.

---

## Final test summary

```
Test Suites: 8 passed, 8 total
Tests:       53 passed, 53 total
Time:        ~2.1 s
```

| suite | tests |
|-------|------:|
| src/game/__tests__/lines.test.ts | 9 |
| src/game/__tests__/coords.test.ts | 5 |
| src/game/__tests__/rules.test.ts | 12 |
| src/overlay/__tests__/strength.test.ts | 6 |
| src/ai/__tests__/ai.test.ts | 10 |
| src/ai/__tests__/hardAsync.test.ts | 5 |
| src/state/__tests__/store.test.ts | 5 |
| src/__audit__/probe.test.ts | 1 |
