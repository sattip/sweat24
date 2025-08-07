
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b6ef2949a22343a2a358dd33ab8b8870',
  appName: 'sweat93',
  webDir: 'dist',
  server: {
    allowNavigation: ['sweat93laravel.obs.com.gr'],
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7C3AED",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#FFFFFF"
    }
  }
};

export default config;
