import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';
import { getMessagingInstance, VAPID_KEY } from '../config/firebase';
import * as API from '../config/api';
import { Capacitor } from '@capacitor/core';

export interface FCMConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  type: 'package_expiry' | 'appointment_reminder' | 'general';
  data?: Record<string, any>;
}

class FCMService {
  private isInitialized = false;
  private currentToken: string | null = null;
  private isNativePlatform = false;
  private messageHandlers: Array<(payload: MessagePayload) => void> = [];
  private messagingInstance: Messaging | null = null;

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
    console.log(`🔥 FCM Service created for ${this.isNativePlatform ? 'native' : 'web'} platform`);
  }

  /**
   * Initialize FCM service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔥 Initializing FCM service...');

      if (this.isInitialized) {
        console.log('✅ FCM service already initialized');
        return true;
      }

      // Resolve Firebase messaging instance (wait for async support detection)
      this.messagingInstance = await getMessagingInstance();

      if (!this.messagingInstance) {
        console.warn('❌ Firebase messaging not available in this browser.');
        return false;
      }

      // Register service worker for web platforms
      if (!this.isNativePlatform) {
        await this.registerServiceWorker();
      }

      // Request permission and get token
      const token = await this.requestPermissionAndGetToken();
      
      if (!token) {
        console.warn('⚠️ Failed to get FCM token');
        return false;
      }

      this.currentToken = token;
      
      // Set up foreground message listener
      this.setupMessageListener();

      // Send token to backend
      await this.sendTokenToBackend(token);

      this.isInitialized = true;
      console.log('🎉 FCM service initialized successfully!');
      return true;

    } catch (error) {
      console.error('💥 FCM initialization failed:', error);
      return false;
    }
  }

  /**
   * Register service worker for web notifications
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service workers are not supported in this browser.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');
    } catch (error) {
      console.error('⚠️ Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Request notification permission and get FCM token
   */
  private async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      console.log('🔐 Requesting notification permission...');

      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('⚠️ Notifications are not supported in this environment.');
        return null;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('⚠️ Notification permission denied');
        return null;
      }

      console.log('✅ Notification permission granted');

      // Get FCM token
      console.log('🔑 Getting FCM token...');
      if (!this.messagingInstance) {
        console.warn('⚠️ Messaging instance is not ready.');
        return null;
      }

      const token = await getToken(this.messagingInstance, { 
        vapidKey: VAPID_KEY 
      });

      if (token) {
        console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.error('❌ Failed to get FCM token');
        return null;
      }

    } catch (error) {
      console.error('⚠️ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Setup foreground message listener
   */
  private setupMessageListener(): void {
    try {
      console.log('📡 Setting up FCM message listener...');

      if (!this.messagingInstance) {
        console.warn('⚠️ Cannot set up message listener without messaging instance.');
        return;
      }

      onMessage(this.messagingInstance, (payload: MessagePayload) => {
        console.log('📩 FCM message received:', payload);
        
        // Handle foreground notifications
        this.handleForegroundMessage(payload);
        
        // Notify all registered handlers
        this.messageHandlers.forEach(handler => {
          try {
            handler(payload);
          } catch (error) {
            console.error('⚠️ Error in message handler:', error);
          }
        });
      });

      console.log('✅ FCM message listener setup complete');
    } catch (error) {
      console.error('⚠️ Error setting up message listener:', error);
    }
  }

  /**
   * Handle foreground messages (when app is open)
   */
  private handleForegroundMessage(payload: MessagePayload): void {
    try {
      const { notification, data } = payload;
      
      if (!notification) {
        console.log('📱 Data-only message received');
        return;
      }

      console.log('📱 Showing foreground notification');

      // Show browser notification for web platform
      if (!this.isNativePlatform && 'Notification' in window) {
        const notificationOptions = {
          body: notification.body,
          icon: notification.icon || '/logo-light.png',
          badge: '/logo-light.png',
          tag: data?.type || 'general',
          data: data,
          requireInteraction: true
        };

        const notif = new Notification(notification.title || 'Sweat24', notificationOptions);
        
        notif.onclick = () => {
          this.handleNotificationClick(data);
          notif.close();
        };
      }

      // For native platforms, you might want to show an in-app notification
      // This can be handled by the message handlers

    } catch (error) {
      console.error('⚠️ Error handling foreground message:', error);
    }
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(data?: Record<string, any>): void {
    try {
      console.log('👆 Notification clicked, data:', data);

      // Route based on notification type
      if (data?.type === 'package_expiry') {
        window.location.href = '/profile';
      } else if (data?.type === 'appointment_reminder') {
        window.location.href = '/bookings';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('⚠️ Error handling notification click:', error);
    }
  }

  /**
   * Send FCM token to backend
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      console.log('📤 Sending FCM token to backend...');

      const response = await API.apiRequest('/users/push-token', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          platform: this.isNativePlatform ? Capacitor.getPlatform() : 'web',
          type: 'fcm',
          device_info: {
            platform: this.isNativePlatform ? Capacitor.getPlatform() : 'web',
            is_native: this.isNativePlatform,
            user_agent: navigator.userAgent,
            fcm_version: '9.0.0'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Backend token registration failed: ${response.status}`);
      }

      console.log('✅ FCM token sent to backend successfully');
    } catch (error) {
      console.error('⚠️ Failed to send FCM token to backend:', error);
      
      // Retry after delay
      setTimeout(() => {
        console.log('🔄 Retrying FCM token send...');
        this.sendTokenToBackend(token);
      }, 5000);
    }
  }

  /**
   * Send test notification via backend
   */
  async sendTestNotification(title: string = 'Test Notification', body: string = 'This is a test FCM notification!'): Promise<boolean> {
    if (!this.isInitialized || !this.currentToken) {
      console.error('⚠️ FCM service not initialized or no token available');
      return false;
    }

    try {
      console.log('📤 Sending test FCM notification...');

      const response = await API.apiRequest('/notifications/test', {
        method: 'POST',
        body: JSON.stringify({
          title,
          message: body, // Backend expects 'message' field
          token: this.currentToken,
          platform: this.isNativePlatform ? Capacitor.getPlatform() : 'web',
          type: 'fcm'
        })
      });

      if (!response.ok) {
        throw new Error(`Test notification failed: ${response.status}`);
      }

      console.log('✅ Test FCM notification sent successfully');
      return true;
    } catch (error) {
      console.error('⚠️ Failed to send test FCM notification:', error);
      return false;
    }
  }

  /**
   * Schedule notification via backend
   */
  async scheduleNotification(
    type: 'package_expiry_week' | 'package_expiry_2days' | 'appointment_reminder',
    title: string,
    body: string,
    scheduledFor: Date,
    userId: number,
    relatedId?: number
  ): Promise<boolean> {
    try {
      console.log(`📅 Scheduling FCM notification: ${type}`);

      const response = await API.apiRequest('/notifications/schedule', {
        method: 'POST',
        body: JSON.stringify({
          id: `${type}_${relatedId || Date.now()}`,
          type,
          title,
          body,
          scheduled_for: scheduledFor.toISOString(),
          user_id: userId,
          related_id: relatedId,
          platform: 'fcm',
          data: {
            type: type.includes('package') ? 'package_expiry' : 'appointment_reminder',
            related_id: relatedId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Schedule notification failed: ${response.status}`);
      }

      console.log(`✅ FCM notification scheduled: ${type}`);
      return true;
    } catch (error) {
      console.error('⚠️ Failed to schedule FCM notification:', error);
      return false;
    }
  }

  /**
   * Add message handler
   */
  addMessageHandler(handler: (payload: MessagePayload) => void): () => void {
    this.messageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get current FCM token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Check if FCM is supported
   */
  isSupported(): boolean {
    return !!messaging && 'Notification' in window;
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Refresh FCM token
   */
  async refreshToken(): Promise<string | null> {
    try {
      console.log('🔄 Refreshing FCM token...');
      
      const newToken = await getToken(messaging, { 
        vapidKey: VAPID_KEY 
      });
      
      if (newToken && newToken !== this.currentToken) {
        this.currentToken = newToken;
        await this.sendTokenToBackend(newToken);
        console.log('✅ FCM token refreshed successfully');
      }
      
      return newToken;
    } catch (error) {
      console.error('⚠️ Failed to refresh FCM token:', error);
      return null;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasToken: !!this.currentToken,
      platform: this.isNativePlatform ? 'native' : 'web',
      isSupported: this.isSupported(),
      permission: this.getPermissionStatus(),
      token: this.currentToken?.substring(0, 20) + '...' || null
    };
  }

  /**
   * Cleanup FCM service
   */
  cleanup(): void {
    try {
      this.messageHandlers = [];
      this.isInitialized = false;
      this.currentToken = null;
      console.log('🧹 FCM service cleaned up');
    } catch (error) {
      console.error('⚠️ Error during FCM cleanup:', error);
    }
  }
}

// Export singleton instance
export const fcmService = new FCMService();
export default fcmService;
