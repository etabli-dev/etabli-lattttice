import { Platform, type ViewStyle } from 'react-native';

/**
 * A square board cell inside a row: flex fills the width, aspectRatio sets the height.
 *
 * WebKitGTK (the engine of the Linux desktop shell) collapses a row item that is
 * stretched on the cross axis to its borders instead of applying aspect-ratio, so on
 * the web the cell is aligned to the start of the row. Yoga (iOS/Android) and
 * Chromium already size the cell from its aspect ratio; native layout is unchanged.
 */
export const squareCell: ViewStyle = {
  flex: 1,
  aspectRatio: 1,
  ...Platform.select<ViewStyle>({ web: { alignSelf: 'flex-start' }, default: {} }),
};
