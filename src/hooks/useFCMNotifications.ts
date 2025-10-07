import { useState, useEffect, useCallback } from 'react';
import { MessagePayload } from 'firebase/messaging';
import fcmService from '../services/fcmService';
import { useAuth } from '../contexts/AuthContext';

interface FCMState {
  isInitialized: boolean;
  hasToken: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
  status: any;
  messages: MessagePayload[];
}

interface FCMActions {
  initialize: () => Promise<boolean>;
  sendTestNotification: (title?: string, body?: string) => Promise<boolean>;
  schedulePackageExpiry: (packageEndDate: Date, packageId: number, packageName?: string) => Promise<boolean>;
  scheduleAppointmentReminder: (appointmentDate: Date, appointmentId: number, appointmentTitle: string) => Promise<boolean>;
  refreshToken: () => Promise<string | null>;
  clearError: () => void;
  clearMessages: () => void;
}

export const useFCMNotifications = (): [FCMState, FCMActions] => {
  const { user } = useAuth();
  
  const [state, setState] = useState<FCMState>({
    isInitialized: false,
    hasToken: false,
    permission: 'default',
    isLoading: false,
    error: null,
    status: null,
    messages: []
  });

  // Initialize FCM
  const initialize = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔥 Initializing FCM via hook...');
      
      // Check if FCM is supported
      if (!fcmService.isSupported()) {
        throw new Error('FCM not supported in this environment');
      }

      const success = await fcmService.initialize();
      
      if (success) {
        const status = fcmService.getStatus();
        
        setState(prev => ({
          ...prev,
          isInitialized: success,
          hasToken: status.hasToken,
          permission: status.permission,
          status,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          isInitialized: false,
          isLoading: false,
          error: 'Failed to initialize FCM service'
        }));
      }
      
      return success;
    } catch (error) {
      console.error('FCM hook initialization failed:', error);
      setState(prev => ({
        ...prev,
        isInitialized: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown FCM initialization error'
      }));
      return false;
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async (title?: string, body?: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const success = await fcmService.sendTestNotification(title, body);
      
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
    packageName: string = 'πακέτο'
  ): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be logged in to schedule notifications');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Schedule 1 week before
      const oneWeekBefore = new Date(packageEndDate);
      oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
      
      let success = true;
      
      if (oneWeekBefore > new Date()) {
        success = await fcmService.scheduleNotification(
          'package_expiry_week',
          '📅 Λήξη Πακέτου σε 1 Εβδομάδα',
          `Το ${packageName} σας λήγει σε 7 μέρες. Ανανεώστε το για να συνεχίσετε τις προπονήσεις σας!`,
          oneWeekBefore,
          user.id,
          packageId
        );
      }
      
      // Schedule 2 days before
      const twoDaysBefore = new Date(packageEndDate);
      twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
      
      if (twoDaysBefore > new Date() && success) {
        success = await fcmService.scheduleNotification(
          'package_expiry_2days',
          '⚠️ Λήξη Πακέτου σε 2 Μέρες',
          `Το ${packageName} σας λήγει σε 2 μέρες! Μην χάσετε τις προπονήσεις σας - ανανεώστε τώρα.`,
          twoDaysBefore,
          user.id,
          packageId
        );
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: success ? null : 'Failed to schedule package expiry notifications'
      }));
      
      return success;
    } catch (error) {
      console.error('Package expiry scheduling failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to schedule package expiry notifications'
      }));
      return false;
    }
  }, [user]);

  // Schedule appointment reminder
  const scheduleAppointmentReminder = useCallback(async (
    appointmentDate: Date,
    appointmentId: number,
    appointmentTitle: string
  ): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be logged in to schedule notifications');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 1 hour before appointment
      const oneHourBefore = new Date(appointmentDate);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);

      const success = await fcmService.scheduleNotification(
        'appointment_reminder',
        '🏋️ Υπενθύμιση Ραντεβού',
        `Το ραντεβού σας "${appointmentTitle}" ξεκινά σε 1 ώρα!`,
        oneHourBefore,
        user.id,
        appointmentId
      );
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: success ? null : 'Failed to schedule appointment reminder'
      }));
      
      return success;
    } catch (error) {
      console.error('Appointment reminder scheduling failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to schedule appointment reminder'
      }));
      return false;
    }
  }, [user]);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newToken = await fcmService.refreshToken();
      
      const status = fcmService.getStatus();
      setState(prev => ({
        ...prev,
        hasToken: !!newToken,
        status,
        isLoading: false,
        error: newToken ? null : 'Failed to refresh token'
      }));
      
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      }));
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  // Setup message listener
  useEffect(() => {
    if (!state.isInitialized) return;

    console.log('📡 Setting up FCM message listener...');
    
    const unsubscribe = fcmService.addMessageHandler((payload: MessagePayload) => {
      console.log('📩 FCM message received in hook:', payload);
      
      setState(prev => ({
        ...prev,
        messages: [payload, ...prev.messages.slice(0, 9)] // Keep last 10 messages
      }));
    });

    return unsubscribe;
  }, [state.isInitialized]);

  // Auto-refresh status periodically
  useEffect(() => {
    if (!state.isInitialized) return;

    const intervalId = setInterval(() => {
      const status = fcmService.getStatus();
      setState(prev => ({
        ...prev,
        status,
        hasToken: status.hasToken,
        permission: status.permission
      }));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [state.isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fcmService.cleanup();
    };
  }, []);

  const actions: FCMActions = {
    initialize,
    sendTestNotification,
    schedulePackageExpiry,
    scheduleAppointmentReminder,
    refreshToken,
    clearError,
    clearMessages
  };

  return [state, actions];
};

export default useFCMNotifications;
