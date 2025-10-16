import { PushNotifications, Token, PushNotificationSchema, ActionPerformed, PermissionStatus } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import * as API from '@/config/api';

export interface NotificationConfig {
  title: string;
  body: string;
  type: 'package_expiry' | 'appointment_reminder' | 'general';
  scheduleTime?: Date;
  data?: Record<string, any>;
}

export interface ScheduledNotification {
  id: string;
  type: 'package_expiry_week' | 'package_expiry_2days' | 'appointment_reminder';
  title: string;
  body: string;
  scheduledFor: Date;
  userId: number;
  relatedId?: number;
  isActive?: boolean;
}

export interface NotificationPermissions {
  canReceive: boolean;
  canRequest: boolean;
  currentStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

class EnhancedNotificationService {
  private isInitialized = false;
  private pushToken: string | null = null;
  private initializationAttempts = 0;
  private maxAttempts = 3;
  private retryDelay = 2000;
  private isNativePlatform = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
  }

  /**
   * Intelligent initialization with platform detection
   */
  async initialize(): Promise<boolean> {
    try {
      // Prevent multiple simultaneous initializations
      if (this.isInitialized) {
        return true;
      }

      // Increment attempt counter
      this.initializationAttempts++;

      // Check if max attempts reached
      if (this.initializationAttempts > this.maxAttempts) {
        console.warn('⚠️ Max notification initialization attempts reached');
        return false;
      }

      // Web platform handling
      if (!this.isNativePlatform) {
        this.isInitialized = true;
        return await this.initializeWebNotifications();
      }

      // Native platform handling
      return await this.initializeNativeNotifications();

    } catch (error) {
      console.error('💥 Notification initialization failed:', error);
      return await this.handleInitializationError();
    }
  }

  /**
   * Initialize web notifications (PWA)
   */
  private async initializeWebNotifications(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('⚠️ Web notification initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize native notifications (iOS/Android)
   */
  private async initializeNativeNotifications(): Promise<boolean> {
    try {
      // Check plugin availability
      if (!PushNotifications) {
        console.error('⚠️ PushNotifications plugin not available');
        return false;
      }

      // Request permissions with timeout
      const permission = await this.requestPermissionsWithTimeout();
      if (!permission || permission.receive !== 'granted') {
        return false;
      }

      // Register with timeout
      await this.registerWithTimeout();

      // Add event listeners safely
      this.addNativeListeners();

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('⚠️ Native notification initialization failed:', error);
      return false;
    }
  }

  /**
   * Request permissions with timeout protection
   */
  private async requestPermissionsWithTimeout(): Promise<PermissionStatus | null> {
    try {
      return await Promise.race([
        PushNotifications.requestPermissions(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Permission request timeout')), 10000)
        )
      ]);
    } catch (error) {
      console.error('⚠️ Permission request failed:', error);
      return null;
    }
  }

  /**
   * Register with timeout protection
   */
  private async registerWithTimeout(): Promise<void> {
    return await Promise.race([
      PushNotifications.register(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Registration timeout')), 10000)
      )
    ]);
  }

  /**
   * Add native platform event listeners with comprehensive error handling
   */
  private addNativeListeners(): void {
    try {
      // Registration success
      const registrationListener = PushNotifications.addListener('registration', (token: Token) => {
        try {
          this.pushToken = token.value;
          this.sendTokenToServer(token.value);
        } catch (error) {
          console.error('⚠️ Error handling registration token:', error);
        }
      });

      // Registration error
      const registrationErrorListener = PushNotifications.addListener('registrationError', (error: any) => {
        console.error('❌ Push registration error:', error);
      });

      // Notification received (app in foreground)
      const notificationReceivedListener = PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        try {
          this.handleNotificationReceived(notification);
        } catch (error) {
          console.error('⚠️ Error handling notification received:', error);
        }
      });

      // Notification tapped (app opened from notification)
      const notificationActionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        try {
          this.handleNotificationTapped(notification);
        } catch (error) {
          console.error('⚠️ Error handling notification action:', error);
        }
      });

