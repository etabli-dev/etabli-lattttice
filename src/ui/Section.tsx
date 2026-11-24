import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useChrome } from './useChrome';

/** A small upper-case settings heading in the game's settings style. */
export function Section({ label }: { label: string }): React.ReactElement {
  const c = useChrome();
  return <Text style={[styles.section, { color: c.textDim }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  section: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 },
});
