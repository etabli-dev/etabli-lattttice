import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useChrome } from './useChrome';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Full text for assistive technology when the visible label is shortened. */
  accessibilityLabel?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * One-line segments: each visible label is short enough for a 375-pt screen in both languages
 * (`numberOfLines` only guards the layout); the full text is the accessibility label.
 */
export function SegmentedControl<T extends string>(
  props: SegmentedControlProps<T>,
): React.ReactElement {
  const c = useChrome();
  return (
    <View
      style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}
      accessibilityLabel={props.accessibilityLabel}
      testID={props.testID}
    >
      {props.options.map((opt) => {
        const active = opt.value === props.value;
        return (
          <Pressable
            key={opt.value}
            onPress={(): void => props.onChange(opt.value)}
            style={[styles.seg, active && { backgroundColor: c.selection, borderColor: c.accent }]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.accessibilityLabel ?? opt.label}
            testID={props.testID ? `${props.testID}.${opt.value}` : undefined}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, { color: active ? c.text : c.textDim }, active && styles.labelActive]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  seg: {
    flexGrow: 1,
    flexBasis: 0,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '700',
  },
});
