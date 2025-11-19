import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
  className?: string;
}

export function CountdownTimer({ expiresAt, onExpired, className = '' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining(`${hours}ω ${minutes}λ ${seconds}δ`);
        setIsExpired(false);
      } else {
        setTimeRemaining('Έληξε');
        setIsExpired(true);
        if (onExpired) {
          onExpired();
        }
      }
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  return (
    <div className={`flex items-center gap-2 ${isExpired ? 'text-red-600' : 'text-orange-600'} ${className}`}>
      <Clock className="h-4 w-4" />
      <span className="font-medium">{timeRemaining}</span>
    </div>
  );
}
