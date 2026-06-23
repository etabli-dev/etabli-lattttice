import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';
import { theme } from './theme';

export function StatusBar(): React.ReactElement {
  const winner = useStore((s) => s.winner);
  const toMove = useStore((s) => s.toMove);
  const moveCount = useStore((s) => s.moveLog.length);
  const isThinking = useStore((s) => s.isThinking);
  const isAnalysing = useStore((s) => s.isAnalysing);
  const mode = useStore((s) => s.mode);

  let text: string;
  if (winner) text = `${winner} wins!`;
  else if (moveCount === 256) text = 'Draw';
  else if (mode === 'vs-computer' && toMove === 'O') text = 'Computer thinking…';
  else text = `${toMove} to move`;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: winner === 'X' || toMove === 'X' ? theme.X : theme.O }]} />
      <Text style={styles.text} accessibilityLiveRegion="polite">{text}</Text>
      <View style={styles.spacer} />
      {isThinking && <ActivityIndicator color={theme.accent} size="small" />}
      {isAnalysing && <Text style={styles.aux}>analysing…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  text: { color: theme.text, fontSize: 16, fontWeight: '600' },
  aux: { color: theme.textMuted, fontSize: 12, marginLeft: 6 },
  spacer: { flex: 1 },
});
