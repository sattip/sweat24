import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WaitlistStatusBadgeProps {
  status: 'waiting' | 'notified' | 'expired';
  position?: number | null;
  className?: string;
}

export function WaitlistStatusBadge({ status, position, className = '' }: WaitlistStatusBadgeProps) {
  switch (status) {
    case 'waiting':
      return (
        <Badge variant="secondary" className={`bg-blue-100 text-blue-800 ${className}`}>
          <Clock className="h-3 w-3 mr-1" />
          Αναμονή #{position}
        </Badge>
      );
    case 'notified':
      return (
        <Badge variant="default" className={`bg-orange-100 text-orange-800 border-orange-300 ${className}`}>
          <AlertCircle className="h-3 w-3 mr-1" />
          Ειδοποίηση
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="outline" className={`opacity-50 ${className}`}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Έληξε
        </Badge>
      );
    default:
      return null;
  }
}
