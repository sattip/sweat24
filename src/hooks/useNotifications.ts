import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/config/api';
import { toast } from 'sonner';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  read_at: string | null;
  created_at: string;
  data?: any;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Check for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);
  
  const fetchNotifications = async () => {
    if (!user) return; // Don't fetch if no user
    
    try {
      const response = await apiRequest('/notifications/user?per_page=20');
      
      // Handle different HTTP status codes gracefully
      if (response.status === 401) {
        // Unauthorized - just return silently
        return;
      }
      
      if (response.status === 404) {
        // Endpoint not found - backend doesn't have notifications API yet
        console.log('Notifications endpoint not available (404)');
        return;
      }
      
      if (!response.ok) {
        // Other errors - log but don't crash
        console.log(`Notifications API returned ${response.status}, notifications disabled`);
        return;
      }
      
      const result = await response.json();
      
      if (result.data) {
        const notificationsData = result.data.data || [];
        setNotifications(notificationsData);
        
        // Count unread
        const unread = notificationsData.filter((n: any) => !n.read_at).length;
        setUnreadCount(unread);
        
        // Show toast for new order ready notifications
        const newOrderReadyNotifications = notificationsData.filter((n: any) => 
          n.notification?.type === 'order_ready' && !n.read_at
        );
        
        newOrderReadyNotifications.forEach((notif: any) => {
          toast.success(notif.notification.title, {
            description: notif.notification.message,
            duration: 5000,
          });
        });
      }
    } catch (error) {
      // Network or parsing errors - handle gracefully
      console.log('Notifications temporarily unavailable:', error.message);
    }
  };
  
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.log('Mark as read temporarily unavailable:', error.message);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const response = await apiRequest('/notifications/read-all', {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.log('Mark all as read temporarily unavailable:', error.message);
    }
  };
  
  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}