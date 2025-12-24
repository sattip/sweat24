import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/services/apiService';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();

    // Poll for notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getAll();
      const unread = data.filter((n: any) => !n.is_read && !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      // Silent fail for polling
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 touch-manipulation"
      onClick={() => navigate('/notifications')}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute top-0 right-0 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] font-bold animate-pulse"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};