      // Store listeners for cleanup
      this.listeners = [
        registrationListener.remove,
        registrationErrorListener.remove,
        notificationReceivedListener.remove,
        notificationActionListener.remove
      ];

    } catch (error) {
      console.error('💥 Critical error adding native listeners:', error);
    }
  }

  /**
   * Handle initialization errors with retry logic
   */
  private async handleInitializationError(): Promise<boolean> {
    if (this.initializationAttempts < this.maxAttempts) {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await this.initialize();
          resolve(result);
        }, this.retryDelay);
      });
    }

    console.error('💔 All initialization attempts failed');
    return false;
  }

  /**
   * Send push token to backend with retry logic
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      await API.apiRequest('/users/push-token', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          platform: Capacitor.getPlatform(),
          device_info: {
            platform: Capacitor.getPlatform(),
            is_native: this.isNativePlatform,
            user_agent: navigator.userAgent
          }
        })
      });
    } catch (error) {
      console.error('⚠️ Failed to send push token to server:', error);

      // Retry after delay
      setTimeout(() => {
        this.sendTokenToServer(token);
      }, 5000);
    }
  }

  /**
   * Handle notification when received in foreground
   */
  private handleNotificationReceived(notification: PushNotificationSchema): void {
    try {
      const notificationType = notification.data?.type;

      // Show in-app notification for foreground
      if (this.isNativePlatform) {
        // Native platforms can show custom in-app UI
        this.showInAppNotification(notification);
      } else {
        // Web platform can use browser notifications
        this.showWebNotification(notification);
      }

      // Custom handling based on type
      if (notificationType === 'package_expiry') {
        this.handlePackageExpiryNotification(notification);
      } else if (notificationType === 'appointment_reminder') {
        this.handleAppointmentReminderNotification(notification);
      }

    } catch (error) {
      console.error('⚠️ Error in handleNotificationReceived:', error);
    }
  }

  /**
   * Handle notification when tapped (app opened from notification)
   */
  private handleNotificationTapped(notification: ActionPerformed): void {
    try {
      const data = notification.notification.data;
      const notificationType = data?.type;

      // Navigate based on notification type
      if (notificationType === 'package_expiry') {
        // Navigate to profile/packages page
        window.location.href = '/profile';
      } else if (notificationType === 'appointment_reminder') {
        // Navigate to bookings page
        window.location.href = '/bookings';
      } else {
        // Default navigation to home
        window.location.href = '/';
      }

    } catch (error) {
      console.error('⚠️ Error in handleNotificationTapped:', error);
    }
  }

  /**
   * Show in-app notification for native platforms
   */
  private showInAppNotification(notification: PushNotificationSchema): void {
    // This can be integrated with your toast/alert system
    // Example: Could integrate with your toast system
    // toast.info(notification.body, { title: notification.title });
  }

  /**
   * Show web notification for browser
   */
  private showWebNotification(notification: PushNotificationSchema): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title || 'Sweat93', {
        body: notification.body,
        icon: '/logo-light.png',
        tag: notification.data?.id || 'general'
      });
    }
  }

  /**
   * Handle package expiry specific logic
   */
  private handlePackageExpiryNotification(notification: PushNotificationSchema): void {
    // Add any package-specific handling here
  }

  /**
   * Handle appointment reminder specific logic  
   */
  private handleAppointmentReminderNotification(notification: PushNotificationSchema): void {
    // Add any appointment-specific handling here
  }

  /**
   * Schedule package expiry notifications
   */
  async schedulePackageExpiryNotifications(packageEndDate: Date, userId: number, packageId: number, packageName: string = 'πακέτο'): Promise<ScheduledNotification[]> {
    try {
      const notifications: ScheduledNotification[] = [];
      
      // 1 week before expiry
      const oneWeekBefore = new Date(packageEndDate);
      oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
      
      if (oneWeekBefore > new Date()) {
        notifications.push({
          id: `package_expiry_week_${packageId}`,
          type: 'package_expiry_week',
          title: '📅 Λήξη Πακέτου σε 1 Εβδομάδα',
          body: `Το ${packageName} σας λήγει σε 7 μέρες. Ανανεώστε το για να συνεχίσετε τις προπονήσεις σας!`,
          scheduledFor: oneWeekBefore,
          userId,
          relatedId: packageId,
          isActive: true
        });
      }

      // 2 days before expiry
      const twoDaysBefore = new Date(packageEndDate);
      twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
      
      if (twoDaysBefore > new Date()) {
        notifications.push({
          id: `package_expiry_2days_${packageId}`,
          type: 'package_expiry_2days', 
          title: '⚠️ Λήξη Πακέτου σε 2 Μέρες',
          body: `Το ${packageName} σας λήγει σε 2 μέρες! Μην χάσετε τις προπονήσεις σας - ανανεώστε τώρα.`,
          scheduledFor: twoDaysBefore,
          userId,
          relatedId: packageId,
          isActive: true
        });
      }

      // Send to backend for scheduling
      for (const notification of notifications) {
        await this.scheduleNotification(notification);
      }

      return notifications;

    } catch (error) {
      console.error('⚠️ Failed to schedule package expiry notifications:', error);
      throw error;
    }
  }

  /**
   * Schedule appointment reminder notification
   */
  async scheduleAppointmentReminder(appointmentDate: Date, userId: number, appointmentId: number, appointmentTitle: string, trainerName?: string): Promise<ScheduledNotification> {
    try {
      // 1 hour before appointment
      const oneHourBefore = new Date(appointmentDate);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);

      const bodyText = trainerName 
        ? `Το ραντεβού σας "${appointmentTitle}" με τον/την ${trainerName} ξεκινά σε 1 ώρα!`
        : `Το ραντεβού σας "${appointmentTitle}" ξεκινά σε 1 ώρα!`;

      const notification: ScheduledNotification = {
        id: `appointment_reminder_${appointmentId}`,
        type: 'appointment_reminder',
        title: '🏋️ Υπενθύμιση Ραντεβού',
        body: bodyText,
        scheduledFor: oneHourBefore,
        userId,
        relatedId: appointmentId,
        isActive: true
      };

      await this.scheduleNotification(notification);
      return notification;

    } catch (error) {
      console.error('⚠️ Failed to schedule appointment reminder:', error);
      throw error;
    }
  }

  /**
   * Send notification to backend for scheduling
   */
  private async scheduleNotification(notification: ScheduledNotification): Promise<void> {
    try {
      const response = await API.apiRequest('/notifications/schedule', {
        method: 'POST',
        body: JSON.stringify({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          scheduled_for: notification.scheduledFor.toISOString(),
          user_id: notification.userId,
          related_id: notification.relatedId,
          data: {
            type: notification.type.includes('package') ? 'package_expiry' : 'appointment_reminder',
            related_id: notification.relatedId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule notification: ${response.status}`);
      }
    } catch (error) {
      console.error('⚠️ Failed to schedule notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await API.apiRequest(`/notifications/cancel/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel notification: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('⚠️ Failed to cancel notification:', error);
      return false;
    }
  }

  /**
   * Get user's scheduled notifications
   */
  async getUserNotifications(userId: number): Promise<ScheduledNotification[]> {
    try {
      const response = await API.apiRequest(`/users/${userId}/notifications`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user notifications');
      }

      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error('⚠️ Failed to fetch user notifications:', error);
      return [];
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(title: string = 'Test Notification', body: string = 'This is a test notification from Sweat93!'): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('⚠️ Notification service not initialized');
      return false;
    }

    try {
      const response = await API.apiRequest('/notifications/test', {
        method: 'POST',
        body: JSON.stringify({
          title,
          message: body, // Backend expects 'message' field
          token: this.pushToken || undefined,
          platform: Capacitor.getPlatform()
        })
      });

      if (!response.ok) {
        throw new Error(`Test notification failed: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('⚠️ Failed to send test notification:', error);
      return false;
    }
  }

  /**
   * Check notification permissions
   */
  async getNotificationPermissions(): Promise<NotificationPermissions> {
    try {
      if (!this.isNativePlatform) {
        // Web platform
        const permission = Notification.permission;
        return {
          canReceive: permission === 'granted',
          canRequest: permission !== 'denied',
          currentStatus: permission as any
        };
      }

      // Native platform
      if (!PushNotifications) {
        return {
          canReceive: false,
          canRequest: false,
          currentStatus: 'unknown'
        };
      }

      const permissions = await PushNotifications.checkPermissions();
      return {
        canReceive: permissions.receive === 'granted',
        canRequest: permissions.receive !== 'denied',
        currentStatus: permissions.receive
      };

    } catch (error) {
      console.error('⚠️ Failed to check notification permissions:', error);
      return {
        canReceive: false,
        canRequest: false,
        currentStatus: 'unknown'
      };
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isNativePlatform) {
        // Web platform
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }

      // Native platform
      if (!PushNotifications) {
        console.error('⚠️ PushNotifications plugin not available');
        return false;
      }

      const permissions = await this.requestPermissionsWithTimeout();
      return permissions?.receive === 'granted' || false;

    } catch (error) {
      console.error('⚠️ Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasToken: !!this.pushToken,
      platform: this.isNativePlatform ? 'native' : 'web',
      attempts: this.initializationAttempts,
      maxAttempts: this.maxAttempts
    };
  }

  /**
   * Cleanup service
   */
  cleanup(): void {
    try {
      // Remove all listeners
      this.listeners.forEach(removeListener => {
        try {
          removeListener();
        } catch (error) {
          console.error('⚠️ Error removing listener:', error);
        }
      });

      this.listeners = [];
      this.isInitialized = false;
      this.pushToken = null;
    } catch (error) {
      console.error('⚠️ Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const enhancedNotificationService = new EnhancedNotificationService();
export default enhancedNotificationService;
