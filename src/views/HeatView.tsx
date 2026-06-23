import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';
import { toIdx } from '../game/coords';
import { theme } from '../ui/theme';
import { colorForMark, viridis } from './colors';
import { scoreAllEmpty } from '../overlay/strength';
import { describeCell } from './cellLabel';

/**
 * Heat-view: shade ALL empty cells across the entire 4D grid by normalised move-strength
 * for the side to move. Tap a cell to play it.
 */
export function HeatView(): React.ReactElement {
  const cells = useStore((s) => s.cells);
  const playAt = useStore((s) => s.playAt);
  const toMove = useStore((s) => s.toMove);
  const winningLine = useStore((s) => s.winningLine);
  const winner = useStore((s) => s.winner);
  const mode = useStore((s) => s.mode);
  const isThinking = useStore((s) => s.isThinking);
  const inputDisabled = winner !== null || isThinking || (mode === 'vs-computer' && toMove === 'O');
  const winSet = useMemo(() => new Set<number>(winningLine ?? []), [winningLine]);

  const scores = useMemo(() => scoreAllEmpty(cells, toMove), [cells, toMove]);
  const { min, max } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (let i = 0; i < scores.length; i++) {
      if (cells[i] !== null) continue;
      if (scores[i] < mn) mn = scores[i];
      if (scores[i] > mx) mx = scores[i];
    }
    if (!isFinite(mn)) mn = 0;
    if (!isFinite(mx)) mx = 1;
    return { min: mn, max: mx };
  }, [scores, cells]);

  return (
    <View style={styles.outer}>
      <Text style={styles.caption}>
        Heat-view — every empty cell shaded by strength for {toMove}
      </Text>
      <HeatLegend min={min} max={max} />

      {[0, 1, 2, 3].map((z) => (
        <View key={`row-${z}`} style={styles.outerRow}>
          {[0, 1, 2, 3].map((w) => (
            <View key={`pane-${z}-${w}`} style={styles.pane}>
              <Text style={styles.paneLabel}>z{z}·w{w}</Text>
              {[0, 1, 2, 3].map((y) => (
                <View key={`y-${y}`} style={styles.paneRow}>
                  {[0, 1, 2, 3].map((x) => {
                    const idx = toIdx(x, y, z, w);
                    const m = cells[idx];
                    const isEmpty = m === null;
                    const t = isEmpty && max > min ? (scores[idx] - min) / (max - min) : 0;
                    const bg = isEmpty ? viridis(t) : colorForMark(m);
                    const isWin = winSet.has(idx);
                    return (
                      <Pressable
                        key={`c-${x}-${y}`}
                        onPress={(): void => playAt(idx)}
                        disabled={inputDisabled || m !== null}
                        style={[styles.cell, { backgroundColor: bg }, isWin && styles.cellWin]}
                        accessibilityRole="button"
                        accessibilityLabel={describeCell({ x, y, z, w }, m)}
                        accessibilityState={{ disabled: inputDisabled || m !== null }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function HeatLegend({ min, max }: { min: number; max: number }): React.ReactElement {
  const stops = 16;
  return (
    <View style={legendStyles.row} accessibilityLabel="heat scale legend">
      <Text style={legendStyles.label}>{min.toFixed(1)}</Text>
      <View style={legendStyles.bar}>
        {Array.from({ length: stops }).map((_, i) => (
          <View
            key={`hl-${i}`}
            style={{
              flex: 1,
              backgroundColor: viridis(i / (stops - 1)),
            }}
          />
        ))}
      </View>
      <Text style={legendStyles.label}>{max.toFixed(1)}</Text>
    </View>
  );
}

const legendStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  bar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  label: { color: theme.textMuted, fontSize: 10, minWidth: 28, textAlign: 'center' },
});

const styles = StyleSheet.create({
  outer: { padding: 6, gap: 6 },
  outerRow: { flexDirection: 'row', gap: 6 },
  pane: {
    flex: 1,
    padding: 3,
    backgroundColor: theme.panel,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  paneLabel: {
    color: theme.textMuted,
    fontSize: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  paneRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: theme.border,
  },
  cellWin: { borderColor: theme.win, borderWidth: 2 },
  caption: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: 4,
  },
});
