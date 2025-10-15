import { useState, useEffect } from 'react';
import { notificationService, ScheduledNotification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface NotificationHook {
  isInitialized: boolean;
  permissionsGranted: boolean;
  userNotifications: ScheduledNotification[];
  loading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  schedulePackageExpiry: (packageEndDate: Date, packageId: number) => Promise<void>;
  scheduleAppointmentReminder: (appointmentDate: Date, appointmentId: number, title: string) => Promise<void>;
  cancelNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  sendTestNotification: (title: string, body: string) => Promise<void>;
}

export const useNotifications = (): NotificationHook => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [userNotifications, setUserNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize notification service όταν φορτώνει το hook
  useEffect(() => {
    if (user) {
      handleInitialize();
    }
  }, [user]);

  const handleInitialize = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const success = await notificationService.initialize();
      setIsInitialized(success);

      if (success) {
        const permissions = await notificationService.areNotificationsEnabled();
        setPermissionsGranted(permissions);
        
        if (permissions) {
          await refreshNotifications();
        }
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize notifications';
      setError(errorMessage);
      console.error('Notification initialization error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermissions = async (): Promise<boolean> => {
    try {
      setError(null);
      const granted = await notificationService.requestPermissions();
      setPermissionsGranted(granted);
      
      if (granted) {
        toast.success('Οι ειδοποιήσεις ενεργοποιήθηκαν!');
        await refreshNotifications();
      } else {
        toast.error('Δεν δόθηκε άδεια για ειδοποιήσεις');
      }
      
      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      toast.error('Σφάλμα κατά την αίτηση αδειών ειδοποιήσεων');
      return false;
    }
  };

  const handleSchedulePackageExpiry = async (packageEndDate: Date, packageId: number): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      await notificationService.schedulePackageExpiryNotifications(packageEndDate, user.id, packageId);
      toast.success('Ειδοποιήσεις λήξης πακέτου προγραμματίστηκαν!');
      await refreshNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule package expiry notifications';
      setError(errorMessage);
      toast.error('Σφάλμα κατά τον προγραμματισμό ειδοποιήσεων');
      throw err;
    }
  };

  const handleScheduleAppointmentReminder = async (appointmentDate: Date, appointmentId: number, title: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      await notificationService.scheduleAppointmentReminder(appointmentDate, user.id, appointmentId, title);
      toast.success('Υπενθύμιση ραντεβού προγραμματίστηκε!');
      await refreshNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule appointment reminder';
      setError(errorMessage);
      toast.error('Σφάλμα κατά τον προγραμματισμό υπενθύμισης');
      throw err;
    }
  };

  const handleCancelNotification = async (notificationId: string): Promise<void> => {
    try {
      setError(null);
      await notificationService.cancelNotification(notificationId);
      toast.success('Ειδοποίηση ακυρώθηκε!');
      await refreshNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel notification';
      setError(errorMessage);
      toast.error('Σφάλμα κατά την ακύρωση ειδοποίησης');
      throw err;
    }
  };

  const refreshNotifications = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const notifications = await notificationService.getUserNotifications(user.id);
      setUserNotifications(notifications);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh notifications';
      setError(errorMessage);
      console.error('Failed to refresh notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async (title: string, body: string): Promise<void> => {
    try {
      setError(null);
      await notificationService.sendTestNotification(title, body);
      toast.success('Test ειδοποίηση στάλθηκε!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(errorMessage);
      toast.error(`Test Notification Failed: ${errorMessage}`);
      throw err;
    }
  };

  return {
    isInitialized,
    permissionsGranted,
    userNotifications,
    loading,
    error,
    
    // Actions
    initialize: handleInitialize,
    requestPermissions: handleRequestPermissions,
    schedulePackageExpiry: handleSchedulePackageExpiry,
    scheduleAppointmentReminder: handleScheduleAppointmentReminder,
    cancelNotification: handleCancelNotification,
    refreshNotifications,
    sendTestNotification: handleSendTestNotification,
  };
};