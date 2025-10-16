
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sweat93.app',
  appName: 'sweat93',
  webDir: 'dist',
  server: {
    allowNavigation: ['api.sweat93.gr', 'sweat93laravel.obs.com.gr', 'localhost'],
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7C3AED",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#FFFFFF"
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true
    }
  }
};

export default config;
