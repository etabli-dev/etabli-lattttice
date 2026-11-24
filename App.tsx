import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Text, ScrollView, StatusBar as RNStatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from './src/state/store';
import { ViewSwitcher } from './src/views/ViewSwitcher';
import { StatusBar } from './src/ui/StatusBar';
import { SettingsPanel } from './src/ui/SettingsPanel';
import { useStrings } from './src/i18n';
import { hydratePreferences, usePreferences } from './src/settings/preferences';
import { useChrome } from './src/ui/useChrome';
import { ProbChart } from './src/analysis/ProbChart';

export default function App(): React.ReactElement {
  return <SafeAreaProvider><GestureHandlerRootView style={{ flex: 1 }}><Game /></GestureHandlerRootView></SafeAreaProvider>;
}

function Game(): React.ReactElement {
  const { width, height } = useWindowDimensions();
  const wide = width >= 900 && height >= 600;
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const storageError = useStore((s) => s.storageError);
  const runAiIfNeeded = useStore((s) => s.runAiIfNeeded);
  const preferencesReady = usePreferences((s) => s.hydrated);
  const t = useStrings();
  const c = useChrome();

  useEffect(() => {
    void hydratePreferences();
    void hydrate();
    return () => useStore.getState().cancelBackgroundWork();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) void runAiIfNeeded();
  }, [hydrated, runAiIfNeeded]);

  if (!hydrated || !preferencesReady) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
        <Text style={{ color: c.text }}>{preferencesReady ? t.loadingSaved : ''}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <RNStatusBar barStyle={c.statusBar} />
      <View style={styles.root}>
        {storageError && (
          <Text accessibilityRole="alert" style={{ color: c.text, paddingHorizontal: 12 }}>
            {storageError === 'save' ? t.saveFailed : t.loadFailed}
          </Text>
        )}
        <StatusBar />
        <View style={[styles.content, wide && styles.wide]}>
          <View testID="game-board" style={[styles.board, wide && { maxWidth: Math.min(width - 340, height - 180) }]}>
            <ViewSwitcher />
          </View>
          <ScrollView testID="game-settings" style={wide ? styles.sidebar : styles.bottom}>
            <ProbChart />
            <SettingsPanel />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  content: { flex: 1 },
  wide: { flexDirection: 'row', justifyContent: 'center' },
  board: { flex: 1 },
  sidebar: { width: 320, flexGrow: 0 },
  bottom: { maxHeight: 360 },
});
