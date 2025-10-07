// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Sweat24';
  const notificationOptions = {
    body: payload.notification?.body || 'New notification',
    icon: '/logo-light.png',
    badge: '/logo-light.png',
    tag: payload.data?.type || 'general',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Handle different actions
  if (event.action === 'close') {
    return;
  }

  // Default action (click on notification body or 'open' action)
  const notificationData = event.notification.data;
  let urlToOpen = '/';

  // Route based on notification type
  if (notificationData?.type === 'package_expiry') {
    urlToOpen = '/profile';
  } else if (notificationData?.type === 'appointment_reminder') {
    urlToOpen = '/bookings';
  }

  event.waitUntil(
    clients.matchAll().then(function(clientList) {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
