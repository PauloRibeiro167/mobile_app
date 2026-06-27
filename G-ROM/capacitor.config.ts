import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'APP-Mercado',
  webDir: 'www',
  plugins: {
    Assets: {
      include: ['icon']
    },
    SafeArea: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 10,
      launchAutoHide: true,
      showSpinner: false
    }
  }
};

export default config;
