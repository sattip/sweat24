import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { notificationService } from '@/services/apiService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  notification: {
    title: string;
    message: string;
    type: string;
    priority: string;
  };
  delivered_at: string;
  read_at: string | null;
  is_read: boolean;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for notifications every 30 seconds
    const interval = setInterval(() => {
      console.log('🔔 Polling for notifications...');
      fetchNotifications();
    }, 30000);

    // Cleanup interval
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
      
      // Count unread notifications
      const unread = data.filter((n: Notification) => !n.is_read && !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      // Don't show error toast for polling - just log
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (recipientId: number) => {
    try {
      await notificationService.markAsRead(recipientId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === recipientId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      toast.error('Σφάλμα κατά την ενημέρωση ειδοποίησης');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
      toast.success('Όλες οι ειδοποιήσεις σημειώθηκαν ως αναγνωσμένες');
      
    } catch (error) {
      toast.error('Σφάλμα κατά την ενημέρωση ειδοποιήσεων');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Τώρα';
    if (diffMins < 60) return `${diffMins} λεπτά πριν`;
    if (diffHours < 24) return `${diffHours} ώρες πριν`;
    if (diffDays < 7) return `${diffDays} μέρες πριν`;
    
    return date.toLocaleDateString('el-GR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type: string, priority: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    
    if (priority === 'high') {
      return type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    }
    
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-12 w-12 md:h-10 md:w-10 touch-manipulation"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-6 w-6 md:h-5 md:w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-w-sm z-50 shadow-lg border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Ειδοποιήσεις
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} νέες
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-6 px-2"
                    onClick={handleMarkAllAsRead}
                  >
                    Όλες ως αναγνωσμένες
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            <ScrollArea className="h-[50vh] sm:h-80 max-h-96">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Φόρτωση ειδοποιήσεων...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Δεν έχετε νέες ειδοποιήσεις
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.slice(0, 10).map((notification) => {
                    const isRead = notification.is_read || !!notification.read_at;
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                          getNotificationBgColor(
                            notification.notification.type,
                            notification.notification.priority,
                            isRead
                          ),
                          !isRead && "border-l-4"
                        )}
                        onClick={() => !isRead && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(
                              notification.notification.type,
                              notification.notification.priority
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "text-sm font-medium line-clamp-1",
                                isRead ? "text-gray-600" : "text-gray-900"
                              )}>
                                {notification.notification.title}
                              </p>
                              {!isRead && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className={cn(
                              "text-xs mt-1 line-clamp-2",
                              isRead ? "text-gray-500" : "text-gray-700"
                            )}>
                              {notification.notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(notification.delivered_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 