import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run on Android platform
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const backButtonHandler = () => {
      // Get the base pathname (without hash)
      const pathname = location.pathname;
      
      // If we're on the login page, dashboard, or root, exit the app
      if (pathname === '/login' || pathname === '/dashboard' || pathname === '/' || pathname === '') {
        App.exitApp();
      } else {
        // Otherwise, navigate back
        navigate(-1);
      }
    };

    // Add event listener for back button
    const listener = App.addListener('backButton', backButtonHandler);

    // Cleanup function
    return () => {
      listener.remove();
    };
  }, [navigate, location.pathname]);
};