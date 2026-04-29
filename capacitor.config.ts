import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Hybrid mode:
 * - The web app shell ships bundled with the native binary (webDir: 'dist')
 *   so it loads instantly offline and satisfies App Store guideline 4.2.
 * - All data calls (Supabase) hit the network at runtime.
 * - For sandbox hot-reload during development, uncomment the `server.url`
 *   line below and re-run `npx cap sync`. Remove it before producing a
 *   release build.
 */
const config: CapacitorConfig = {
  appId: 'org.serviceswap.app',
  appName: 'Service Swap',
  webDir: 'dist',
  // server: {
  //   url: 'https://b5a80c49-653b-40f3-8ad1-6e20a35a6de4.lovableproject.com?forceHideBadge=true',
  //   cleartext: true,
  // },
  ios: {
    contentInset: 'always',
    backgroundColor: '#f6e8e1',
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: '#f6e8e1',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#f6e8e1',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      iosSpinnerStyle: 'small',
      spinnerColor: '#6C4CF1',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    Preferences: {
      group: 'ServiceSwapPrefs',
    },
  },
};

export default config;
