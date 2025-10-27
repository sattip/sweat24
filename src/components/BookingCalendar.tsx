import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { el } from 'date-fns/locale';
import { bookingService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Booking {
  id: number;
  class_id: number;
  class_name: string;
  date: string;
  time: string;
  instructor_name?: string;
  instructor?: string;
  status: string;
  checked_in?: boolean;
  attended?: boolean;
  is_waitlist?: boolean;
}

export const BookingCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();

      // Set up polling every 30 seconds for calendar bookings updates
      const pollingInterval = setInterval(() => {
        fetchBookings();
      }, 30000); // 30 seconds

      // Cleanup interval on unmount
      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [user, currentMonth]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [futureBookings, pastBookings] = await Promise.all([
        bookingService.getUserBookings(),
        bookingService.getUserPastBookings()
      ]);
      
      // Ensure we have arrays and combine them
      const futureArray = Array.isArray(futureBookings) ? futureBookings : [];
      const pastArray = Array.isArray(pastBookings) ? pastBookings : [];
      const allBookings = [...futureArray, ...pastArray];
      setBookings(allBookings);
    } catch (error) {
      // Silently handle errors - just show empty state
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.date), date)
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Το Ημερολόγιό μου
        </CardTitle>
        <CardDescription>Δες όλες τις κρατήσεις σου σε μια ματιά</CardDescription>
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: el })}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Φόρτωση ημερολογίου...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border rounded-lg overflow-hidden">
              {/* Day headers */}
              {['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ'].map((day, i) => (
                <div key={i} className="p-2 text-center text-sm font-medium bg-muted">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day, i) => {
                const dayBookings = getBookingsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasBookings = dayBookings.length > 0;
                
                return (
                  <div
                    key={i}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "relative p-2 h-20 border cursor-pointer transition-colors",
                      !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                      isToday(day) && "bg-primary/10",
                      isSelected && "bg-primary/20 ring-2 ring-primary",
                      hasBookings && "font-semibold"
                    )}
                  >
                    <div className="text-sm">{format(day, 'd')}</div>
                    {hasBookings && (
                      <div className="mt-1 space-y-1">
                        {dayBookings.slice(0, 2).map((booking, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate",
                              booking.checked_in || booking.attended === true ? "bg-green-100 text-green-700" : 
                              booking.attended === false ? "bg-red-100 text-red-700" :
                              (booking.is_waitlist || booking.status === 'waitlist') ? "bg-orange-200 text-orange-800 border-2 border-orange-500 font-bold" :
                              "bg-primary/20 text-primary"
                            )}
                          >
                            {booking.time ? booking.time.substring(0, 5) : format(new Date(booking.date), 'HH:mm')}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayBookings.length - 2} ακόμη
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">
                  {format(selectedDate, 'EEEE, d MMMM', { locale: el })}
                </h4>
                {selectedDateBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Δεν υπάρχουν κρατήσεις για αυτή την ημέρα</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{booking.class_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{booking.time ? booking.time.substring(0, 5) : format(new Date(booking.date), 'HH:mm')}</span>
                              <span>•</span>
                              <span>{booking.instructor_name || booking.instructor}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={
                          booking.checked_in || booking.attended === true ? "success" : 
                          booking.attended === false ? "destructive" :
                          (booking.is_waitlist || booking.status === 'waitlist') ? "warning" : 
                          "secondary"
                        } className={(booking.is_waitlist || booking.status === 'waitlist') ? "bg-orange-500 text-white font-bold animate-pulse" : ""}>
                          {booking.checked_in || booking.attended === true ? "Ολοκληρώθηκε" : 
                           booking.attended === false ? "Δεν παρευρέθηκε" :
                           (booking.is_waitlist || booking.status === 'waitlist') ? "🕒 ΛΙΣΤΑ ΑΝΑΜΟΝΗΣ" :
                           "Προγραμματισμένο"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-primary/20 rounded"></div>
                <span>Επιβεβαιωμένη</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-orange-500 border-2 border-orange-600 rounded animate-pulse"></div>
                <span className="font-bold text-orange-700">🕒 Λίστα Αναμονής</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Παρευρέθηκε</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span>Δεν παρευρέθηκε</span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {bookings.filter(b => new Date(b.date) >= new Date() && !b.checked_in).length}
                </p>
                <p className="text-sm text-muted-foreground">Επερχόμενες</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.checked_in || b.attended === true).length}
                </p>
                <p className="text-sm text-muted-foreground">Παρευρέθηκε</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {bookings.filter(b => {
                    const bookingDate = new Date(b.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Reset time to start of day
                    
                    // Only count as "not attended" if:
                    // 1. Explicitly marked as not attended (attended === false)
                    // 2. OR booking was in the past and not checked in/attended
                    return b.attended === false || 
                           (!b.checked_in && b.attended !== true && bookingDate < today);
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Δεν παρευρέθηκε</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};