import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { useStore } from './src/state/store';
import { ViewSwitcher } from './src/views/ViewSwitcher';
import { StatusBar } from './src/ui/StatusBar';
import { SettingsPanel } from './src/ui/SettingsPanel';
import { theme } from './src/ui/theme';
import { ProbChart } from './src/analysis/ProbChart';

export default function App(): React.ReactElement {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const runAiIfNeeded = useStore((s) => s.runAiIfNeeded);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) void runAiIfNeeded();
  }, [hydrated, runAiIfNeeded]);

  return (
    <SafeAreaView style={styles.safe}>
      <RNStatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <View style={styles.root}>
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
