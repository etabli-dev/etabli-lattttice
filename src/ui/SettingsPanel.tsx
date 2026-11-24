import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStrings } from '../i18n';
import { SegmentedControl } from './SegmentedControl';
import { Toggle } from './Toggle';
import { AppearanceSettings } from './AppearanceSettings';
import { Section } from './Section';
import { useChrome } from './useChrome';
import { useStore } from '../state/store';

export function SettingsPanel(): React.ReactElement {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const aiLevel = useStore((s) => s.aiLevel);
  const setAiLevel = useStore((s) => s.setAiLevel);
  const overlay = useStore((s) => s.overlayPerPlayer);
  const setOverlay = useStore((s) => s.setOverlayForPlayer);
  const newGame = useStore((s) => s.newGame);
  const t = useStrings();
  const c = useChrome();

  return (
    <View style={styles.wrap}>
      <Section label={t.modeLabel} />
      <SegmentedControl
        options={[
          { value: 'hotseat', label: t.hotseat.short, accessibilityLabel: t.hotseat.full },
          { value: 'vs-computer', label: t.vsComputer.short, accessibilityLabel: t.vsComputer.full },
        ]}
        value={mode}
        onChange={setMode}
        accessibilityLabel={t.modeA11y}
        testID="settings.mode"
      />
      {mode === 'vs-computer' && (
        <>
          <Section label={t.aiLevelLabel} />
          <SegmentedControl
            options={[
              { value: 'easy', label: t.aiEasy },
              { value: 'medium', label: t.aiMedium },
              { value: 'hard', label: t.aiHard },
            ]}
            value={aiLevel}
            onChange={setAiLevel}
            accessibilityLabel={t.aiLevelA11y}
            testID="settings.aiLevel"
          />
        </>
      )}
      <Section label={t.overlayLabel} />
      <View style={styles.toggleRow}>
        <Toggle
          label={t.hints('X').short}
          accessibilityLabel={t.hints('X').full}
          value={overlay.X}
          onChange={(v): void => setOverlay('X', v)}
          testID="settings.hints.X"
        />
        <Toggle
          label={t.hints('O').short}
          accessibilityLabel={t.hints('O').full}
          value={overlay.O}
          onChange={(v): void => setOverlay('O', v)}
          testID="settings.hints.O"
        />
      </View>
      <Pressable
        onPress={newGame}
        style={[styles.newBtn, { borderColor: c.accent }]}
        accessibilityRole="button"
        accessibilityLabel={t.newGame}
        testID="settings.newGame"
      >
        <Text numberOfLines={1} style={[styles.newBtnText, { color: c.accent }]}>{t.newGame}</Text>
      </Pressable>
      <AppearanceSettings />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    gap: 8,
  },
  toggleRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  newBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  newBtnText: { fontWeight: '700' },
});
