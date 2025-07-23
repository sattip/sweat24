import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "../hooks/use-toast";
import { apiService } from "../services/apiService";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { NotificationType } from "@/utils/notificationTypes";

interface NotificationRecipient {
  id: number;
  delivered_at: string;
  read_at: string | null;
  notification: {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    priority: 'low' | 'medium' | 'high';
  };
}

export function NotificationBell() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationRecipient[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Fetch notifications periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiService.get("/notifications/user", {
        params: { per_page: 20 }
      });
      
      const data = response.data.data || [];
      setNotifications(data);
      
      // Count unread notifications
      const unread = data.filter((n: NotificationRecipient) => !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (recipient: NotificationRecipient) => {
    if (recipient.read_at) return;

    try {
      await apiService.post(`/notifications/${recipient.id}/read`);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === recipient.id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.post("/notifications/read-all");
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      toast({
        title: "Επιτυχία",
        description: "Όλες οι ειδοποιήσεις σημειώθηκαν ως αναγνωσμένες",
      });
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ενημέρωσης ειδοποιήσεων",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return '';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Ειδοποιήσεις</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Σήμανση όλων ως αναγνωσμένες
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Φόρτωση...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Δεν έχετε ειδοποιήσεις</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((recipient) => (
                <div
                  key={recipient.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !recipient.read_at ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => markAsRead(recipient)}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(recipient.notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium text-sm ${
                          !recipient.read_at ? 'font-semibold' : ''
                        }`}>
                          {recipient.notification.title}
                        </h4>
                        {!recipient.read_at && (
                          <Badge variant="secondary" className="text-xs px-1">
                            Νέο
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipient.notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(recipient.delivered_at), 'dd MMM, HH:mm', { locale: el })}
                        </p>
                        {recipient.notification.priority !== 'medium' && (
                          <span className={`text-xs ${getPriorityColor(recipient.notification.priority)}`}>
                            {recipient.notification.priority === 'high' ? 'Υψηλή' : 'Χαμηλή'} προτεραιότητα
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button 
              variant="ghost" 
              className="w-full text-sm"
              onClick={() => {
                setOpen(false);
                // Could navigate to a notifications page if needed
              }}
            >
              Προβολή όλων των ειδοποιήσεων
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}