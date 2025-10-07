import fcmService from '../services/fcmService';

/**
 * FCM Integration utilities for automatic notification scheduling
 * Use these functions to automatically schedule FCM notifications when:
 * - User purchases a package
 * - User books an appointment
 * - Package is renewed
 * - Appointment is rescheduled
 */

export interface FCMPackageInfo {
  id: number;
  name: string;
  endDate: Date;
  userId: number;
}

export interface FCMAppointmentInfo {
  id: number;
  title: string;
  date: Date;
  userId: number;
  trainerName?: string;
}

/**
 * Auto-schedule FCM notifications when a user purchases or renews a package
 */
export const scheduleFCMPackageNotifications = async (packageInfo: FCMPackageInfo): Promise<boolean> => {
  try {
    console.log(`📦 Scheduling FCM notifications for package: ${packageInfo.name}`);
    
    let success = true;
    
    // Schedule 1 week before expiry
    const oneWeekBefore = new Date(packageInfo.endDate);
    oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
    
    if (oneWeekBefore > new Date()) {
      success = await fcmService.scheduleNotification(
        'package_expiry_week',
        '📅 Λήξη Πακέτου σε 1 Εβδομάδα',
        `Το ${packageInfo.name} σας λήγει σε 7 μέρες. Ανανεώστε το για να συνεχίσετε τις προπονήσεις σας!`,
        oneWeekBefore,
        packageInfo.userId,
        packageInfo.id
      );
    }
    
    // Schedule 2 days before expiry
    const twoDaysBefore = new Date(packageInfo.endDate);
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
    
    if (twoDaysBefore > new Date() && success) {
      success = await fcmService.scheduleNotification(
        'package_expiry_2days',
        '⚠️ Λήξη Πακέτου σε 2 Μέρες',
        `Το ${packageInfo.name} σας λήγει σε 2 μέρες! Μην χάσετε τις προπονήσεις σας - ανανεώστε τώρα.`,
        twoDaysBefore,
        packageInfo.userId,
        packageInfo.id
      );
    }
    
    console.log(`✅ FCM package notifications scheduled successfully for package ${packageInfo.id}`);
    return success;
  } catch (error) {
    console.error('Failed to schedule FCM package notifications:', error);
    return false;
  }
};

/**
 * Auto-schedule FCM notification when a user books an appointment
 */
export const scheduleFCMAppointmentNotification = async (appointmentInfo: FCMAppointmentInfo): Promise<boolean> => {
  try {
    console.log(`📅 Scheduling FCM notification for appointment: ${appointmentInfo.title}`);
    
    // 1 hour before appointment
    const oneHourBefore = new Date(appointmentInfo.date);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);

    const bodyText = appointmentInfo.trainerName 
      ? `Το ραντεβού σας "${appointmentInfo.title}" με τον/την ${appointmentInfo.trainerName} ξεκινά σε 1 ώρα!`
      : `Το ραντεβού σας "${appointmentInfo.title}" ξεκινά σε 1 ώρα!`;

    const success = await fcmService.scheduleNotification(
      'appointment_reminder',
      '🏋️ Υπενθύμιση Ραντεβού',
      bodyText,
      oneHourBefore,
      appointmentInfo.userId,
      appointmentInfo.id
    );
    
    console.log(`✅ FCM appointment notification scheduled successfully for appointment ${appointmentInfo.id}`);
    return success;
  } catch (error) {
    console.error('Failed to schedule FCM appointment notification:', error);
    return false;
  }
};

/**
 * Send immediate FCM notification (for testing or urgent notifications)
 */
export const sendImmediateFCMNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> => {
  try {
    console.log(`🔥 Sending immediate FCM notification: ${title}`);
    
    const success = await fcmService.sendTestNotification(title, body);
    
    console.log(`✅ Immediate FCM notification sent: ${success}`);
    return success;
  } catch (error) {
    console.error('Failed to send immediate FCM notification:', error);
    return false;
  }
};

/**
 * Initialize FCM for user (run once per user login)
 */
export const initializeFCMForUser = async (): Promise<boolean> => {
  try {
    console.log('🔥 Initializing FCM for user...');
    
    // Check if FCM is supported
    if (!fcmService.isSupported()) {
      console.warn('⚠️ FCM not supported in this environment');
      return false;
    }
    
    // Initialize FCM service
    const success = await fcmService.initialize();
    
    if (success) {
      console.log('✅ FCM initialized successfully for user');
    } else {
      console.warn('⚠️ FCM initialization failed for user');
    }
    
    return success;
  } catch (error) {
    console.error('Failed to initialize FCM for user:', error);
    return false;
  }
};

/**
 * Batch schedule FCM notifications for multiple packages
 */
export const batchScheduleFCMPackageNotifications = async (packages: FCMPackageInfo[]): Promise<{ success: number; failed: number }> => {
  console.log(`📦 Batch scheduling FCM notifications for ${packages.length} packages`);
  
  let success = 0;
  let failed = 0;
  
  for (const packageInfo of packages) {
    try {
      const result = await scheduleFCMPackageNotifications(packageInfo);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to schedule FCM notifications for package ${packageInfo.id}:`, error);
      failed++;
    }
  }
  
  console.log(`✅ FCM batch scheduling complete: ${success} succeeded, ${failed} failed`);
  return { success, failed };
};

/**
 * Batch schedule FCM notifications for multiple appointments
 */
export const batchScheduleFCMAppointmentNotifications = async (appointments: FCMAppointmentInfo[]): Promise<{ success: number; failed: number }> => {
  console.log(`📅 Batch scheduling FCM notifications for ${appointments.length} appointments`);
  
  let success = 0;
  let failed = 0;
  
  for (const appointmentInfo of appointments) {
    try {
      const result = await scheduleFCMAppointmentNotification(appointmentInfo);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to schedule FCM notification for appointment ${appointmentInfo.id}:`, error);
      failed++;
    }
  }
  
  console.log(`✅ FCM batch scheduling complete: ${success} succeeded, ${failed} failed`);
  return { success, failed };
};

export default {
  scheduleFCMPackageNotifications,
  scheduleFCMAppointmentNotification,
  sendImmediateFCMNotification,
  initializeFCMForUser,
  batchScheduleFCMPackageNotifications,
  batchScheduleFCMAppointmentNotifications
};
