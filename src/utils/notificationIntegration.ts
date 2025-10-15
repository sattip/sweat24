import enhancedNotificationService from '../services/enhancedNotificationService';

/**
 * Integration utilities for automatic notification scheduling
 * Use these functions to automatically schedule notifications when:
 * - User purchases a package
 * - User books an appointment
 * - Package is renewed
 * - Appointment is rescheduled
 */

export interface PackageInfo {
  id: number;
  name: string;
  endDate: Date;
  userId: number;
}

export interface AppointmentInfo {
  id: number;
  title: string;
  date: Date;
  userId: number;
  trainerName?: string;
}

/**
 * Auto-schedule notifications when a user purchases or renews a package
 */
export const schedulePackageNotifications = async (packageInfo: PackageInfo): Promise<boolean> => {
  try {
    console.log(`📦 Scheduling notifications for package: ${packageInfo.name}`);
    
    await enhancedNotificationService.schedulePackageExpiryNotifications(
      packageInfo.endDate,
      packageInfo.userId,
      packageInfo.id,
      packageInfo.name
    );
    
    console.log(`✅ Package notifications scheduled successfully for package ${packageInfo.id}`);
    return true;
  } catch (error) {
    console.error('Failed to schedule package notifications:', error);
    return false;
  }
};

/**
 * Auto-schedule notification when a user books an appointment
 */
export const scheduleAppointmentNotification = async (appointmentInfo: AppointmentInfo): Promise<boolean> => {
  try {
    console.log(`📅 Scheduling notification for appointment: ${appointmentInfo.title}`);
    
    await enhancedNotificationService.scheduleAppointmentReminder(
      appointmentInfo.date,
      appointmentInfo.userId,
      appointmentInfo.id,
      appointmentInfo.title,
      appointmentInfo.trainerName
    );
    
    console.log(`✅ Appointment notification scheduled successfully for appointment ${appointmentInfo.id}`);
    return true;
  } catch (error) {
    console.error('Failed to schedule appointment notification:', error);
    return false;
  }
};

/**
 * Cancel package notifications (when package is cancelled or refunded)
 */
export const cancelPackageNotifications = async (packageId: number): Promise<boolean> => {
  try {
    console.log(`🗑️ Cancelling notifications for package: ${packageId}`);
    
    const weekNotificationId = `package_expiry_week_${packageId}`;
    const twoDaysNotificationId = `package_expiry_2days_${packageId}`;
    
    const weekCancelled = await enhancedNotificationService.cancelNotification(weekNotificationId);
    const twoDaysCancelled = await enhancedNotificationService.cancelNotification(twoDaysNotificationId);
    
    console.log(`✅ Package notifications cancelled: week=${weekCancelled}, 2days=${twoDaysCancelled}`);
    return weekCancelled || twoDaysCancelled;
  } catch (error) {
    console.error('Failed to cancel package notifications:', error);
    return false;
  }
};

/**
 * Cancel appointment notification (when appointment is cancelled)
 */
export const cancelAppointmentNotification = async (appointmentId: number): Promise<boolean> => {
  try {
    console.log(`🗑️ Cancelling notification for appointment: ${appointmentId}`);
    
    const notificationId = `appointment_reminder_${appointmentId}`;
    const cancelled = await enhancedNotificationService.cancelNotification(notificationId);
    
    console.log(`✅ Appointment notification cancelled: ${cancelled}`);
    return cancelled;
  } catch (error) {
    console.error('Failed to cancel appointment notification:', error);
    return false;
  }
};

/**
 * Reschedule appointment notification (when appointment time changes)
 */
export const rescheduleAppointmentNotification = async (
  appointmentId: number, 
  newAppointmentInfo: Omit<AppointmentInfo, 'id'>
): Promise<boolean> => {
  try {
    console.log(`🔄 Rescheduling notification for appointment: ${appointmentId}`);
    
    // Cancel old notification
    await cancelAppointmentNotification(appointmentId);
    
    // Schedule new notification
    const success = await scheduleAppointmentNotification({
      id: appointmentId,
      ...newAppointmentInfo
    });
    
    console.log(`✅ Appointment notification rescheduled: ${success}`);
    return success;
  } catch (error) {
    console.error('Failed to reschedule appointment notification:', error);
    return false;
  }
};

