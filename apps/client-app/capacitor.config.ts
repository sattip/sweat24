
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b6ef2949a22343a2a358dd33ab8b8870',
  appName: 'Sweat24',
  webDir: 'dist',
  server: {
    url: "https://b6ef2949-a223-43a2-a358-dd33ab8b8870.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7C3AED",
    }
  }
};

export default config;
