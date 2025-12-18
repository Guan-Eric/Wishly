export default {
  expo: {
    name: 'Wishly',
    slug: 'Wishly',
    version: '1.0.0',
    newArchEnabled: true,
    web: {
      favicon: './assets/favicon.png',
    },

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/logo.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-web-browser',
    ],
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      amazonAssociateTag: process.env.AMAZON_ASSOCIATE_TAG,
      eas: {
        projectId: '6dfcaa99-1054-4ead-b7ec-fa9e5e02f042',
      },
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: "wishly",
    userInterfaceStyle: "automatic",

    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.wishlyguan.app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
  },
};
