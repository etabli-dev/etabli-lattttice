#!/usr/bin/env bash
# capture.sh — deterministic screenshot harness for etabli-lattttice (v0.1.0)
#
# Regenerates every figure in vignettes/etabli-lattttice.md from a running
# release build on a booted Android emulator/device.
#
# Prereqs: adb on PATH; device/emulator booted; release APK installed
#   (android/app/build/outputs/apk/release/app-release.apk).
# Usage:   bash scripts/capture.sh
set -euo pipefail

PKG=com.raban.lattttice
OUT="$(cd "$(dirname "$0")/.." && pwd)/vignettes/assets/0.1.0"
mkdir -p "$OUT"

cap(){ for t in 1 2 3; do adb exec-out screencap -p > "$OUT/$1.png"; [ "$(wc -c < "$OUT/$1.png")" -gt 1000 ] && break; sleep 1; done; echo "  + $1.png"; }
tap(){ adb shell input tap "$1" "$2"; sleep "${3:-0.8}"; }

# view-switcher tabs (segmented control, y=305)
TAB_GRID=157; TAB_SLICES=412; TAB_3D=668; TAB_HEAT=924

adb shell am force-stop "$PKG"
adb shell pm clear "$PKG" >/dev/null 2>&1 || true
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
sleep 5

cap 01-home-grid
# place a few moves across different z/w sub-boards
tap 130 540; tap 360 500; tap 130 800; tap 600 540
sleep 3                               # let the 4D analysis settle (no ANR)
cap 02-moves-grid
tap $TAB_SLICES 305 2.5; cap 03-slices
tap $TAB_3D 305 3.5;     cap 04-projection3d   # GL Schlegel projection needs settle
tap $TAB_HEAT 305 2.5;   cap 05-heat
tap $TAB_GRID 305 1
adb shell input swipe 540 1700 540 650 300; sleep 1; cap 06-analysis-settings
tap 790 1789 1.0;        cap 07-vs-computer     # switch Mode -> reveals AI difficulty
# reset
tap $TAB_GRID 305
adb shell input swipe 540 1800 540 400 350; sleep 0.8
tap 540 2125 1.0                      # New Game
adb shell input swipe 540 600 540 1800 300; sleep 0.6
cap 08-reset

echo "Captured $(ls "$OUT"/*.png | wc -l) frames to $OUT"
