import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useChrome } from './useChrome';

export interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Toggle(props: ToggleProps): React.ReactElement {
  const c = useChrome();
  return (
    <Pressable
      onPress={(): void => props.onChange(!props.value)}
      style={styles.row}
      accessibilityRole="switch"
      accessibilityState={{ checked: props.value }}
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityHint={props.accessibilityHint}
      testID={props.testID}
    >
      <View
        style={[
          styles.track,
          { backgroundColor: c.surface, borderColor: c.border },
          props.value && { backgroundColor: c.accent, borderColor: c.accent },
        ]}
      >
        <View style={[styles.knob, { backgroundColor: props.value ? c.onAccent : c.textDim }, props.value && styles.knobOn]} />
      </View>
      <Text numberOfLines={1} style={[styles.label, { color: c.text }]}>{props.label}</Text>
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
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  knob: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  label: { fontSize: 13 },
});
