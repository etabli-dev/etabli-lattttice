import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';
import { toIdx } from '../game/coords';
import { theme } from '../ui/theme';
import { useChrome } from '../ui/useChrome';
import { useStrings } from '../i18n';
import { colorForMark } from './colors';
import { describeCell } from './cellLabel';
import { squareCell } from './squareCell';

/**
 * Stacked layers (z-slices): fix `w` with a slider; show 4 z-layers side by side,
 * each a 4×4 (x,y) board. The w-slider scrubs the 4th dimension.
 */
export function ZSlices(): React.ReactElement {
  const cells = useStore((s) => s.cells);
  const playAt = useStore((s) => s.playAt);
  const winningLine = useStore((s) => s.winningLine);
  const w = useStore((s) => s.currentW);
  const setW = useStore((s) => s.setCurrentW);
  const winner = useStore((s) => s.winner);
  const toMove = useStore((s) => s.toMove);
  const mode = useStore((s) => s.mode);
  const isThinking = useStore((s) => s.isThinking);
  const t = useStrings();
  const c = useChrome();
  const winSet = useMemo(() => new Set<number>(winningLine ?? []), [winningLine]);
  const inputDisabled = winner !== null || isThinking || (mode === 'vs-computer' && toMove === 'O');

  return (
    <View style={styles.wrap}>
      <View style={styles.wRow} accessibilityLabel={t.wSlider}>
        <Text style={[styles.wLabel, { color: c.text }]}>w =</Text>
        {[0, 1, 2, 3].map((wv) => (
          <Pressable
            key={`w-${wv}`}
            onPress={(): void => setW(wv)}
            style={[
              styles.wBtn,
              { backgroundColor: c.surface, borderColor: c.border },
              w === wv && { backgroundColor: c.selection, borderColor: c.accent },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.setW(wv)}
            accessibilityState={{ selected: w === wv }}
            testID={`w.${wv}`}
          >
            <Text style={[styles.wBtnLabel, { color: w === wv ? c.text : c.textDim }]}>{wv}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.layers}>
        {[0, 1, 2, 3].map((z) => (
          <View key={`layer-${z}`} style={styles.layer}>
            <Text style={styles.layerLabel}>z{z}</Text>
            {[0, 1, 2, 3].map((y) => (
              <View key={`y-${y}`} style={styles.layerRow}>
                {[0, 1, 2, 3].map((x) => {
                  const idx = toIdx(x, y, z, w);
                  const m = cells[idx];
                  const isWin = winSet.has(idx);
                  return (
                    <Pressable
                      key={`c-${x}-${y}`}
                      onPress={(): void => playAt(idx)}
                      disabled={inputDisabled || m !== null}
                      style={[styles.cell, isWin && styles.cellWin]}
                      accessibilityRole="button"
                      accessibilityLabel={describeCell({ x, y, z, w }, m, t)}
                      accessibilityState={{ disabled: inputDisabled || m !== null }}
                    >
                      <View style={[styles.mark, { backgroundColor: colorForMark(m) }]} />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 10, gap: 10 },
  wRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wLabel: { fontWeight: '600' },
  wBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  wBtnLabel: { fontWeight: '700' },
  layers: { gap: 8 },
  layer: {
    backgroundColor: theme.panel,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 4,
  },
  layerLabel: { color: theme.textMuted, fontSize: 11 },
  layerRow: { flexDirection: 'row', gap: 4 },
  cell: {
    ...squareCell,
    backgroundColor: theme.bg,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  cellWin: { borderColor: theme.win, borderWidth: 2 },
  mark: { width: '70%', height: '70%', borderRadius: 999 },
});
