import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { messaging, VAPID_KEY } from '../config/firebase';
import * as API from '../config/api';

export interface HybridNotificationPayload {
  title: string;
  body: string;
  type?: string;
  data?: Record<string, any>;
}

class HybridFCMService {
  private isInitialized = false;
  private currentToken: string | null = null;
  private isNativePlatform = false;
  private messageHandlers: Array<(payload: any) => void> = [];

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
    console.log(`🔥 Hybrid FCM Service created for ${this.isNativePlatform ? 'native' : 'web'} platform`);
  }

  /**
   * Initialize hybrid FCM service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔥 Initializing Hybrid FCM service...');

      if (this.isInitialized) {
        console.log('✅ Hybrid FCM service already initialized');
        return true;
      }

      if (this.isNativePlatform) {
        return await this.initializeNativeFCM();
      } else {
        return await this.initializeWebFCM();
      }
    } catch (error) {
      console.error('💥 Hybrid FCM initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize native FCM (through Capacitor Push Notifications)
   */
  private async initializeNativeFCM(): Promise<boolean> {
    try {
      console.log('📱 Initializing native FCM...');

      // Request permissions
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive !== 'granted') {
        console.error('❌ Push notification permissions denied');
        throw new Error('Push notification permissions denied');
      }

      console.log('✅ Push notification permissions granted');

      // Register for push notifications
      await PushNotifications.register();

      // Add listeners
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('✅ Native FCM registration success:', token.value.substring(0, 30) + '...');
        this.currentToken = token.value;
        this.sendTokenToBackend(token.value, 'native_fcm');
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('❌ Native FCM registration error:', error);
        throw new Error('Native FCM registration failed: ' + error.error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('📩 Native FCM notification received:', notification);
        this.handleNativeMessage(notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('👆 Native FCM notification action performed:', notification);
        this.handleNativeMessage(notification.notification);
      });

      this.isInitialized = true;
      console.log('🎉 Native FCM initialized successfully!');
      return true;

    } catch (error) {
      console.error('💥 Native FCM initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize web FCM
   */
  private async initializeWebFCM(): Promise<boolean> {
    try {
      console.log('🌐 Initializing web FCM...');

      if (!messaging) {
        console.error('❌ Firebase messaging not available');
        return false;
      }

      // Register service worker
      await this.registerServiceWorker();

      // Request permission and get token
      const token = await this.requestPermissionAndGetToken();
      
      if (!token) {
        console.warn('⚠️ Failed to get FCM token');
        return false;
      }

      this.currentToken = token;
      
      // Set up foreground message listener
      this.setupWebMessageListener();

      // Send token to backend
      await this.sendTokenToBackend(token, 'web_fcm');

      this.isInitialized = true;
      console.log('🎉 Web FCM initialized successfully!');
      return true;

    } catch (error) {
      console.error('💥 Web FCM initialization failed:', error);
      return false;
    }
  }

  /**
   * Register service worker for web notifications
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker registered:', registration);
        
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');
      }
    } catch (error) {
      console.error('⚠️ Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Request permission and get FCM token for web
   */
  private async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('⚠️ Notification permission denied');
        return null;
      }

      console.log('✅ Notification permission granted');

      // Get FCM token
      const token = await getToken(messaging!, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        console.log('✅ FCM token received:', token.substring(0, 30) + '...');
        return token;
      } else {
        console.warn('⚠️ No registration token available');
        return null;
      }

    } catch (error) {
      console.error('⚠️ Failed to get permission and token:', error);
      return null;
    }
  }

  /**
   * Setup message listener for web FCM
   */
  private setupWebMessageListener(): void {
    try {
      onMessage(messaging!, (payload: MessagePayload) => {
        console.log('📩 Web FCM message received:', payload);
        this.handleWebMessage(payload);
      });
    } catch (error) {
      console.error('⚠️ Failed to setup web message listener:', error);
    }
  }

  /**
   * Handle native message
   */
  private handleNativeMessage(notification: PushNotificationSchema): void {
    const payload = {
      notification: {
        title: notification.title || '',
        body: notification.body || ''
      },
      data: notification.data || {},
      messageId: notification.id,
      type: 'native'
    };

    // Handle questionnaire notifications
    if (notification.data?.type === 'questionnaire' || notification.data?.questionnaire_id) {
      this.handleQuestionnaireNotification(notification.data);
    }

    this.messageHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error('⚠️ Message handler error:', error);
      }
    });
  }

  /**
   * Handle web message
   */
  private handleWebMessage(payload: MessagePayload): void {
    const formattedPayload = {
      ...payload,
      type: 'web'
    };

    // Handle questionnaire notifications
    if (payload.data?.type === 'questionnaire' || payload.data?.questionnaire_id) {
      this.handleQuestionnaireNotification(payload.data);
    }

    this.messageHandlers.forEach(handler => {
      try {
        handler(formattedPayload);
      } catch (error) {
        console.error('⚠️ Message handler error:', error);
      }
    });
  }

  /**
   * Handle questionnaire notification - route user to questionnaire
   */
  private handleQuestionnaireNotification(data: any): void {
    try {
      const questionnaireId = data.questionnaire_id;
      const title = data.title || 'Νέο Ερωτηματολόγιο';
      const body = data.body || 'Έχετε ένα νέο ερωτηματολόγιο προς συμπλήρωση';

      // Dynamically import toast to avoid issues if sonner isn't loaded yet
      import('sonner').then(({ toast }) => {
        toast.success(title, {
          description: body,
          duration: 10000,
          action: questionnaireId ? {
            label: 'Συμπλήρωση',
            onClick: () => {
              window.location.href = `/questionnaires/${questionnaireId}`;
            },
          } : undefined,
        });
      }).catch(err => {
        console.error('⚠️ Failed to show questionnaire toast:', err);
        // Fallback to direct navigation if toast fails
        if (questionnaireId) {
          window.location.href = `/questionnaires/${questionnaireId}`;
        }
      });
    } catch (error) {
      console.error('⚠️ Failed to handle questionnaire notification:', error);
    }
  }

  /**
   * Send FCM token to backend
   */
  private async sendTokenToBackend(token: string, type: string): Promise<void> {
    try {
      console.log(`📤 Sending ${type} token to backend...`);

      const response = await API.apiRequest('/users/push-token', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          platform: this.isNativePlatform ? Capacitor.getPlatform() : 'web',
          type: 'fcm', // Always FCM regardless of native/web
          device_info: {
            platform: this.isNativePlatform ? Capacitor.getPlatform() : 'web',
            is_native: this.isNativePlatform,
            user_agent: navigator.userAgent,
            fcm_type: type
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
        this.sendTokenToBackend(token, type);
      }, 5000);
    }
  }

  /**
   * Send test notification via backend
   */
  async sendTestNotification(title: string = 'Test FCM Notification', body: string = 'This is a test Firebase Cloud Messaging notification! 🔥'): Promise<boolean> {
    try {
      console.log('📤 Sending test FCM notification...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      console.log('🔐 Auth token present:', !!token, token ? `${token.substring(0, 20)}...` : 'None');

      const requestData = {
        title,
        body, // Try both fields
        message: body, // Backend expects 'message' field
        token: this.currentToken
      };

      console.log('📤 Sending request data:', requestData);

      const response = await API.apiRequest('/notifications/test', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Test notification API response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`Test notification failed: ${response.status} - ${errorText}`);
      }

      console.log('✅ Test FCM notification sent successfully');
      return true;

    } catch (error) {
      console.error('⚠️ Failed to send test FCM notification:', error);
      return false;
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasToken: !!this.currentToken,
      token: this.currentToken ? this.currentToken.substring(0, 30) + '...' : null,
      platform: this.isNativePlatform ? Capacitor.getPlatform() : 'web',
      isNative: this.isNativePlatform,
      permission: this.isInitialized ? 'granted' : 'unknown',
      isSupported: true
    };
  }

  /**
   * Add message handler
   */
  onMessage(handler: (payload: any) => void): () => void {
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
   * Get current token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<string | null> {
    try {
      if (this.isNativePlatform) {
        // For native, re-register
        await PushNotifications.register();
        return this.currentToken;
      } else {
        // For web, get new token
        if (!messaging) return null;
        
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        
        if (token) {
          this.currentToken = token;
          await this.sendTokenToBackend(token, 'web_fcm_refresh');
          return token;
        }
        
        return null;
      }
    } catch (error) {
      console.error('⚠️ Failed to refresh token:', error);
      return null;
    }
  }
}

// Export singleton instance
export const hybridFCMService = new HybridFCMService();
