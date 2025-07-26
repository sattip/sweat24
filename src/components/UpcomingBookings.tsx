import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { bookingService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Booking {
  id: number;
  class_id: number;
  class_name: string;
  date: string;
  time: string;
  instructor_name: string;
  status: string;
  checked_in: boolean;
  is_waitlist?: boolean;
  location?: string;
  capacity?: number;
  booked?: number;
}

export const UpcomingBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUpcomingBookings();
      
      // Set up polling every 30 seconds for upcoming bookings updates
      const pollingInterval = setInterval(() => {
        console.log('🔄 Polling for upcoming bookings updates...');
        fetchUpcomingBookings();
      }, 30000); // 30 seconds

      // Cleanup interval on unmount
      return () => {
        console.log('🛑 Stopping upcoming bookings polling');
        clearInterval(pollingInterval);
      };
    }
  }, [user]);

  const fetchUpcomingBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await bookingService.getUserBookings();
      // Ensure we have an array and filter for upcoming bookings only
      const bookingsArray = Array.isArray(allBookings) ? allBookings : [];
      const upcoming = bookingsArray
        .filter(b => new Date(b.date) >= new Date() && !b.checked_in)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Show only next 3 bookings
      setBookings(upcoming);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Σφάλμα κατά τη φόρτωση των κρατήσεων');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await bookingService.cancel(bookingId);
      toast.success('Η κράτηση ακυρώθηκε επιτυχώς');
      fetchUpcomingBookings();
    } catch (error) {
      toast.error('Σφάλμα κατά την ακύρωση της κράτησης');
    }
  };

  const isWithin6Hours = (date: string) => {
    const bookingDate = new Date(date);
    const now = new Date();
    const hoursDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 6;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Επόμενες Κρατήσεις
            </CardTitle>
            <CardDescription>Οι προσεχείς προπονήσεις σου</CardDescription>
          </div>
          <Link to="/bookings">
            <Button variant="ghost" size="sm">
              Όλες
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Φόρτωση κρατήσεων...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Δεν έχεις προγραμματισμένες κρατήσεις</p>
            <Link to="/classes">
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Κλείσε Μάθημα
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const canCancel = !isWithin6Hours(booking.date);
              
              return (
                <div key={booking.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{booking.class_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.date), 'EEEE, d MMM', { locale: el })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.time ? booking.time.substring(0, 5) : format(new Date(booking.date), 'HH:mm')}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.instructor_name}
                        </div>
                        {booking.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={booking.is_waitlist ? "warning" : "secondary"}>
                        {booking.is_waitlist ? "Λίστα Αναμονής" : "Επιβεβαιωμένη"}
                      </Badge>
                      {canCancel ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Ακύρωση
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Μη ακυρώσιμη
                        </span>
                      )}
                    </div>
                  </div>
                  {booking.capacity && booking.booked && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Συμμετοχές</span>
                        <span className="font-medium">{booking.booked}/{booking.capacity}</span>
                      </div>
                      <div className="mt-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(booking.booked / booking.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};