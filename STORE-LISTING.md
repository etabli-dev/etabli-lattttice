# Store Listing — lattttice

Copy-paste-ready text for App Store Connect and Google Play Console.

---

## App identity (both stores)

- **App name (App Store):** Lattice — 4D Tic-Tac-Toe
- **App name (Play Store):** Lattice: 4D Tic-Tac-Toe
- **Developer name shown:** Raban Heller
- **Bundle ID / Package:** `com.raban.lattttice`
- **Category (App Store):** Games → Board · Games → Strategy (secondary)
- **Category (Play Store):** Games → Board

---

## iOS — App Store

### Subtitle (30 chars max)
```
Tic-tac-toe in 4 dimensions
```

### Promotional text (170 chars max, editable post-launch)
```
A pocket-sized tesseract. Play 4D 4×4×4×4 tic-tac-toe in four ways: grid-of-grids, z-slices, 3D projection, and a strength heat-map. Hotseat or vs Computer.
```

### Description (4000 chars max)
```
lattttice is a pocket-sized tesseract — 4-dimensional tic-tac-toe on a 4×4×4×4 grid. 256 cells. 520 ways to win. One spec, four ways to see it.

EVERY GAME, FOUR VIEWS
• Grid-of-grids — the canonical 4D layout: 16 small boards arranged 4×4 by (z, w). Tap to play.
• z-slices — 4 layers side-by-side with a w-slider for scrubbing the 4th dimension.
• 3D projection — a Schlegel-style nested cube of cubes for spatial intuition.
• Heat-view — every empty cell shaded by move-strength (viridis), so you can read the position at a glance.

PLAY ALONE OR TOGETHER
• Hotseat — two humans, one phone.
• vs Computer — three AI strengths:
  – Easy: takes wins, blocks losses, otherwise random.
  – Medium: 1-ply strength heuristic.
  – Hard: iterative-deepening alpha-beta search.

THE OVERLAY THAT LEARNS WITH YOU
Toggle the strength overlay (per player) to see the top-5 strongest cells ranked 1–5, with subtle halos. Off by default — use it as training wheels, then leave them behind.

LIVE ANALYSIS
After every move, an asynchronous Monte-Carlo rollout estimates the win probability for each side. The chart annotates the turning-point ply — the move that changed the game.

DESIGNED TO BE PLAYED
• Color-blind-safe palette (deep blue / warm orange).
• VoiceOver labels on every cell (“x3 y1 z0 w2, empty”).
• Resumes the game-in-progress on relaunch.
• No accounts, no network, no tracking. Ever.

A 4×4 cube is a Qubic. A 4×4×4×4 hypercube is a lattttice.
```

### Keywords (App Store, comma-separated, 100 chars max)
```
tic-tac-toe,tesseract,4d,strategy,board,puzzle,hypercube,minimax,qubic,offline
```

### Support URL
```
https://github.com/REPLACE_WITH_REPO_PATH/lattttice
```

### Marketing URL (optional)
```
https://github.com/REPLACE_WITH_REPO_PATH/lattttice
```

### Privacy Policy URL (required)
```
https://raw.githubusercontent.com/REPLACE_WITH_REPO_PATH/lattttice/main/PRIVACY.md
```
*(Or any public URL hosting `PRIVACY.md`. EAS / App Store accept raw markdown URLs.)*

### App Review information (notes to reviewer)
```
The app is fully offline. There is no login, no account, no in-app purchase, no advertising. To play vs Computer: open Settings, switch Mode → "vs Computer", choose a difficulty, and tap any cell to start. The AI plays as O.
```

### Age rating answers (iOS Age Rating questionnaire)
- Cartoon or fantasy violence: **None**
- Realistic violence: **None**
- Sexual content or nudity: **None**
- Profanity or crude humour: **None**
- Alcohol, tobacco, or drug use: **None**
- Mature/suggestive themes: **None**
- Horror/fear themes: **None**
- Medical/treatment information: **None**
- Gambling and contests: **None**
- Unrestricted web access: **No**
- Gambling: **No**
- Contests: **No**

