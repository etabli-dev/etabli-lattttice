import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Programmatic Expo config. Layered over app.json. Used by EAS Build / EAS Submit.
 *
 * Env overrides (CI):
 *   EAS_BUILD_PROFILE           — build profile name (provided by EAS)
 *   APP_VARIANT=preview         — append " preview" to display name + bundle suffix
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT;
  const isPreview = variant === 'preview';
  const nameSuffix = isPreview ? ' (preview)' : '';
  const bundleSuffix = isPreview ? '.preview' : '';

  return {
    ...config,
    name: `lattttice${nameSuffix}`,
    slug: 'lattttice',
    scheme: 'lattttice',
    description: 'A 4D 4×4×4×4 tic-tac-toe — the tesseract board, on a phone.',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    runtimeVersion: { policy: 'appVersion' },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0b0e14',
    },
    ios: {
      ...(config.ios ?? {}),
      bundleIdentifier: `com.raban.lattttice${bundleSuffix}`,
      buildNumber: '1',
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      ...(config.android ?? {}),
      package: `com.raban.lattttice${bundleSuffix}`,
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0b0e14',
      },
      permissions: [], // app needs none
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-splash-screen'],
    extra: {
      eas: {
        projectId: 'REPLACE_WITH_EAS_PROJECT_ID',
      },
    },
  };
};
