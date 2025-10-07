import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  schedulePackageNotifications,
  scheduleAppointmentNotification,
  cancelPackageNotifications,
  cancelAppointmentNotification,
  rescheduleAppointmentNotification,
  updatePackageNotifications,
  PackageInfo,
  AppointmentInfo
} from '../utils/notificationIntegration';

/**
 * Hook for integrating notifications with your app's business logic
 * Use this in components that handle package purchases, bookings, etc.
 */
export const useNotificationIntegration = () => {
  const { user } = useAuth();

  // Package-related notification actions
  const handlePackagePurchase = useCallback(async (packageData: any) => {
    if (!user) {
      console.warn('User not logged in, skipping notification scheduling');
      return false;
    }

    try {
      const packageInfo: PackageInfo = {
        id: packageData.id,
        name: packageData.name || packageData.title || 'Πακέτο προπονήσεων',
        endDate: new Date(packageData.end_date || packageData.endDate),
        userId: user.id
      };

      const success = await schedulePackageNotifications(packageInfo);
      
      if (success) {
        console.log('✅ Package notifications scheduled successfully');
      } else {
        console.warn('⚠️ Failed to schedule package notifications');
      }
      
      return success;
    } catch (error) {
      console.error('Error in handlePackagePurchase:', error);
      return false;
    }
  }, [user]);

  const handlePackageRenewal = useCallback(async (packageData: any) => {
    if (!user) {
      console.warn('User not logged in, skipping notification scheduling');
      return false;
    }

    try {
      const packageInfo: Omit<PackageInfo, 'id'> = {
        name: packageData.name || packageData.title || 'Πακέτο προπονήσεων',
        endDate: new Date(packageData.end_date || packageData.endDate),
        userId: user.id
      };

      const success = await updatePackageNotifications(packageData.id, packageInfo);
      
      if (success) {
        console.log('✅ Package notifications updated successfully');
      } else {
        console.warn('⚠️ Failed to update package notifications');
      }
      
      return success;
    } catch (error) {
      console.error('Error in handlePackageRenewal:', error);
      return false;
    }
  }, [user]);

  const handlePackageCancellation = useCallback(async (packageId: number) => {
    try {
      const success = await cancelPackageNotifications(packageId);
      
      if (success) {
        console.log('✅ Package notifications cancelled successfully');
      } else {
        console.warn('⚠️ Failed to cancel package notifications');
      }
      
      return success;
    } catch (error) {
      console.error('Error in handlePackageCancellation:', error);
      return false;
    }
  }, []);

  // Appointment-related notification actions
  const handleAppointmentBooking = useCallback(async (appointmentData: any) => {
    if (!user) {
      console.warn('User not logged in, skipping notification scheduling');
      return false;
    }

    try {
      const appointmentInfo: AppointmentInfo = {
        id: appointmentData.id,
        title: appointmentData.title || appointmentData.service_name || 'Ραντεβού',
        date: new Date(appointmentData.scheduled_at || appointmentData.date),
        userId: user.id,
        trainerName: appointmentData.trainer?.name || appointmentData.trainer_name
      };

      const success = await scheduleAppointmentNotification(appointmentInfo);
      
      if (success) {
        console.log('✅ Appointment notification scheduled successfully');
      } else {
        console.warn('⚠️ Failed to schedule appointment notification');
      }
      
      return success;
    } catch (error) {
      console.error('Error in handleAppointmentBooking:', error);
      return false;
    }
  }, [user]);

  const handleAppointmentReschedule = useCallback(async (appointmentId: number, newAppointmentData: any) => {
    if (!user) {
      console.warn('User not logged in, skipping notification scheduling');
      return false;
    }

    try {
      const newAppointmentInfo: Omit<AppointmentInfo, 'id'> = {
        title: newAppointmentData.title || newAppointmentData.service_name || 'Ραντεβού',
        date: new Date(newAppointmentData.scheduled_at || newAppointmentData.date),
        userId: user.id,
        trainerName: newAppointmentData.trainer?.name || newAppointmentData.trainer_name
      };

      const success = await rescheduleAppointmentNotification(appointmentId, newAppointmentInfo);
      
      if (success) {
        console.log('✅ Appointment notification rescheduled successfully');
      } else {
        console.warn('⚠️ Failed to reschedule appointment notification');
      }
      
      return success;
    } catch (error) {
      console.error('Error in handleAppointmentReschedule:', error);
      return false;
    }
  }, [user]);

  const handleAppointmentCancellation = useCallback(async (appointmentId: number) => {
    try {
      const success = await cancelAppointmentNotification(appointmentId);
      
      if (success) {
        console.log('✅ Appointment notification cancelled successfully');
      } else {
        console.warn('⚠️ Failed to cancel appointment notification');
      }
      
      return success;
    } catch (error) {
      console.error('Error in handleAppointmentCancellation:', error);
      return false;
    }
  }, []);

  return {
    // Package actions
    handlePackagePurchase,
    handlePackageRenewal,
    handlePackageCancellation,
    
    // Appointment actions  
    handleAppointmentBooking,
    handleAppointmentReschedule,
    handleAppointmentCancellation,
    
    // User context
    isLoggedIn: !!user,
    userId: user?.id
  };
};

export default useNotificationIntegration;

/*
USAGE EXAMPLES:

1. In a Package Purchase Component:
```tsx
import { useNotificationIntegration } from '../hooks/useNotificationIntegration';

const PackagePurchasePage = () => {
  const { handlePackagePurchase } = useNotificationIntegration();
  
  const onPurchaseComplete = async (packageData) => {
    // ... handle payment logic
    
    // Automatically schedule notifications
    await handlePackagePurchase(packageData);
  };
  
  return <div>...</div>;
};
```

2. In a Booking Component:
```tsx
import { useNotificationIntegration } from '../hooks/useNotificationIntegration';

const BookingPage = () => {
  const { handleAppointmentBooking } = useNotificationIntegration();
  
  const onBookingComplete = async (appointmentData) => {
    // ... handle booking logic
    
    // Automatically schedule notification
    await handleAppointmentBooking(appointmentData);
  };
  
  return <div>...</div>;
};
```

3. In a Package Management Component:
```tsx
import { useNotificationIntegration } from '../hooks/useNotificationIntegration';

const PackageManagementPage = () => {
  const { handlePackageCancellation, handlePackageRenewal } = useNotificationIntegration();
  
  const onCancelPackage = async (packageId) => {
    // ... handle cancellation logic
    
    // Cancel related notifications
    await handlePackageCancellation(packageId);
  };
  
  const onRenewPackage = async (packageData) => {
    // ... handle renewal logic
    
    // Update notifications with new dates
    await handlePackageRenewal(packageData);
  };
  
  return <div>...</div>;
};
```
*/
