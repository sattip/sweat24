import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { echo, refreshEchoAuthHeaders } from '@/lib/echo';

interface BroadcastNotification {
  id: string;
  type: 'order_ready' | 'warning' | 'chat_message' | 'new_event' | 'booking_request_status';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

interface UseBroadcastingOptions {
  /** Callback when notification is received */
  onNotification?: (notification: BroadcastNotification) => void;
  /** Enable debug logging */
  debug?: boolean;
}

export function useBroadcasting(options: UseBroadcastingOptions = {}) {
  const { user } = useAuth();
  const isConnectedRef = useRef(false);
  const channelsRef = useRef<any[]>([]);

  const {
    onNotification,
    debug = false
  } = options;

  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[Broadcasting] ${message}`, ...args);
    }
  }, [debug]);

  const showNotificationToast = useCallback((notification: BroadcastNotification) => {
    log('Showing notification toast:', notification);

    const isPositive = ['order_ready', 'booking_request_status', 'new_event'].includes(notification.type);
    const duration = notification.priority === 'high' ? 3000 :
      notification.priority === 'medium' ? 2500 : 2000;

    if (isPositive && !notification.message.includes('απορρίφθηκε') && !notification.message.includes('Απορρίφθηκε')) {
      toast.success(notification.title, {
        description: notification.message,
        duration,
        action: getNotificationAction(notification)
      });
    } else if (notification.type === 'warning') {
      const isLastSession = notification.message.includes('Τελευταία');
      if (isLastSession) {
        toast.warning(notification.title, {
          description: notification.message,
          duration: 4000, // Shorter duration for critical warnings
        });
      } else {
        toast.info(notification.title, {
          description: notification.message,
          duration,
        });
      }
    } else if (notification.message.includes('απορρίφθηκε') || notification.message.includes('Απορρίφθηκε')) {
      toast.error(notification.title, {
        description: notification.message,
        duration,
      });
    } else {
      toast.info(notification.title, {
        description: notification.message,
        duration,
      });
    }

    // Request browser notification permission if needed
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png'
      });
    }
  }, [log]);

  const getNotificationAction = useCallback((notification: BroadcastNotification) => {
    switch (notification.type) {
      case 'order_ready':
        return {
          label: 'Δείτε Παραγγελίες',
          onClick: () => window.location.href = '/orders'
        };
      case 'booking_request_status':
        return {
          label: 'Δείτε Αιτήματα',
          onClick: () => window.location.href = '/profile?tab=booking-requests'
        };
      case 'new_event':
        return {
          label: 'Δείτε Εκδηλώσεις',
          onClick: () => window.location.href = '/events'
        };
      case 'chat_message':
        return {
          label: 'Ανοίξτε Chat',
          onClick: () => {
            const chatButton = document.querySelector('[data-chat-trigger]') as HTMLElement;
            if (chatButton) chatButton.click();
          }
        };
      default:
        return undefined;
    }
  }, []);

  const handleBroadcastEvent = useCallback((eventData: any) => {
    log('📢 Real broadcast event received:', eventData);

    // Transform backend event data to our notification format
    const notification: BroadcastNotification = {
      id: eventData.id || Date.now().toString(),
      type: eventData.type || 'info',
      title: eventData.title || 'Νέα Ειδοποίηση',
      message: eventData.message || '',
      data: eventData.data || eventData,
      priority: eventData.priority || 'medium',
      created_at: eventData.created_at || new Date().toISOString()
    };

    showNotificationToast(notification);

    if (onNotification) {
      onNotification(notification);
    }
  }, [log, showNotificationToast, onNotification]);

  const setupChannels = useCallback(() => {
    if (!user || isConnectedRef.current) {
      return;
    }

    try {

      refreshEchoAuthHeaders();

      // Clean up any existing channels
      channelsRef.current.forEach(channel => {
        echo.leave(channel.name);
      });
      channelsRef.current = [];

      // 1. Order Ready Channel
      const orderChannel = echo.private(`order.${user.id}`)
        .listen('OrderReadyForPickup', (e: any) => {
          log('Order ready event:', e);
          handleBroadcastEvent({
            type: 'order_ready',
            title: 'Παραγγελία Έτοιμη για Παραλαβή! 📦',
            message: `Η παραγγελία #${e.order?.order_number || '---'} είναι έτοιμη για παραλαβή.`,
            data: e.order,
            priority: 'high'
          });
        });
      channelsRef.current.push(orderChannel);

      // 2. User Sessions Channel
      const userChannel = echo.private(`user.${user.id}`)
        .listen('UserNearSessionsEnd', (e: any) => {
          log('Sessions ending event:', e);
          const message = e.isLastSession
            ? 'Αυτή είναι η τελευταία σας συνεδρία! Χρειάζεστε νέο πακέτο για να συνεχίσετε.'
            : `Έχετε μόνο ${e.remainingSessions} συνεδρίες ακόμα!`;

          handleBroadcastEvent({
            type: 'warning',
            title: e.isLastSession ? 'Τελευταία Συνεδρία! ⚠️' : 'Προτελευταία Συνεδρία! 📅',
            message: message,
            data: { remainingSessions: e.remainingSessions, isLastSession: e.isLastSession },
            priority: e.isLastSession ? 'high' : 'medium'
          });
        })
        .listen('WaitlistSpotAvailable', (e: any) => {
          log('Waitlist spot available event:', e);

          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Διαθέσιμη θέση στο μάθημα!', {
              body: `Η κράτησή σας στο ${e.class_name} επιβεβαιώθηκε!`,
              icon: '/notification-icon.png'
            });
          }

          handleBroadcastEvent({
            type: 'booking_request_status',
            title: 'Διαθέσιμη θέση στο μάθημα! 🎉',
            message: `Η κράτησή σας στο ${e.class_name} επιβεβαιώθηκε!`,
            data: e,
            priority: 'high'
          });

          // Refresh bookings to show updated status
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        });
      channelsRef.current.push(userChannel);

      // 3. Chat Channel
      const chatChannel = echo.private(`chat.${user.id}`)
        .listen('ChatMessageReceived', (e: any) => {
          log('Chat message event:', e);
          handleBroadcastEvent({
            type: 'chat_message',
            title: 'Νέο μήνυμα από το sweat93! 💬',
            message: `${e.message?.sender_name || 'Γραμματεία'}: ${e.message?.content || ''}`,
            data: e.message,
            priority: 'medium'
          });
        });
      channelsRef.current.push(chatChannel);

      // 4. Public Events Channel
      const eventsChannel = echo.channel('events.all')
        .listen('EventCreated', (e: any) => {
          log('New event created:', e);
          handleBroadcastEvent({
            type: 'new_event',
            title: 'Νέα Εκδήλωση! 🎉',
            message: `${e.event?.title || 'Νέα εκδήλωση'} - ${e.event?.event_date || ''}`,
            data: e.event,
            priority: 'medium'
          });
        });
      channelsRef.current.push(eventsChannel);

      // 5. Booking Request Channel
      const bookingChannel = echo.private(`booking-request.user.${user.id}`)
        .listen('BookingRequestStatusChanged', (e: any) => {
          log('Booking request status changed:', e);

          const isConfirmed = e.newStatus === 'confirmed';
          const statusMessage = isConfirmed
            ? `Το ραντεβού σας επιβεβαιώθηκε για ${e.bookingRequest?.confirmed_date || ''} στις ${e.bookingRequest?.confirmed_time || ''}`
            : `Το ραντεβού σας απορρίφθηκε. ${e.bookingRequest?.rejection_reason ? 'Λόγος: ' + e.bookingRequest.rejection_reason : ''}`;

          handleBroadcastEvent({
            type: 'booking_request_status',
            title: isConfirmed ? 'Ραντεβού Επιβεβαιώθηκε! ✅' : 'Ραντεβού Απορρίφθηκε ❌',
            message: statusMessage,
            data: e.bookingRequest,
            priority: 'high'
          });
        });
      channelsRef.current.push(bookingChannel);

      isConnectedRef.current = true;

    } catch (error) {
      log('❌ Channel setup failed:', error);
    }
  }, [user, log, handleBroadcastEvent]);

  const disconnectChannels = useCallback(() => {
    if (channelsRef.current.length > 0) {
      channelsRef.current.forEach(channel => {
        echo.leave(channel.name);
      });
      channelsRef.current = [];
      isConnectedRef.current = false;

    }
  }, [log]);

  // Setup connection when user is available
  useEffect(() => {
    if (user) {
      setupChannels();
    } else {
      disconnectChannels();
    }

    return () => {
      disconnectChannels();
    };
  }, [user, setupChannels, disconnectChannels]);

  return {
    isListening: isConnectedRef.current && !!user,
    disconnect: disconnectChannels
  };
} 
