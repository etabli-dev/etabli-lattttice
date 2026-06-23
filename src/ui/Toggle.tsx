import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from './theme';

export interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  accessibilityHint?: string;
}

export function Toggle(props: ToggleProps): React.ReactElement {
  return (
    <Pressable
      onPress={(): void => props.onChange(!props.value)}
      style={styles.row}
      accessibilityRole="switch"
      accessibilityState={{ checked: props.value }}
      accessibilityLabel={props.label}
      accessibilityHint={props.accessibilityHint}
    >
      <View style={[styles.track, props.value && styles.trackOn]}>
        <View style={[styles.knob, props.value && styles.knobOn]} />
      </View>
      <Text style={styles.label}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  track: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.panel,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: theme.accent,
  },
  knob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.text,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  label: { color: theme.text, fontSize: 13 },
});
