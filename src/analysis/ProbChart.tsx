import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';
import { theme } from '../ui/theme';

const W = 320;
const H = 120;
const PAD = 18;

interface Series {
  label: string;
  color: string;
  values: number[];
}

export function ProbChart(): React.ReactElement {
  const history = useStore((s) => s.probHistory);
  const turning = useStore((s) => s.turningPoint);

  const series: Series[] = useMemo(
    () => [
      { label: 'X', color: theme.X, values: history.map((p) => p.pX) },
      { label: 'O', color: theme.O, values: history.map((p) => p.pO) },
      { label: 'Draw', color: theme.textMuted, values: history.map((p) => p.pDraw) },
    ],
    [history],
  );

  if (history.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Win probability</Text>
        <Text style={styles.empty}>Play a move to see analysis.</Text>
      </View>
    );
  }

  const xMax = Math.max(1, history[history.length - 1].ply);
  const xs = history.map((p) => p.ply);

  function project(plyIdx: number, prob: number): { px: number; py: number } {
    const xs0 = xs[0];
    const xsN = xs[xs.length - 1];
    const range = Math.max(1, xsN - xs0);
    const px = PAD + ((xs[plyIdx] - xs0) / range) * (W - PAD * 2);
    const py = H - PAD - prob * (H - PAD * 2);
    return { px, py };
  }

  // Build path-segments as discrete View rectangles (no SVG dep — avoids Skia init in tests).
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Win probability</Text>
      <View style={[styles.chart, { width: W, height: H }]}>
        {/* axes */}
        <View style={[styles.axis, { left: PAD, top: PAD, width: 1, height: H - PAD * 2, backgroundColor: theme.border }]} />
        <View style={[styles.axis, { left: PAD, top: H - PAD, width: W - PAD * 2, height: 1, backgroundColor: theme.border }]} />
        {series.map((s) => {
          const dots: React.ReactElement[] = [];
          for (let i = 0; i < s.values.length; i++) {
            const { px, py } = project(i, s.values[i]);
            dots.push(
              <View
                key={`dot-${s.label}-${i}`}
                style={{
                  position: 'absolute',
                  left: px - 2,
                  top: py - 2,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: s.color,
                }}
              />,
            );
            if (i > 0) {
              const prev = project(i - 1, s.values[i - 1]);
              const dx = px - prev.px;
              const dy = py - prev.py;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
              dots.push(
                <View
                  key={`seg-${s.label}-${i}`}
                  style={{
                    position: 'absolute',
                    left: prev.px,
                    top: prev.py,
                    width: length,
                    height: 1,
                    backgroundColor: s.color,
                    transform: [{ translateY: -0.5 }, { rotateZ: `${angle}deg` }],
                    transformOrigin: 'left center',
                  }}
                />,
              );
            }
          }
          return <React.Fragment key={s.label}>{dots}</React.Fragment>;
        })}
        {turning && (
          <View
            style={{
              position: 'absolute',
              left:
                project(history.findIndex((p) => p.ply === turning.ply), 0)
                  .px - 1,
              top: PAD,
              width: 2,
              height: H - PAD * 2,
              backgroundColor: theme.win,
              opacity: 0.6,
            }}
          />
        )}
      </View>
      <View style={styles.legend}>
        {series.map((s) => (
          <View key={`lg-${s.label}`} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
      {turning && (
        <Text style={styles.turn}>
          Turning point — ply {turning.ply}, Δp({turning.side}) ≈ {turning.delta.toFixed(2)}
        </Text>
      )}
      <Text style={styles.scale}>x: ply 0…{xMax}   y: 0…1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    gap: 8,
    backgroundColor: theme.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    margin: 8,
  },
  title: { color: theme.text, fontWeight: '700', fontSize: 14 },
  chart: { backgroundColor: theme.bg, borderRadius: 6, borderWidth: 1, borderColor: theme.border },
  axis: { position: 'absolute' },
  legend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { color: theme.textMuted, fontSize: 11 },
  empty: { color: theme.textMuted, fontStyle: 'italic' },
  turn: { color: theme.win, fontSize: 11 },
  scale: { color: theme.textMuted, fontSize: 10 },
});
