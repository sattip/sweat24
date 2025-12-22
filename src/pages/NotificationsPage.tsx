import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
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

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
      const unread = data.filter((n: Notification) => !n.is_read && !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση ειδοποιήσεων');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (recipientId: number) => {
    try {
      await notificationService.markAsRead(recipientId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === recipientId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Σφάλμα κατά την ενημέρωση ειδοποίησης');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
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
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="bg-red-800 text-white px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ειδοποιήσεις</h1>
                <p className="text-red-200 text-sm">
                  Δείτε τις ειδοποιήσεις σας
                </p>
              </div>
            </div>
          </div>
        </div>
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Header */}
      <div className="bg-red-800 text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ειδοποιήσεις</h1>
                <p className="text-red-200 text-sm">
                  {unreadCount > 0 ? `${unreadCount} νέες ειδοποιήσεις` : 'Δείτε τις ειδοποιήσεις σας'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                size="sm"
                className="bg-white text-red-800 hover:bg-red-100"
                onClick={handleMarkAllAsRead}
              >
                Όλες αναγνωσμένες
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="container px-4 py-6 max-w-5xl mx-auto">
        {notifications.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Δεν έχετε ειδοποιήσεις</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const isRead = notification.is_read || !!notification.read_at;
              return (
                <Card
                  key={notification.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    !isRead && "border-l-4 border-l-blue-500 bg-blue-50/50"
                  )}
                  onClick={() => !isRead && handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(
                          notification.notification.type,
                          notification.notification.priority
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-medium",
                            isRead ? "text-gray-600" : "text-gray-900"
                          )}>
                            {notification.notification.title}
                          </p>
                          {!isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm mt-1",
                          isRead ? "text-gray-500" : "text-gray-700"
                        )}>
                          {notification.notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(notification.delivered_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
