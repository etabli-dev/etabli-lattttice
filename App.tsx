import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Text, ScrollView, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from './src/state/store';
import { ViewSwitcher } from './src/views/ViewSwitcher';
import { StatusBar } from './src/ui/StatusBar';
import { SettingsPanel } from './src/ui/SettingsPanel';
import { theme } from './src/ui/theme';
import { ProbChart } from './src/analysis/ProbChart';

export default function App(): React.ReactElement {
  return <SafeAreaProvider><GestureHandlerRootView style={{ flex: 1 }}><Game /></GestureHandlerRootView></SafeAreaProvider>;
}

function Game(): React.ReactElement {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const storageError = useStore((s) => s.storageError);
  const runAiIfNeeded = useStore((s) => s.runAiIfNeeded);

  useEffect(() => {
    void hydrate();
    return () => useStore.getState().cancelBackgroundWork();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) void runAiIfNeeded();
  }, [hydrated, runAiIfNeeded]);

  if (!hydrated) return <SafeAreaView style={styles.safe}><Text style={{ color: theme.text }}>Loading saved game…</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <RNStatusBar barStyle="light-content" />
      <View style={styles.root}>
        {storageError && <Text accessibilityRole="alert" style={{ color: theme.text }}>{storageError}</Text>}
        <StatusBar />
        <ViewSwitcher />
        <ScrollView style={styles.bottom}>
          <ProbChart />
          <SettingsPanel />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  root: { flex: 1 },
  bottom: { maxHeight: 360 },
});
