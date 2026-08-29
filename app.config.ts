import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Makla AI',
  slug: 'makla-ai',
  scheme: 'maklaai',
  version: '1.2.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  runtimeVersion: { policy: 'appVersion' },
  ios: {
    appleTeamId: 'SRQJ2ZKD64',
    bundleIdentifier: 'com.webrange.fitora',
    buildNumber: '24',
    supportsTablet: true,
    requireFullScreen: true,
    usesAppleSignIn: true,
    entitlements: {
      'com.apple.developer.ubiquity-kvstore-identifier':
        '$(TeamIdentifierPrefix)$(CFBundleIdentifier)',
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription:
        "Makla AI utilise l'appareil photo pour analyser ton repas et estimer calories et macronutriments.",
      NSPhotoLibraryUsageDescription:
        'Makla AI permet d’importer une photo de repas existante pour l’analyser.',
      NSHealthShareUsageDescription:
        'Makla AI lit ton poids et ton activité depuis Santé pour ajuster ton plan.',
      NSHealthUpdateUsageDescription:
        'Makla AI enregistre tes calories et ton poids dans Santé.',
      CFBundleLocalizations: ['fr', 'en', 'es', 'de', 'it', 'pt-BR', 'nl', 'ar', 'he'],
    },
  },
  android: {
    package: 'com.webrange.fitora',
    versionCode: 24,
    allowBackup: false,
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#FFFFFF',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: [
      'CAMERA',
      'POST_NOTIFICATIONS',
      'android.permission.health.READ_WEIGHT',
      'android.permission.health.WRITE_WEIGHT',
      'android.permission.health.WRITE_NUTRITION',
    ],
    predictiveBackGestureEnabled: true,
  },
  plugins: [
    'expo-font',
    [
      'expo-camera',
      {
        cameraPermission:
          "Makla AI utilise l'appareil photo pour analyser ton repas et estimer calories et macronutriments.",
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Makla AI permet d’importer une photo de repas existante pour l’analyser.',
        cameraPermission:
          "Makla AI utilise l'appareil photo pour analyser ton repas et estimer calories et macronutriments.",
        microphonePermission: false,
      },
    ],
    'expo-apple-authentication',
    ['expo-secure-store', { faceIDPermission: false }],
    'expo-notifications',
    [
      '@kingstinct/react-native-healthkit',
      {
        NSHealthShareUsageDescription:
          'Makla AI lit ton poids et ton activité depuis Santé pour ajuster ton plan.',
        NSHealthUpdateUsageDescription:
          'Makla AI enregistre tes calories et ton poids dans Santé.',
        background: false,
      },
    ],
    'react-native-health-connect',
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '17.0',
        },
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          minSdkVersion: 26,
        },
      },
    ],
    [
      'expo-widgets',
      {
        bundleIdentifier: 'com.webrange.fitora.MaklaWidget',
        groupIdentifier: 'group.com.webrange.fitora',
        widgets: [
          {
            name: 'MaklaCalorieWidget',
            displayName: 'Calories du jour',
            description: "Tes calories et tes macros en un coup d'œil.",
            supportedFamilies: ['systemSmall', 'systemMedium', 'accessoryCircular'],
            contentMarginsDisabled: false,
            ios: {
              supportedFamilies: ['systemSmall', 'systemMedium', 'accessoryCircular'],
            },
            android: null,
          },
        ],
      },
    ],
    [
      'expo-localization',
      {
        supportedLocales: {
          ios: ['fr', 'en', 'es', 'de', 'it', 'pt-BR', 'nl', 'ar', 'he'],
          android: ['fr', 'en', 'es', 'de', 'it', 'pt-BR', 'nl', 'ar', 'he'],
        },
      },
    ],
  ],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://www.makla-ai.com',
    revenueCatEntitlementId: process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? 'pro',
    revenueCatIosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    revenueCatAndroidApiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? undefined,
    },
  },
};

export default config;
