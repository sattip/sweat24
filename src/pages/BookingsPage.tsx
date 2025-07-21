import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Calendar, Clock, MapPin, User, CalendarX, Loader2, X, RefreshCw } from "lucide-react";
import GymRulesModal from "@/components/modals/GymRulesModal";
import PackageAlert from "@/components/notifications/PackageAlert";
import { CancellationModal } from "@/components/modals/CancellationModal";
import { bookingService } from "@/services/apiService";
import { toast } from "sonner";

const BookingsPage = () => {
  const [showRules, setShowRules] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellationModal, setCancellationModal] = useState({
    isOpen: false,
    booking: null as any,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAll();
      // The API returns an array directly, not wrapped in data
      const allBookings = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
      console.log('BookingsPage - All bookings received:', allBookings);
      console.log('BookingsPage - Waitlist bookings:', allBookings.filter(b => b.status === 'waitlist' || b.is_waitlist));
      
      // Filter only future bookings (both confirmed and waitlist)
      const userBookings = allBookings.filter((b: any) => {
        // Handle different date formats
        let bookingDate;
        if (b.date.includes('T')) {
          // Already a full timestamp
          bookingDate = new Date(b.date);
        } else {
          // Combine date and time
          bookingDate = new Date(b.date + ' ' + b.time);
        }
        
        return bookingDate >= new Date();
      });
      
      // Sort by date and time
      userBookings.sort((a: any, b: any) => {
        const dateA = a.date.includes('T') ? new Date(a.date) : new Date(a.date + ' ' + a.time);
        const dateB = b.date.includes('T') ? new Date(b.date) : new Date(b.date + ' ' + b.time);
        return dateA.getTime() - dateB.getTime();
      });
      
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Σφάλμα κατά τη φόρτωση κρατήσεων');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking: any, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    setCancellationModal({
      isOpen: true,
      booking: booking,
    });
  };

  const formatDate = (dateString: string) => {
    // Handle ISO date format by taking only the date part
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    
    // Parse date in local timezone to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Σήμερα";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Αύριο";
    } else {
      const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
      return days[date.getDay()];
    }
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTimeRange = (time: string, duration?: number) => {
    // Handle ISO date format
    if (time.includes('T')) {
      const date = new Date(time);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      time = `${hours}:${minutes}`;
    }
    
    if (!duration) return time;
    
    const [hours, minutes] = time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    return `${time.substring(0, 5)} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
  };

  const canCancelOrReschedule = (booking: any) => {
    // Calculate hours until class
    let classDateTime;
    if (booking.date.includes('T')) {
      classDateTime = new Date(booking.date);
    } else {
      classDateTime = new Date(booking.date + ' ' + booking.time);
    }
    
    const now = new Date();
    const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Can cancel if >= 6 hours, can reschedule if >= 3 hours
    return hoursUntilClass >= 3; // Allow button if either action is possible
  };

  const hasBookings = bookings.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Οι Κρατήσεις μου</h1>
            <p className="text-muted-foreground mt-1">
              {hasBookings 
                ? `Έχετε ${bookings.length} επερχόμενες κρατήσεις`
                : "Δεν έχετε ενεργές κρατήσεις"
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowRules(true)} variant="outline">
              Κανόνες Γυμναστηρίου
            </Button>
          </div>
        </div>
        
        {hasBookings ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className={`hover:border-primary transition-colors ${booking.status === 'waitlist' ? 'border-orange-300 bg-orange-50/50' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <Link to={`/class/${booking.class_id || booking.id}`} className="flex-1">
                      <div className="space-y-2 mb-4 md:mb-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {formatDate(booking.date) === "Σήμερα" && (
                            <Badge className="bg-primary text-primary-foreground">
                              ΣΗΜΕΡΑ
                            </Badge>
                          )}
                          {formatDate(booking.date) === "Αύριο" && (
                            <Badge variant="secondary">
                              ΑΥΡΙΟ
                            </Badge>
                          )}
                          {booking.status === 'waitlist' && (
                            <Badge className="bg-orange-500 text-white font-bold animate-pulse border-2 border-orange-600">
                              🕒 ΛΙΣΤΑ ΑΝΑΜΟΝΗΣ
                            </Badge>
                          )}
                          <h3 className="text-lg font-semibold">{booking.class_name}</h3>
                          <Badge variant="outline">{booking.type}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{formatDate(booking.date)}, {formatFullDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{formatTimeRange(booking.time, 60)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            <span>{booking.instructor}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{booking.location || 'Κύρια Αίθουσα'}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      {canCancelOrReschedule(booking) ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => handleCancelClick(booking, e)}
                          className="hover:border-red-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Ακύρωση/Μετάθεση
                        </Button>
                      ) : (
                        <div className="text-sm text-muted-foreground py-2 px-3 border rounded-md">
                          Δεν επιτρέπεται ακύρωση/μετάθεση
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Δεν έχετε κρατήσεις</h3>
            <p className="text-muted-foreground mb-4">
              Εξερευνήστε το πρόγραμμα μαθημάτων και κάντε την πρώτη σας κράτηση.
            </p>
            <Link to="/schedule">
              <Button>Δείτε το Πρόγραμμα</Button>
            </Link>
          </div>
        )}
      </main>

      {/* Gym Rules Modal */}
      <GymRulesModal 
        open={showRules} 
        onClose={() => setShowRules(false)} 
        onAgree={() => setShowRules(false)}
      />
      
      {/* Cancellation Modal */}
      {cancellationModal.booking && (
        <CancellationModal
          isOpen={cancellationModal.isOpen}
          onClose={() => setCancellationModal({ isOpen: false, booking: null })}
          booking={cancellationModal.booking}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
};

export default BookingsPage;