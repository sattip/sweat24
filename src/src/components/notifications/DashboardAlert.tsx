import React, { useState, useEffect } from 'react';
import { AlertCircle, X, CheckCircle, Info, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { notificationService } from '@/services/apiService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface HighPriorityNotification {
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

export const DashboardAlert: React.FC = () => {
  const [highPriorityNotifications, setHighPriorityNotifications] = useState<HighPriorityNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchHighPriorityNotifications();
    
    // Poll for high priority notifications every 20 seconds
    const interval = setInterval(() => {
      fetchHighPriorityNotifications();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const fetchHighPriorityNotifications = async () => {
    try {
      const allNotifications = await notificationService.getAll();
      
      // Filter for high priority unread notifications that aren't dismissed
      const highPriority = allNotifications.filter((n: HighPriorityNotification) => 
        n.notification.priority === 'high' && 
        !n.is_read && 
        !n.read_at &&
        !dismissedIds.has(n.id)
      );
      
      setHighPriorityNotifications(highPriority);
    } catch (error) {
      console.error('Error fetching high priority notifications:', error);
    }
  };

  const handleDismiss = async (notificationId: number) => {
    try {
      // Mark as read in backend
      await notificationService.markAsRead(notificationId);
      
      // Add to dismissed locally
      setDismissedIds(prev => new Set([...prev, notificationId]));
      
      // Remove from current list
      setHighPriorityNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast.error('Σφάλμα κατά την απόκρυψη ειδοποίησης');
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('el-GR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (highPriorityNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {highPriorityNotifications.map((notification) => (
        <Card 
          key={notification.id}
          className={cn(
            "border-l-4 shadow-md animate-in slide-in-from-top duration-300",
            getAlertBgColor(notification.notification.type)
          )}
        >
          <Alert className="border-0 bg-transparent">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getAlertIcon(notification.notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">
                      {notification.notification.title}
                    </h4>
                    <AlertDescription className="text-sm leading-relaxed">
                      {notification.notification.message}
                    </AlertDescription>
                    <p className="text-xs opacity-75 mt-2">
                      {formatDate(notification.delivered_at)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-black/10"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        </Card>
      ))}
    </div>
  );
}; 