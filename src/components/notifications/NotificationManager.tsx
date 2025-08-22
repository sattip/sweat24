import React, { useState } from 'react';
import { useBroadcasting } from '@/hooks/useBroadcasting';
import { 
  OrderReadyNotification,
  SessionsEndingNotification,
  ChatMessageNotification,
  NewEventNotification,
  BookingRequestStatusNotification
} from './NotificationComponents';

interface NotificationState {
  type: 'order_ready' | 'warning' | 'chat_message' | 'new_event' | 'booking_request_status' | null;
  open: boolean;
  data?: any;
}

export const NotificationManager: React.FC = () => {
  const [notification, setNotification] = useState<NotificationState>({
    type: null,
    open: false,
    data: null
  });

  // Set up real broadcasting listener
  const { isListening } = useBroadcasting({
    debug: process.env.NODE_ENV === 'development', // Debug only in development
    onNotification: (broadcastNotification) => {
      console.log('📢 Real notification from backend:', broadcastNotification);
      
      // Show detailed modal for certain high-priority notifications
      const detailedTypes = ['order_ready', 'warning', 'new_event', 'booking_request_status'];
      
      if (detailedTypes.includes(broadcastNotification.type) && broadcastNotification.priority === 'high') {
        setNotification({
          type: broadcastNotification.type,
          open: true,
          data: broadcastNotification.data
        });
      }
    }
  });

  const closeNotification = () => {
    setNotification({ type: null, open: false, data: null });
  };

  return (
    <>
      {/* Real-time connection status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50 bg-black text-white text-xs p-2 rounded opacity-50">
          WebSocket: {isListening ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      )}

      {/* Order Ready Notification */}
      <OrderReadyNotification
        open={notification.type === 'order_ready' && notification.open}
        onOpenChange={closeNotification}
        data={notification.data}
      />

      {/* Sessions Ending Notification */}
      <SessionsEndingNotification
        open={notification.type === 'warning' && notification.open}
        onOpenChange={closeNotification}
        data={notification.data}
      />

      {/* Chat Message Notification */}
      <ChatMessageNotification
        open={notification.type === 'chat_message' && notification.open}
        onOpenChange={closeNotification}
        data={notification.data}
      />

      {/* New Event Notification */}
      <NewEventNotification
        open={notification.type === 'new_event' && notification.open}
        onOpenChange={closeNotification}
        data={notification.data}
      />

      {/* Booking Request Status Notification */}
      <BookingRequestStatusNotification
        open={notification.type === 'booking_request_status' && notification.open}
        onOpenChange={closeNotification}
        data={notification.data}
      />
    </>
  );
}; 