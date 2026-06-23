import React, { Suspense, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';
import { theme } from '../ui/theme';
import { toIdx, fromIdx } from '../game/coords';
import { colorForMark } from './colors';
import { describeCell } from './cellLabel';

/**
 * 3D Schlegel-style projection of the tesseract.
 *
 * Read-only. We avoid importing @react-three/fiber/native at the top level so this file
 * can be tree-shaken / disabled if the GL pipeline isn't ready. Falls back to a static
 * 2D projection of the tesseract using React Native primitives if the GL canvas can't
 * be initialised.
 *
 * The 4D→3D projection: take w ∈ {0,1,2,3} and shrink/translate the 3D cube so that
 * higher w sits "inside" lower w — the canonical Schlegel-of-cubes look on a phone.
 */
export function Projection3D(): React.ReactElement {
  const cells = useStore((s) => s.cells);
  const winningLine = useStore((s) => s.winningLine);
  const winSet = useMemo(() => new Set<number>(winningLine ?? []), [winningLine]);

  // 3D positions for each of 256 cells (no GL needed for the static projection fallback).
  const points = useMemo(() => {
    const arr: Array<{ idx: number; sx: number; sy: number; size: number }> = [];
    const baseSize = 14;
    for (let w = 0; w < 4; w++) {
      // Each w gives a 3D cube; project that cube to 2D with parallel projection and shrink.
      const wScale = 1 - w * 0.18; // outer cubes are largest
      const wOffsetX = (w - 1.5) * 6;
      const wOffsetY = (w - 1.5) * 4;
      for (let z = 0; z < 4; z++) {
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            // Simple isometric-ish projection of 3D coord (x,y,z) into 2D screen.
            const px = (x - 1.5) * 22 + (z - 1.5) * 10;
            const py = (y - 1.5) * 22 - (z - 1.5) * 6;
            const sx = px * wScale + wOffsetX * 6;
            const sy = py * wScale + wOffsetY * 6;
            arr.push({ idx: toIdx(x, y, z, w), sx, sy, size: baseSize * wScale });
          }
        }
      }
    }
    return arr;
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>3D Schlegel projection (read-only)</Text>
      <Suspense fallback={<Text style={styles.caption}>loading…</Text>}>
        <View style={styles.canvas}>
          {points.map((p) => {
            const m = cells[p.idx];
            const isWin = winSet.has(p.idx);
            return (
              <View
                key={`p-${p.idx}`}
                style={{
                  position: 'absolute',
                  left: 180 + p.sx - p.size / 2,
                  top: 180 + p.sy - p.size / 2,
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: m === null ? 'rgba(125,140,170,0.2)' : colorForMark(m),
                  borderWidth: isWin ? 2 : 0,
                  borderColor: theme.win,
                }}
                accessibilityLabel={describeCell(fromIdx(p.idx), m)}
              />
            );
          })}
        </View>
      </Suspense>
      <Text style={styles.hint}>
        Tap a cell in the 2D views to play. This projection is for spatial insight.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 10, alignItems: 'center', gap: 8 },
  caption: { color: theme.textMuted, fontSize: 12 },
  canvas: {
    width: 360,
    height: 360,
    backgroundColor: theme.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  hint: { color: theme.textMuted, fontSize: 11, textAlign: 'center', paddingHorizontal: 20 },
});
