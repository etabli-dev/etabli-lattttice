import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';
import { toIdx } from '../game/coords';
import { theme } from '../ui/theme';
import { colorForMark } from './colors';
import { describeCell } from './cellLabel';
import { scoreAllEmpty, topNRanked } from '../overlay/strength';

/**
 * Grid-of-grids: 4×4 outer panes indexed by (z, w); each pane is a 4×4 (x,y) board.
 * Default + primary input surface. Tapping a cell plays it.
 */
export function GridOfGrids(): React.ReactElement {
  const cells = useStore((s) => s.cells);
  const playAt = useStore((s) => s.playAt);
  const winningLine = useStore((s) => s.winningLine);
  const toMove = useStore((s) => s.toMove);
  const overlay = useStore((s) => s.overlayPerPlayer);
  const winner = useStore((s) => s.winner);
  const mode = useStore((s) => s.mode);
  const isThinking = useStore((s) => s.isThinking);

  const showOverlay = overlay[toMove] && winner === null;
  const inputDisabled = winner !== null || isThinking || (mode === 'vs-computer' && toMove === 'O');
  const ranked = useMemo(() => {
    if (!showOverlay) return [];
    const scores = scoreAllEmpty(cells, toMove);
    return topNRanked(scores, 5);
  }, [cells, toMove, showOverlay]);
  const rankByIdx = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of ranked) m.set(r.idx, r.rank);
    return m;
  }, [ranked]);
  const winSet = useMemo(() => new Set<number>(winningLine ?? []), [winningLine]);

  return (
    <View style={styles.outer}>
      {[0, 1, 2, 3].map((z) => (
        <View key={`row-${z}`} style={styles.outerRow}>
          {[0, 1, 2, 3].map((w) => (
            <Pane
              key={`pane-${z}-${w}`}
              z={z}
              w={w}
              cells={cells}
              onTap={playAt}
              winSet={winSet}
              rankByIdx={rankByIdx}
              disabled={inputDisabled}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

interface PaneProps {
  z: number;
  w: number;
  cells: ReadonlyArray<ReturnType<typeof colorForMark> extends string ? import('../game/types').Mark : never>;
  onTap: (idx: number) => void;
  winSet: ReadonlySet<number>;
  rankByIdx: ReadonlyMap<number, number>;
  disabled: boolean;
}

const Pane = React.memo(function Pane(props: PaneProps): React.ReactElement {
  const { z, w, cells, onTap, winSet, rankByIdx, disabled } = props;
  return (
    <View style={styles.pane}>
      <Text style={styles.paneLabel} accessibilityLabel={`z${z} w${w}`}>z{z}·w{w}</Text>
      <View style={styles.paneGrid}>
        {[0, 1, 2, 3].map((y) => (
          <View key={`y-${y}`} style={styles.paneRow}>
            {[0, 1, 2, 3].map((x) => {
              const idx = toIdx(x, y, z, w);
              const mark = cells[idx];
              const isWin = winSet.has(idx);
              const rank = rankByIdx.get(idx);
              return (
                <Pressable
                  key={`c-${x}-${y}`}
                  onPress={(): void => onTap(idx)}
                  disabled={disabled || mark !== null}
                  style={[
                    styles.cell,
                    isWin && styles.cellWin,
                    rank !== undefined && styles.cellRanked,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={describeCell({ x, y, z, w }, mark)}
                  accessibilityState={{ disabled: disabled || mark !== null }}
                >
                  <View style={[styles.mark, { backgroundColor: colorForMark(mark) }]} />
                  {rank !== undefined && mark === null && (
                    <Text style={styles.rankBadge}>{rank}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: { padding: 6, gap: 6 },
  outerRow: { flexDirection: 'row', gap: 6 },
  pane: {
    flex: 1,
    padding: 4,
    backgroundColor: theme.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  paneLabel: {
    color: theme.textMuted,
    fontSize: 9,
    marginBottom: 2,
    textAlign: 'center',
  },
  paneGrid: { gap: 2 },
  paneRow: { flexDirection: 'row', gap: 2 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: theme.bg,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  cellWin: { borderColor: theme.win, borderWidth: 2 },
  cellRanked: { borderColor: theme.overlayHalo, borderWidth: 2 },
  mark: { width: '70%', height: '70%', borderRadius: 999 },
  rankBadge: {
    position: 'absolute',
    top: 0,
    right: 1,
    color: theme.text,
    fontSize: 9,
    fontWeight: '800',
  },
});
