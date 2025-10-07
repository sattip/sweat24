import { initializeApp } from 'firebase/app';
import { getMessaging, MessagePayload, isSupported } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1ipT3FVrdZN6HvRz3K3lG-FxJASK45_A",
  authDomain: "sweat93-89bb8.firebaseapp.com",
  projectId: "sweat93-89bb8",
  storageBucket: "sweat93-89bb8.firebasestorage.app",
  messagingSenderId: "367901918033",
  appId: "1:367901918033:web:cd11ef8a361d29df90c970"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: Messaging | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

if (typeof window !== 'undefined') {
  messagingPromise = isSupported()
    .then((supported) => {
      if (!supported || !('serviceWorker' in navigator)) {
        console.info('Firebase messaging is not supported in this browser.');
        return null;
      }

      try {
        messaging = getMessaging(app);
        return messaging;
      } catch (error) {
        console.error('Error initializing Firebase messaging:', error);
        return null;
      }
    })
    .catch((error) => {
      console.error('Error checking Firebase messaging support:', error);
      return null;
    });
}

export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (!messagingPromise) {
    return null;
  }
  return messagingPromise;
};

export { messaging };
export type { MessagePayload };

// VAPID key for web push notifications
export const VAPID_KEY = "BHOiIOg-g177Zidn13CKzYZxpIK9YyFlPUXXUZjLPC0S7GkIbbMkMRKaVJYRtllJb-Rb02toCgSWijOlkJu6T80";

export default app;
