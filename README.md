# lattttice

A 4D 4×4×4×4 tic-tac-toe app — a tesseract of 256 cells with **520 winning lines**. Cross-platform React Native + Expo (TypeScript, strict).

Repository: <https://github.com/etabli-dev/etabli-lattttice>

> Naming: R/Bioconductor-style playful lowercase, stretching "lattice" (the 4D grid) into `lattttice`.

The game uses a fixed dark palette; changing the device light/dark setting
does not switch the game theme.

## Running

```bash
npm ci
npx expo start
```

Prerequisites: Node.js 22.23.4, npm and Git. `npm run web` starts the
browser app. `npm run android` builds for a connected device/emulator with JDK 17
and the Android SDK (`ANDROID_HOME` set; compile SDK 37, target SDK 36).
`npm run ios` requires macOS and Xcode 26.4+. Device operation has its own
acceptance gate; exported JavaScript bundles alone do not verify it.

### Standalone Android development APK

For an APK with its JavaScript included, install Android SDK Platform 37.0
(`sdkmanager` package `platforms;android-37.0`),
Build Tools 37.0.0, NDK 27.1.12297006 and CMake 3.22.1 using Android Studio's
SDK Manager. Accept the SDK licenses, set `JAVA_HOME` to JDK 17 and
`ANDROID_HOME` to the SDK directory, and put its `platform-tools` on `PATH`.
From the repository root:

```sh
npm ci
npx expo prebuild --platform android --no-install
(cd android && ./gradlew --no-daemon --max-workers=2 \
  '-Dorg.gradle.jvmargs=-Xmx3g -XX:MaxMetaspaceSize=1g -Dfile.encoding=UTF-8' \
  -PreactNativeArchitectures=arm64-v8a :app:assembleRelease)
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Launch **lattttice** on the connected arm64 device/emulator. The manifest supports
Android 7.0 / API 24 and later and targets API 36. This release build variant
embeds the game bundle, so Metro is unnecessary after installation. Expo's
generated project signs it with the public Android Debug key: it is a local
development artifact, not a store release. The ordinary `assembleDebug` APK
instead expects Metro. CI prepares both variants under the same development
label; signing for distribution and physical-device acceptance remain separate.

### Android permissions

After building both APK variants, run `npm run check:android-permissions`.
The check reads the actual APK manifests with Build Tools 37.0.0 `aapt`, using
`ANDROID_HOME` or `ANDROID_SDK_ROOT`; set `AAPT` to use an explicit executable.
For existing artifacts, use `npm run check:android-permissions -- --debug path/to/debug.apk --release path/to/release.apk`.

Both variants retain an ordinary, uncapped `INTERNET` declaration for Metro
development and may request their own signature permission for internal receiver
registration. The debug APK may also request `SYSTEM_ALERT_WINDOW` for React
Native's legacy performance monitor and `ACCESS_LOCAL_NETWORK` for the bundled
React Native/Expo Metro development tooling. The standalone APK must omit both.
Shared-storage read/write, vibration and all other unexpected permissions are
rejected; saved games use app-private storage.
CI runs this check after building both APKs.

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
- **Hard** — iterative-deepening negamax with alpha-beta pruning over the same heuristic. Soft 600 ms budget, branching cap 12. Cooperatively yields the JavaScript event loop via `setTimeout(0)`; it does not use a separate worker thread.

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

## Verification and distribution

```sh
npm run check
npx expo install --check
npm run export -- --platform all
npx playwright install chromium
npm run test:browser
```

The production web export is `dist/`. Serve it at the origin root over HTTP(S).
The browser suite exercises the built app at phone dimensions with external
networking blocked. Read [the refinement record](docs/refinement-2026-10.md)
for observed results, dependency audit findings, and device/iOS/store
requirements. There is no configured EAS project or store
submission in this checkout. Link your own EAS project before using EAS Build.
