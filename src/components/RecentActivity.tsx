import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { dashboardApi } from "@/services/apiService";

// Only 4 types of activities as per Issue #7
type ActivityType = 'user_registration' | 'package_purchase' | 'class_booking' | 'class_cancellation';

interface Activity {
  id: number;
  user: { name: string; avatar: string | null; initials: string };
  action: string;
  target: string;
  time: string;
  type: ActivityType;
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `πριν από ${seconds} δευτερόλεπτα`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `πριν από ${minutes} λεπτά`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `πριν από ${hours} ώρες`;
  const days = Math.floor(hours / 24);
  return `πριν από ${days} ημέρες`;
};

const getActivityDisplay = (activity: any): Activity => {
  const user = activity.user || {};
  const name = user.name || 'Άγνωστος Χρήστης';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  
  let action = '';
  let target = '';
  let type: ActivityType = 'user_registration';
  
  switch (activity.type) {
    case 'user_registration':
      action = 'εγγράφηκε';
      target = 'στο γυμναστήριο';
      type = 'user_registration';
      break;
    case 'package_purchase':
      action = 'αγόρασε';
      target = activity.details?.package_name || 'πακέτο';
      type = 'package_purchase';
      break;
    case 'class_booking':
      action = 'κράτησε';
      target = activity.details?.class_name || 'μάθημα';
      type = 'class_booking';
      break;
    case 'class_cancellation':
      action = 'ακύρωσε';
      target = activity.details?.class_name || 'μάθημα';
      type = 'class_cancellation';
      break;
  }
  
  return {
    id: activity.id,
    user: { name, avatar: user.avatar || null, initials },
    action,
    target,
    time: formatTimeAgo(activity.created_at),
    type
  };
};

const getActivityBadgeColor = (type: ActivityType) => {
  switch (type) {
    case "class_booking":
      return "bg-green-100 text-green-800";
    case "class_cancellation":
      return "bg-red-100 text-red-800";
    case "user_registration":
      return "bg-blue-100 text-blue-800";
    case "package_purchase":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecentActivities();
  }, []);
  
  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getAll();
      
      // Process recent activities from API
      if (response.recentActivity && Array.isArray(response.recentActivity)) {
        const formattedActivities = response.recentActivity
          .slice(0, 5) // Show only 5 most recent
          .map((activity: any) => getActivityDisplay(activity));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card
      className="bg-card border border-border rounded-lg shadow-sm"
      data-oid="22b32jh"
    >
      <CardHeader className="p-6" data-oid="7rtl7o6">
        <CardTitle
          className="flex items-center gap-2 text-lg font-semibold text-card-foreground"
          data-oid="80y77xw"
        >
          <Clock className="h-5 w-5 text-primary" data-oid="ereilzk" />
          Πρόσφατη Δραστηριότητα
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0" data-oid="0ql67lu">
        <div className="space-y-4" data-oid="3ucc7:a">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Φόρτωση δραστηριότητας...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Δεν υπάρχει πρόσφατη δραστηριότητα
            </div>
          ) : (
            activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
              data-oid="2em98eq"
            >
              <Avatar className="h-10 w-10" data-oid="5m50rmi">
                <AvatarImage
                  src={activity.user.avatar || undefined}
                  alt={activity.user.name}
                  data-oid="my366q:"
                />

                <AvatarFallback
                  className="bg-primary text-primary-foreground text-sm"
                  data-oid="kqtrss4"
                >
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0" data-oid="8_:uupf">
                <div
                  className="flex items-center gap-2 flex-wrap"
                  data-oid="u1djbh7"
                >
                  <span
                    className="font-medium text-card-foreground"
                    data-oid="08t9jaw"
                  >
                    {activity.user.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                    data-oid="04a157i"
                  >
                    {activity.action}
                  </Badge>
                  <span className="text-sm text-muted-foreground" data-oid="g42ft9d">
                    {activity.target}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1" data-oid="hv5itgd">
                  {activity.time}
                </p>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
