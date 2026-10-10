// Public values only - never put secrets in the mobile app.
const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://yourdomain.com';
const host = new URL(appUrl).host;

module.exports = {
  expo: {
    name: 'Certificates',
    slug: 'certificates',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'certs',
    userInterfaceStyle: 'light',
    icon: './assets/icon.png',
    splash: { image: './assets/splash-icon.png', resizeMode: 'contain', backgroundColor: '#ffffff' },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' },
      package: 'com.example.certificates',
      // Opens https://<host>/register/... and /certificate/... links directly in the app when installed.
      // The web experience always works without the app.
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'https', host, pathPrefix: '/register' }, { scheme: 'https', host, pathPrefix: '/certificate' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
      permissions: ['CAMERA'],
    },
    ios: { bundleIdentifier: 'com.example.certificates', associatedDomains: [`applinks:${host}`], infoPlist: { NSCameraUsageDescription: 'The camera is used to scan the event QR code.' } },
    plugins: [['expo-camera', { cameraPermission: 'Allow the camera to scan the event QR code.' }]],
  },
};
