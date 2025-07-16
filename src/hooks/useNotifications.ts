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
      
      // If unauthorized, just return silently
      if (response.status === 401) {
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
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
      // Only log errors that aren't auth-related
      if (!error.message?.includes('401')) {
        console.error('Error fetching notifications:', error);
      }
    }
  };
  
  const markAsRead = async (notificationId: number) => {
    try {
      await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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