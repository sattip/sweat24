import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import * as API from '@/config/api';

export interface NotificationConfig {
  title: string;
  body: string;
  type: 'package_expiry' | 'appointment_reminder';
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
  relatedId?: number; // package_id ή appointment_id
}

class NotificationService {
  private isInitialized = false;
  private pushToken: string | null = null;

  /**
   * Αρχικοποίηση του notification service - ULTRA SAFE
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔔 Starting notification initialization...');

      // Check if already initialized
      if (this.isInitialized) {
        console.log('✅ Notification service already initialized');
        return true;
      }

      // Platform check
      if (!Capacitor.isNativePlatform()) {
        console.log('ℹ️ Web platform - notifications not supported');
        this.isInitialized = true; // Mark as initialized to prevent retries
        return false;
      }

      // Plugin availability check
      if (!PushNotifications) {
        console.log('⚠️ PushNotifications plugin not available');
        return false;
      }

      console.log('📱 Native platform detected, requesting permissions...');

      // Wrap dangerous operations in additional try-catch
      let permissionResult;
      try {
        // Add timeout to prevent hanging
        permissionResult = await Promise.race([
          PushNotifications.requestPermissions(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Permission request timeout')), 8000)
          )
        ]);
      } catch (permError) {
        console.error('⚠️ Permission request failed:', permError);
        return false;
      }

      if (permissionResult.receive !== 'granted') {
        console.log('❌ Push notification permission denied');
        return false;
      }

      console.log('✅ Permissions granted, registering...');

      // Registration with timeout
      try {
        await Promise.race([
          PushNotifications.register(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Registration timeout')), 8000)
          )
        ]);
      } catch (regError) {
        console.error('⚠️ Registration failed:', regError);
        return false;
      }

      console.log('✅ Registration complete, adding listeners...');

      // Add listeners safely
      this.addListeners();
      
      this.isInitialized = true;
      console.log('🎉 Push notifications initialized successfully!');
      return true;

    } catch (error) {
      console.error('💥 Notification initialization failed:', error);
      this.isInitialized = false;
      
      // NEVER throw error - always return false to prevent crash
      return false;
    }
  }

  /**
   * Προσθήκη event listeners - ULTRA SAFE
   */
  private addListeners() {
    try {
      console.log('📡 Adding notification listeners...');

      // Check if PushNotifications is available before adding listeners
      if (!PushNotifications || !PushNotifications.addListener) {
        console.error('⚠️ PushNotifications.addListener not available');
        return;
      }

      // Registration success
      try {
        PushNotifications.addListener('registration', (token: Token) => {
          try {
            console.log('✅ Push registration success, token: ' + token.value.substring(0, 20) + '...');
            this.pushToken = token.value;
            this.sendTokenToServer(token.value).catch((error) => {
              console.error('Failed to send token to server:', error);
            });
          } catch (error) {
            console.error('⚠️ Error handling registration token:', error);
          }
        });
      } catch (error) {
        console.error('⚠️ Failed to add registration listener:', error);
      }

      // Registration error
      try {
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('❌ Registration error: ', error);
        });
      } catch (error) {
        console.error('⚠️ Failed to add registration error listener:', error);
      }

