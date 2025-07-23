import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, AlertTriangle, Info, CheckCircle, ShoppingCart, Package } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { apiRequest } from "@/config/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface OwnerNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

export function OwnerNotifications() {
  const [notifications, setNotifications] = useState<OwnerNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const result = await apiRequest('/owner-notifications');
      
      if (result.success && result.data) {
        setNotifications(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching owner notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest(`/owner-notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      toast.error('Σφάλμα κατά τη σήμανση της ειδοποίησης');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest('/owner-notifications/read-all', {
        method: 'POST'
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Όλες οι ειδοποιήσεις σημειώθηκαν ως αναγνωσμένες');
    } catch (error) {
      toast.error('Σφάλμα κατά τη σήμανση των ειδοποιήσεων');
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4 text-primary" />;
      case 'order_ready': return <Package className="h-4 w-4 text-green-500" />;
      case 'graceful_cancellation': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'package_extension': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order': return 'Νέα Παραγγελία';
      case 'order_ready': return 'Παραγγελία Έτοιμη';
      case 'graceful_cancellation': return 'Χαριστική Ακύρωση';
      case 'package_extension': return 'Επέκταση Πακέτου';
      default: return 'Γενική Ειδοποίηση';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Ειδοποιήσεις Ιδιοκτήτη</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Όλα ως αναγνωσμένα
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            Δεν υπάρχουν ειδοποιήσεις
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                markAsRead(notification.id);
                // Navigate to store page for order notifications
                if (notification.type === 'order' || notification.type === 'order_ready') {
                  navigate('/store');
                }
              }}
            >
              <div className="flex items-center gap-2 w-full">
                {getTypeIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">
                      {getTypeLabel(notification.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), 'dd/MM HH:mm', { locale: el })}
                    </span>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              +{notifications.length - 5} περισσότερες ειδοποιήσεις
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 