Result: **4+ / Everyone**.

### Privacy "nutrition label" (App Privacy section)
Answer **No** to every data-collection question. The app collects no data at all.

### Export compliance
`ITSAppUsesNonExemptEncryption: false` is set in `app.config.ts`. This means: app uses only standard OS-provided cryptography (HTTPS via the platform); no custom encryption. **No export compliance documentation required.**

---

## Android — Google Play Console

### Short description (80 chars max)
```
Tic-tac-toe in four dimensions. 256 cells, 520 ways to win, four ways to see.
```

### Full description (4000 chars max)
*(Same as the iOS description above — both stores accept the same body.)*

### Graphics
- **App icon:** 512×512 PNG (regenerated from `assets/SOURCE.svg` at submission time).
- **Feature graphic (Play Store only):** 1024×500 PNG with the tesseract motif + tagline "4D tic-tac-toe".
- **Phone screenshots:** minimum 2, max 8 per store (see manifest below).

### Data safety form (Play Console)
- Data collected: **No data collected**.
- Data shared with third parties: **No**.
- Encryption in transit: not applicable (no network).
- Data deletion: not applicable (no server-side data).
- All other questions: **No**.

### Content rating (IARC questionnaire)
Same answers as iOS: lowest rating in all regions. Expected outcome: **3+ / PEGI 3 / Everyone**.

### Target audience
"Ages 13 and over" (safest default for "Everyone" with no kid-specific features). Set "Yes" to "Designed for the whole family"? **No** — keeps us out of the Designed-for-Families program, which has extra requirements we don't need.

---

## Screenshot manifest

Generate 6 framed screenshots per device class. Use the iOS Simulator (iPhone 15 Pro Max for 6.7" set; iPhone 8 Plus for 5.5") and an Android emulator (Pixel 7 Pro for the Play 6.7" set, Pixel 4a for 6.1").

Required sizes:

| store | device class | size (px) | min count |
|-------|--------------|-----------|-----------|
| App Store | iPhone 6.7" (15 Pro Max) | 1290 × 2796 | 3 |
| App Store | iPhone 6.5" (XS Max / 11 Pro Max) | 1242 × 2688 | 3 |
| App Store | iPhone 5.5" (8 Plus) | 1242 × 2208 | 3 |
| App Store | iPad 12.9" (optional) | 2048 × 2732 | 2 |
| Play Store | Phone | 1080 × 1920 minimum | 4 |
| Play Store | 7" tablet (optional) | 1200 × 1920 | 2 |

Shot list — one per view + analysis + thinking-mode:

| # | filename | what it shows |
|---|----------|---------------|
| 1 | 01-grid-of-grids.png | Grid view mid-game with X having a clear 3-in-a-line threat |
| 2 | 02-z-slices.png | z-slices view with w=2, two cells filled per layer |
| 3 | 03-projection-3d.png | 3D Schlegel projection of a mid-game position |
| 4 | 04-heat-view.png | Heat-view showing the strength gradient + ranked badges |
| 5 | 05-analysis-chart.png | ProbChart with a visible turning-point annotation |
| 6 | 06-ai-thinking.png | "Computer thinking…" indicator with the hard AI working |

Capture procedure:
1. `npm run ios` (or `npm run android`) on a clean cold start.
2. Play 5–8 scripted moves to produce the position for each shot.
3. Use ⌘+S in iOS Simulator (or `adb shell screencap`) to capture.
4. Frame with [fastlane frameit] or [screenshots.pro] using the platform mockups.
5. Drop into `assets/screenshots/<device>/<NN>-<view>.png`.

---

## Localisation

v1 ships English only. Spanish, French, German, Japanese, Chinese (Simplified) listed as "languages to add" in the post-launch backlog. The UI itself contains very few strings — adding a locale is changing the small JSON copy in `src/ui/strings.<locale>.ts` (to be added).