      // Notification received
      try {
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          try {
            console.log('📩 Push notification received: ', notification);
            this.handleNotificationReceived(notification);
          } catch (error) {
            console.error('⚠️ Error handling notification received:', error);
          }
        });
      } catch (error) {
        console.error('⚠️ Failed to add notification received listener:', error);
      }

      // Notification action performed
      try {
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          try {
            console.log('👆 Push notification action performed', notification);
            this.handleNotificationTapped(notification);
          } catch (error) {
            console.error('⚠️ Error handling notification action:', error);
          }
        });
      } catch (error) {
        console.error('⚠️ Failed to add notification action listener:', error);
      }

      console.log('✅ All listeners added successfully');

    } catch (error) {
      console.error('💥 Critical error adding push notification listeners:', error);
      // Don't throw - just log and continue
    }
  }

  /**
   * Στείλε το push token στο backend
   */
  private async sendTokenToServer(token: string) {
    try {
      await API.apiRequest('/users/push-token', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          platform: Capacitor.getPlatform()
        })
      });
      console.log('Push token sent to server successfully');
    } catch (error) {
      console.error('Failed to send push token to server:', error);
    }
  }

  /**
   * Handle notification όταν λαμβάνεται
   */
  private handleNotificationReceived(notification: PushNotificationSchema) {
    // Custom logic για διαφορετικούς τύπους notifications
    if (notification.data?.type === 'package_expiry') {
      console.log('Package expiry notification received');
    } else if (notification.data?.type === 'appointment_reminder') {
      console.log('Appointment reminder notification received');
    }
  }

  /**
   * Handle notification όταν γίνεται tap
   */
  private handleNotificationTapped(notification: ActionPerformed) {
    const data = notification.notification.data;
    
    if (data?.type === 'package_expiry') {
      // Navigate στο profile ή packages page
      window.location.href = '/profile';
    } else if (data?.type === 'appointment_reminder') {
      // Navigate στις κρατήσεις
      window.location.href = '/bookings';
    }
  }

  /**
   * Schedule notification για λήξη πακέτου
   */
  async schedulePackageExpiryNotifications(packageEndDate: Date, userId: number, packageId: number) {
    try {
      const notifications: ScheduledNotification[] = [];
      
      // 1 εβδομάδα πριν
      const oneWeekBefore = new Date(packageEndDate);
      oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
      
      notifications.push({
        id: `package_expiry_week_${packageId}`,
        type: 'package_expiry_week',
        title: '📅 Λήξη Πακέτου σε 1 Εβδομάδα',
        body: 'Το πακέτο σας λήγει σε 7 μέρες. Ανανεώστε το για να συνεχίσετε τις προπονήσεις σας!',
        scheduledFor: oneWeekBefore,
        userId,
        relatedId: packageId
      });

      // 2 μέρες πριν
      const twoDaysBefore = new Date(packageEndDate);
      twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
      
      notifications.push({
        id: `package_expiry_2days_${packageId}`,
        type: 'package_expiry_2days', 
        title: '⚠️ Λήξη Πακέτου σε 2 Μέρες',
        body: 'Το πακέτο σας λήγει σε 2 μέρες! Μην χάσετε τις προπονήσεις σας - ανανεώστε τώρα.',
        scheduledFor: twoDaysBefore,
        userId,
        relatedId: packageId
      });

      // Στείλε στο backend για scheduling
      for (const notification of notifications) {
        await this.scheduleNotification(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Failed to schedule package expiry notifications:', error);
      throw error;
    }
  }

  /**
   * Schedule notification για ραντεβού/μάθημα
   */
  async scheduleAppointmentReminder(appointmentDate: Date, userId: number, appointmentId: number, appointmentTitle: string) {
    try {
      // 1 ώρα πριν
      const oneHourBefore = new Date(appointmentDate);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);

      const notification: ScheduledNotification = {
        id: `appointment_reminder_${appointmentId}`,
        type: 'appointment_reminder',
        title: '🏋️ Υπενθύμιση Ραντεβού',
        body: `Το ραντεβού σας "${appointmentTitle}" ξεκινά σε 1 ώρα!`,
        scheduledFor: oneHourBefore,
        userId,
        relatedId: appointmentId
      };

      await this.scheduleNotification(notification);
      return notification;
    } catch (error) {
      console.error('Failed to schedule appointment reminder:', error);
      throw error;
    }
  }

  /**
   * Στείλε notification στο backend για scheduling
   */
  private async scheduleNotification(notification: ScheduledNotification) {
    try {
      await API.apiRequest('/notifications/schedule', {
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
      
      console.log(`Notification scheduled: ${notification.id}`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  /**
   * Cancel notification
   */
  async cancelNotification(notificationId: string) {
    try {
      await API.apiRequest(`/notifications/cancel/${notificationId}`, {
        method: 'DELETE'
      });
      console.log(`Notification cancelled: ${notificationId}`);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      throw error;
    }
  }

  /**
   * Λήψη όλων των scheduled notifications για χρήστη
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
      console.error('Failed to fetch user notifications:', error);
      return [];
    }
  }

  /**
   * Test notification (για development)
   */
  async sendTestNotification(title: string, body: string) {
    console.log('🔍 Starting test notification process...');
    console.log('📱 Is initialized:', this.isInitialized);
    console.log('🔑 Push token exists:', !!this.pushToken);
    console.log('🔑 Push token preview:', this.pushToken ? this.pushToken.substring(0, 20) + '...' : 'null');

    if (!this.isInitialized) {
      console.error('❌ Service not initialized');
      throw new Error('Notification service not initialized. Please check permissions and try again.');
    }

    if (!this.pushToken) {
      console.error('❌ No push token available');
      throw new Error('No push token available. Please restart the app and grant notification permissions.');
    }

    try {
      console.log('📡 Sending test notification to backend...');
      const requestData = {
        title,
        body, // Try both fields
        message: body, // Backend expects 'message' field
        token: this.pushToken
      };

      console.log('📤 Sending request data:', requestData);

      const response = await API.apiRequest('/notifications/test', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('📡 Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('📡 Could not parse error response');
        }
        throw new Error(`Backend error: ${errorMessage}`);
      }

      const successData = await response.json().catch(() => ({}));
      console.log('✅ Test notification sent successfully:', successData);
    } catch (error) {
      console.error('💥 Failed to send test notification:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred during test notification');
      }
    }
  }

  /**
   * Έλεγχος αν τα notifications είναι enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const permissions = await PushNotifications.checkPermissions();
      return permissions.receive === 'granted';
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await PushNotifications.requestPermissions();
      return permissions.receive === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