/**
 * Update package notifications (when package is extended or modified)
 */
export const updatePackageNotifications = async (
  packageId: number,
  newPackageInfo: Omit<PackageInfo, 'id'>
): Promise<boolean> => {
  try {
    console.log(`🔄 Updating notifications for package: ${packageId}`);
    
    // Cancel old notifications
    await cancelPackageNotifications(packageId);
    
    // Schedule new notifications
    const success = await schedulePackageNotifications({
      id: packageId,
      ...newPackageInfo
    });
    
    console.log(`✅ Package notifications updated: ${success}`);
    return success;
  } catch (error) {
    console.error('Failed to update package notifications:', error);
    return false;
  }
};

/**
 * Batch schedule notifications for multiple packages (useful for data migration)
 */
export const batchSchedulePackageNotifications = async (packages: PackageInfo[]): Promise<{ success: number; failed: number }> => {
  console.log(`📦 Batch scheduling notifications for ${packages.length} packages`);
  
  let success = 0;
  let failed = 0;
  
  for (const packageInfo of packages) {
    try {
      const result = await schedulePackageNotifications(packageInfo);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to schedule notifications for package ${packageInfo.id}:`, error);
      failed++;
    }
  }
  
  console.log(`✅ Batch scheduling complete: ${success} succeeded, ${failed} failed`);
  return { success, failed };
};

/**
 * Batch schedule notifications for multiple appointments
 */
export const batchScheduleAppointmentNotifications = async (appointments: AppointmentInfo[]): Promise<{ success: number; failed: number }> => {
  console.log(`📅 Batch scheduling notifications for ${appointments.length} appointments`);
  
  let success = 0;
  let failed = 0;
  
  for (const appointmentInfo of appointments) {
    try {
      const result = await scheduleAppointmentNotification(appointmentInfo);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to schedule notification for appointment ${appointmentInfo.id}:`, error);
      failed++;
    }
  }
  
  console.log(`✅ Batch scheduling complete: ${success} succeeded, ${failed} failed`);
  return { success, failed };
};

/**
 * Initialize notifications for existing user data (run once per user)
 */
export const initializeUserNotifications = async (userId: number): Promise<void> => {
  try {
    console.log(`🔔 Initializing notifications for user: ${userId}`);
    
    // This would typically fetch user's active packages and upcoming appointments
    // and schedule appropriate notifications
    
    // Example implementation:
    // const userPackages = await fetchUserActivePackages(userId);
    // const userAppointments = await fetchUserUpcomingAppointments(userId);
    
    // await batchSchedulePackageNotifications(userPackages);
    // await batchScheduleAppointmentNotifications(userAppointments);
    
    console.log(`✅ User notifications initialized for user: ${userId}`);
  } catch (error) {
    console.error('Failed to initialize user notifications:', error);
  }
};

// Example usage in your components:

/**
 * Example: Use in package purchase flow
 * 
 * const handlePackagePurchase = async (packageData) => {
 *   // ... handle purchase logic
 *   
 *   // Auto-schedule notifications
 *   await schedulePackageNotifications({
 *     id: packageData.id,
 *     name: packageData.name,
 *     endDate: new Date(packageData.end_date),
 *     userId: currentUser.id
 *   });
 * };
 */

/**
 * Example: Use in appointment booking flow
 * 
 * const handleAppointmentBooking = async (appointmentData) => {
 *   // ... handle booking logic
 *   
 *   // Auto-schedule notification
 *   await scheduleAppointmentNotification({
 *     id: appointmentData.id,
 *     title: appointmentData.title,
 *     date: new Date(appointmentData.scheduled_at),
 *     userId: currentUser.id,
 *     trainerName: appointmentData.trainer?.name
 *   });
 * };
 */

export default {
  schedulePackageNotifications,
  scheduleAppointmentNotification,
  cancelPackageNotifications,
  cancelAppointmentNotification,
  rescheduleAppointmentNotification,
  updatePackageNotifications,
  batchSchedulePackageNotifications,
  batchScheduleAppointmentNotifications,
  initializeUserNotifications
};
