import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStrings } from '../i18n';
import {
  ACCENT_CHOICES,
  ACCENT_VALUES,
  APPEARANCE_MODES,
  APP_LANGUAGES,
  AccentChoice,
  AppLanguage,
  AppearanceMode,
} from '../settings/appearance';
import { usePreferences } from '../settings/preferences';
import { SegmentedControl } from './SegmentedControl';
import { Section } from './Section';
import { useChrome } from './useChrome';

/** Settings → Appearance: app language, System / Light / Dark and the accent colour (suite-wide). */
export function AppearanceSettings(): React.ReactElement {
  const t = useStrings();
  const c = useChrome();
  const mode = usePreferences((s) => s.mode);
  const accent = usePreferences((s) => s.accent);
  const language = usePreferences((s) => s.language);
  const setMode = usePreferences((s) => s.setMode);
  const setAccent = usePreferences((s) => s.setAccent);
  const setLanguage = usePreferences((s) => s.setLanguage);

  const languageLabel: Record<AppLanguage, string> = { system: t.languageSystem, de: 'Deutsch', en: 'English' };
  const modeLabel: Record<AppearanceMode, string> = { system: t.modeSystem, light: t.modeLight, dark: t.modeDark };

  return (
    <View style={[styles.wrap, { borderTopColor: c.border }]}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">{t.appearanceTitle}</Text>
      <Section label={t.languageLabel} />
      <SegmentedControl<AppLanguage>
        options={APP_LANGUAGES.map((value) => ({ value, label: languageLabel[value] }))}
        value={language}
        onChange={setLanguage}
        accessibilityLabel={t.languageLabel}
        testID="settings.appearance.language"
      />
      <Section label={t.appearanceModeLabel} />
      <SegmentedControl<AppearanceMode>
        options={APPEARANCE_MODES.map((value) => ({ value, label: modeLabel[value] }))}
        value={mode}
        onChange={setMode}
        accessibilityLabel={t.appearanceModeLabel}
        testID="settings.appearance.mode"
      />
      <Section label={`${t.accentLabel}: ${t.accentNames[accent]}`} />
      <View style={styles.swatches}>
        {ACCENT_CHOICES.map((choice) => (
          <Swatch key={choice} choice={choice} selected={choice === accent} onPress={(): void => setAccent(choice)} />
        ))}
      </View>
      <Text style={[styles.note, { color: c.textDim }]}>{t.appearanceNote}</Text>
    </View>
  );
}

function Swatch(props: { choice: AccentChoice; selected: boolean; onPress: () => void }): React.ReactElement {
  const { choice, selected, onPress } = props;
  const t = useStrings();
  const c = useChrome();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t.accentNames[choice]}
      accessibilityHint={t.accentLabel}
      accessibilityState={{ selected }}
      testID={`settings.appearance.accent.${choice}`}
      style={styles.swatchHit}
    >
      <View
        style={[
          styles.swatch,
          { backgroundColor: ACCENT_VALUES[choice][c.scheme], borderColor: selected ? c.text : c.border },
          selected && styles.swatchSelected,
        ]}
      >
        {selected && <Text style={[styles.check, { color: c.onAccent }]}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 14, fontWeight: '700' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap' },
  swatchHit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swatchSelected: { borderWidth: 2 },
  check: { fontSize: 16, fontWeight: '800', lineHeight: 18 },
  note: { fontSize: 11 },
});
