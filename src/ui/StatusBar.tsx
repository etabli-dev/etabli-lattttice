import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useStrings } from '../i18n';
import { useStore } from '../state/store';
import { theme } from './theme';
import { useChrome } from './useChrome';

export function StatusBar(): React.ReactElement {
  const winner = useStore((s) => s.winner);
  const toMove = useStore((s) => s.toMove);
  const moveCount = useStore((s) => s.moveLog.length);
  const isThinking = useStore((s) => s.isThinking);
  const isAnalysing = useStore((s) => s.isAnalysing);
  const mode = useStore((s) => s.mode);
  const t = useStrings();
  const c = useChrome();

  let text: string;
  if (winner) text = t.wins(winner);
  else if (moveCount === 256) text = t.draw;
  else if (mode === 'vs-computer' && toMove === 'O') text = t.computerThinking;
  else text = t.toMove(toMove);

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: winner === 'X' || toMove === 'X' ? theme.X : theme.O }]} />
      <Text style={[styles.text, { color: c.text }]} accessibilityLiveRegion="polite">{text}</Text>
      <View style={styles.spacer} />
      {isThinking && <ActivityIndicator color={c.accent} size="small" />}
      {isAnalysing && <Text style={[styles.aux, { color: c.textDim }]}>{t.analysing}</Text>}
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
  text: { fontSize: 16, fontWeight: '600' },
  aux: { fontSize: 12, marginLeft: 6 },
  spacer: { flex: 1 },
});
