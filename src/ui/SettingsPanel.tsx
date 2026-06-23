import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from './theme';
import { SegmentedControl } from './SegmentedControl';
import { Toggle } from './Toggle';
import { useStore } from '../state/store';

export function SettingsPanel(): React.ReactElement {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const aiLevel = useStore((s) => s.aiLevel);
  const setAiLevel = useStore((s) => s.setAiLevel);
  const overlay = useStore((s) => s.overlayPerPlayer);
  const setOverlay = useStore((s) => s.setOverlayForPlayer);
  const newGame = useStore((s) => s.newGame);

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>Mode</Text>
      <SegmentedControl
        options={[
          { value: 'hotseat', label: 'Hotseat' },
          { value: 'vs-computer', label: 'vs Computer' },
        ]}
        value={mode}
        onChange={setMode}
        accessibilityLabel="Game mode"
      />
      {mode === 'vs-computer' && (
        <>
          <Text style={styles.section}>AI level</Text>
          <SegmentedControl
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
            value={aiLevel}
            onChange={setAiLevel}
            accessibilityLabel="AI difficulty"
          />
        </>
      )}
      <Text style={styles.section}>Overlay (per player)</Text>
      <View style={styles.toggleRow}>
        <Toggle
          label="X — strength hints"
          value={overlay.X}
          onChange={(v): void => setOverlay('X', v)}
        />
        <Toggle
          label="O — strength hints"
          value={overlay.O}
          onChange={(v): void => setOverlay('O', v)}
        />
      </View>
      <Pressable onPress={newGame} style={styles.newBtn} accessibilityRole="button">
        <Text style={styles.newBtnText}>New Game</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    gap: 8,
  },
  section: { color: theme.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 },
  toggleRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  newBtn: {
    marginTop: 10,
    backgroundColor: theme.panelStrong,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  newBtnText: { color: theme.text, fontWeight: '700' },
});
