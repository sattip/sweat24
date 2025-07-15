import { Bell, Package, CheckCircle } from "lucide-react";
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
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_ready':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate to orders page for order notifications
    if (notification.notification?.type === 'order_ready') {
      navigate('/orders');
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
        
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-center w-full py-4">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Δεν έχετε ειδοποιήσεις</p>
            </div>
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 10).map((recipient: any) => (
            <DropdownMenuItem
              key={recipient.id}
              className={`flex flex-col items-start p-3 cursor-pointer ${
                !recipient.read_at ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleNotificationClick(recipient)}
            >
              <div className="flex gap-3 w-full">
                <div className="flex-shrink-0">
                  {getNotificationIcon(recipient.notification?.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium text-sm ${
                      !recipient.read_at ? 'font-semibold' : ''
                    }`}>
                      {recipient.notification?.title}
                    </h4>
                    {!recipient.read_at && (
                      <Badge variant="secondary" className="text-xs px-1">
                        Νέο
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipient.notification?.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(recipient.delivered_at || recipient.created_at), 'dd MMM, HH:mm', { locale: el })}
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