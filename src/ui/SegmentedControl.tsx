import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from './theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl<T extends string>(
  props: SegmentedControlProps<T>,
): React.ReactElement {
  return (
    <View style={styles.row} accessibilityLabel={props.accessibilityLabel}>
      {props.options.map((opt) => {
        const active = opt.value === props.value;
        return (
          <Pressable
            key={opt.value}
            onPress={(): void => props.onChange(opt.value)}
            style={[styles.seg, active && styles.segActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: theme.panel,
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  seg: {
    flexGrow: 1,
    flexBasis: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segActive: {
    backgroundColor: theme.panelStrong,
  },
  label: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: theme.text,
  },
});
