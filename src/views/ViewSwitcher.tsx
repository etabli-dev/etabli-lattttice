import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useStore } from '../state/store';
import { SegmentedControl } from '../ui/SegmentedControl';
import { GridOfGrids } from './GridOfGrids';
import { ZSlices } from './ZSlices';
import { Projection3D } from './Projection3D';
import { HeatView } from './HeatView';
import { ViewKind } from '../game/types';
import { useStrings } from '../i18n';
import { useChrome } from '../ui/useChrome';

export function ViewSwitcher(): React.ReactElement {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const opacity = useSharedValue(1);
  const t = useStrings();
  const c = useChrome();

  useEffect(() => {
    // Smooth crossfade: dip immediately, ramp back to 1.
    opacity.value = withSequence(
      withTiming(0.6, { duration: 80, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
    );
  }, [view, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.wrap}>
      <SegmentedControl<ViewKind>
        options={[
          { value: 'grid-of-grids', label: t.views.grid.short, accessibilityLabel: t.views.grid.full },
          { value: 'z-slices', label: t.views.slices.short, accessibilityLabel: t.views.slices.full },
          { value: 'projection-3d', label: t.views.projection.short, accessibilityLabel: t.views.projection.full },
          { value: 'heat-view', label: t.views.heat.short, accessibilityLabel: t.views.heat.full },
        ]}
        value={view}
        onChange={setView}
        accessibilityLabel={t.viewA11y}
        testID="view"
      />
      <Animated.View style={[styles.scroll, { backgroundColor: c.bg }, animatedStyle]}>
        <ScrollView contentContainerStyle={styles.scrollInner}>
          {view === 'grid-of-grids' && <GridOfGrids />}
          {view === 'z-slices' && <ZSlices />}
          {view === 'projection-3d' && <Projection3D />}
          {view === 'heat-view' && <HeatView />}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 8, padding: 8 },
  scroll: { flex: 1 },
  scrollInner: { paddingBottom: 24 },
});
