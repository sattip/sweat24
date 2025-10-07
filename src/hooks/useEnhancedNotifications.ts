import { useState, useEffect, useCallback } from 'react';
import enhancedNotificationService, { NotificationPermissions, ScheduledNotification } from '../services/enhancedNotificationService';
import { useAuth } from '../contexts/AuthContext';

interface NotificationState {
  isInitialized: boolean;
  permissions: NotificationPermissions;
  scheduledNotifications: ScheduledNotification[];
  isLoading: boolean;
  error: string | null;
  status: any;
}

interface NotificationActions {
  initialize: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  sendTestNotification: (title?: string, body?: string) => Promise<boolean>;
  schedulePackageExpiry: (packageEndDate: Date, packageId: number, packageName?: string) => Promise<ScheduledNotification[]>;
  scheduleAppointmentReminder: (appointmentDate: Date, appointmentId: number, appointmentTitle: string, trainerName?: string) => Promise<ScheduledNotification>;
  cancelNotification: (notificationId: string) => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
}

export const useEnhancedNotifications = (): [NotificationState, NotificationActions] => {
  const { user } = useAuth();
  
  const [state, setState] = useState<NotificationState>({
    isInitialized: false,
    permissions: {
      canReceive: false,
      canRequest: false,
      currentStatus: 'unknown'
    },
    scheduledNotifications: [],
    isLoading: false,
    error: null,
    status: null
  });

  // Initialize notifications
  const initialize = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔔 Initializing notifications via hook...');
      const success = await enhancedNotificationService.initialize();
      
      if (success) {
        const permissions = await enhancedNotificationService.getNotificationPermissions();
        const status = enhancedNotificationService.getStatus();
        
        setState(prev => ({
          ...prev,
          isInitialized: success,
          permissions,
          status,
          isLoading: false
        }));
        
        // Fetch user notifications if logged in
        if (user) {
          await refreshNotifications();
        }
      } else {
        setState(prev => ({
          ...prev,
          isInitialized: false,
          isLoading: false,
          error: 'Failed to initialize notification service'
        }));
      }
      
      return success;
    } catch (error) {
      console.error('Hook initialization failed:', error);
      setState(prev => ({
        ...prev,
        isInitialized: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown initialization error'
      }));
      return false;
    }
  }, [user]);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const granted = await enhancedNotificationService.requestPermissions();
      const permissions = await enhancedNotificationService.getNotificationPermissions();
      
      setState(prev => ({
        ...prev,
        permissions,
        isLoading: false,
        error: granted ? null : 'Permission request was denied'
      }));
      
      return granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Permission request failed'
      }));
      return false;
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async (title?: string, body?: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const success = await enhancedNotificationService.sendTestNotification(title, body);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: success ? null : 'Failed to send test notification'
      }));
      
      return success;
    } catch (error) {
      console.error('Test notification failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Test notification failed'
      }));
      return false;
    }
  }, []);

  // Schedule package expiry notifications
  const schedulePackageExpiry = useCallback(async (
    packageEndDate: Date, 
    packageId: number, 
    packageName?: string
  ): Promise<ScheduledNotification[]> => {
    if (!user) {
      throw new Error('User must be logged in to schedule notifications');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const notifications = await enhancedNotificationService.schedulePackageExpiryNotifications(
        packageEndDate,
        user.id,
        packageId,
        packageName
      );
      
      setState(prev => ({
        ...prev,
        scheduledNotifications: [...prev.scheduledNotifications, ...notifications],
        isLoading: false
      }));
      
      return notifications;
    } catch (error) {
      console.error('Package expiry scheduling failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to schedule package expiry notifications'
      }));
      throw error;
    }
  }, [user]);

  // Schedule appointment reminder
  const scheduleAppointmentReminder = useCallback(async (
    appointmentDate: Date,
    appointmentId: number,
    appointmentTitle: string,
    trainerName?: string
  ): Promise<ScheduledNotification> => {
    if (!user) {
      throw new Error('User must be logged in to schedule notifications');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const notification = await enhancedNotificationService.scheduleAppointmentReminder(
        appointmentDate,
        user.id,
        appointmentId,
        appointmentTitle,
        trainerName
      );
      
      setState(prev => ({
        ...prev,
        scheduledNotifications: [...prev.scheduledNotifications, notification],
        isLoading: false
      }));
      
      return notification;
    } catch (error) {
      console.error('Appointment reminder scheduling failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to schedule appointment reminder'
      }));
      throw error;
    }
  }, [user]);

  // Cancel notification
  const cancelNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const success = await enhancedNotificationService.cancelNotification(notificationId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          scheduledNotifications: prev.scheduledNotifications.filter(n => n.id !== notificationId),
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to cancel notification'
        }));
      }
      
      return success;
    } catch (error) {
      console.error('Cancel notification failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to cancel notification'
      }));
      return false;
    }
  }, []);

  // Refresh notifications from server
  const refreshNotifications = useCallback(async (): Promise<void> => {
    if (!user) {
      console.log('No user logged in, skipping notification refresh');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const notifications = await enhancedNotificationService.getUserNotifications(user.id);
      
      setState(prev => ({
        ...prev,
        scheduledNotifications: notifications,
        isLoading: false
      }));
    } catch (error) {
      console.error('Refresh notifications failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh notifications'
      }));
    }
  }, [user]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-refresh permissions when they might have changed
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.isInitialized) {
      // Check permissions every 30 seconds
      intervalId = setInterval(async () => {
        try {
          const permissions = await enhancedNotificationService.getNotificationPermissions();
          setState(prev => ({ ...prev, permissions }));
        } catch (error) {
          console.error('Permission check failed:', error);
        }
      }, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      enhancedNotificationService.cleanup();
    };
  }, []);

  const actions: NotificationActions = {
    initialize,
    requestPermissions,
    sendTestNotification,
    schedulePackageExpiry,
    scheduleAppointmentReminder,
    cancelNotification,
    refreshNotifications,
    clearError
  };

  return [state, actions];
};

export default useEnhancedNotifications;
