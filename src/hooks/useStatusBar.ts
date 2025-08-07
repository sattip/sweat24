import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useStatusBar = () => {
  useEffect(() => {
    const setupStatusBar = async () => {
      // Only run on native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          // Add iOS class to body for platform-specific styling
          const platform = Capacitor.getPlatform();
          if (platform === 'ios') {
            document.body.classList.add('ios-device');
          }
          
          // Set the status bar to use dark content (dark icons/text on light background)
          await StatusBar.setStyle({ style: Style.Dark });
          
          // Set the status bar background color to white
          await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
          
          // Make sure the status bar is visible
          await StatusBar.show();
        } catch (error) {
          console.error('Error setting up status bar:', error);
        }
      }
    };

    setupStatusBar();
  }, []);
};