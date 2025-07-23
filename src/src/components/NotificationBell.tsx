import React, { useState, useEffect } from "react";
import { Bell, Package, CheckCircle, XCircle, Gift, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { notificationService } from "@/services/apiService";
import { useNavigate } from "react-router-dom";

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
      
      // Count unread notifications
      const unread = data.filter((n: any) => !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
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
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_ready':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'booking_request_approved':
      case 'booking_request_scheduled':
      case 'booking_request_status':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'booking_request_cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'sessions_ending':
        return <Bell className="h-4 w-4 text-orange-500" />;
      case 'chat_message':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'new_event':
        return <PartyPopper className="h-4 w-4 text-purple-500" />;
      case 'offer':
      case 'special_offer':
      case 'promotion':
        return <Gift className="h-4 w-4 text-pink-500" />;
      case 'party':
      case 'celebration':
      case 'event':
        return <PartyPopper className="h-4 w-4 text-purple-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'order_ready':
        navigate('/orders');
        break;
      case 'booking_request_approved':
      case 'booking_request_scheduled': 
      case 'booking_request_cancelled':
      case 'booking_request_status':
        navigate('/profile?tab=booking-requests');
        break;
      case 'new_event':
      case 'party':
      case 'celebration':
      case 'event':
        navigate('/events');
        break;
      case 'offer':
      case 'special_offer':
      case 'promotion':
        navigate('/store');
        break;
      case 'chat_message':
        // Could trigger chat widget opening here
        break;
      case 'sessions_ending':
        navigate('/store');
        break;
      default:
        // Do nothing for unknown types
        break;
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Ειδοποιήσεις</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Όλα ως αναγνωσμένα
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
{loading ? (
          <DropdownMenuItem disabled>
            <div className="text-center w-full py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Φόρτωση ειδοποιήσεων...</p>
            </div>
          </DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-center w-full py-4">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Δεν έχετε ειδοποιήσεις</p>
            </div>
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 10).map((notification: any) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer border-l-2 ${
                !notification.read_at 
                  ? 'bg-blue-50 border-l-blue-500 hover:bg-blue-100' 
                  : 'border-l-transparent hover:bg-muted/50'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-3 w-full">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium text-sm ${
                      !notification.read_at ? 'font-semibold text-blue-900' : ''
                    }`}>
                      {notification.title}
                    </h4>
                    {!notification.read_at && (
                      <Badge variant="secondary" className="text-xs px-1 bg-blue-200 text-blue-800">
                        Νέο
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), 'dd MMM, HH:mm', { locale: el })}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              +{notifications.length - 10} περισσότερες ειδοποιήσεις
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}