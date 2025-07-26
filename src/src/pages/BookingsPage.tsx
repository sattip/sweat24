import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Calendar, Clock, MapPin, User, CalendarX, Loader2, X, RefreshCw, Dumbbell, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GymRulesModal from "@/components/modals/GymRulesModal";
import PackageAlert from "@/components/notifications/PackageAlert";
import { CancellationModal } from "@/components/modals/CancellationModal";
import RateWorkoutDialog from "@/components/workouts/RateWorkoutDialog";
import { bookingService } from "@/services/apiService";
import { toast } from "sonner";

// Define types for workout data
interface Workout {
  id: number;
  class_name: string;
  date: string;
  time: string;
  instructor: string;
  type: string;
  attended: boolean | number;
}

// Function to group workouts by month
const groupWorkoutsByMonth = (workouts: Workout[]) => {
  const grouped: { [key: string]: Workout[] } = {};
  
  workouts.forEach((workout) => {
    const date = new Date(workout.date);
    const monthYear = date.toLocaleDateString('el-GR', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(workout);
  });
  
  return grouped;
};

const BookingsPage = () => {
  const [showRules, setShowRules] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellationModal, setCancellationModal] = useState({
    isOpen: false,
    booking: null as any,
  });
  const [previousBookings, setPreviousBookings] = useState<any[]>([]);
  
  // History state
  const [filter, setFilter] = useState("all");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchWorkoutHistory();
    
    // Set up polling every 25 seconds for real-time booking updates
    const pollingInterval = setInterval(() => {
      console.log('🔄 Polling for booking updates...');
      fetchBookings();
    }, 25000); // 25 seconds

    // Cleanup interval on unmount
    return () => {
      console.log('🛑 Stopping booking polling');
      clearInterval(pollingInterval);
    };
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAll();
      // The API returns an array directly, not wrapped in data
      const allBookings = Array.isArray(response) ? response : (response && Array.isArray((response as any).data) ? (response as any).data : []);
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
      
      // Check for status changes if we have previous bookings
      if (previousBookings.length > 0) {
        userBookings.forEach((newBooking: any) => {
          const previousBooking = previousBookings.find(p => p.id === newBooking.id);
          if (previousBooking) {
            // Check for waitlist to confirmed transition
            const wasWaitlist = previousBooking.status === 'waitlist' || previousBooking.is_waitlist;
            const isNowConfirmed = newBooking.status === 'confirmed' || (!newBooking.is_waitlist && newBooking.status !== 'waitlist');
            
            if (wasWaitlist && isNowConfirmed) {
              // Status changed from waitlist to confirmed - show notification
              toast.success(`🎉 Η κράτησή σας στο "${newBooking.class_name}" επιβεβαιώθηκε!`, {
                duration: 5000,
                description: `${newBooking.date} στις ${newBooking.time}`,
                action: {
                  label: 'Δες Κρατήσεις',
                  onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              });
            }
          }
        });
      }
      
      // Update previous bookings for next comparison
      setPreviousBookings([...userBookings]);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Σφάλμα κατά τη φόρτωση κρατήσεων');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutHistory = async () => {
    try {
      setHistoryLoading(true);
      console.log('Fetching workout history...');
      const data = await bookingService.getUserPastBookings();
      console.log('Received data:', data);
      const workoutsArray = Array.isArray(data) ? data : [];
      console.log('Data length:', workoutsArray.length);
      setWorkouts(workoutsArray);
    } catch (error) {
      console.error('Error fetching workout history:', error);
      toast.error('Σφάλμα κατά τη φόρτωση του ιστορικού προπονήσεων');
    } finally {
      setHistoryLoading(false);
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
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Σήμερα";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Αύριο";
    } else {
      return date.toLocaleDateString('el-GR', { 
        weekday: 'short'
      });
    }
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTimeRange = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0);
    
    const end = new Date(start.getTime() + durationMinutes * 60000);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('el-GR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const canCancelOrReschedule = (booking: any) => {
    const bookingDate = new Date(booking.date + ' ' + booking.time);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilBooking >= 2;
  };

  const hasBookings = bookings.length > 0;
  const hasWorkouts = workouts.length > 0;
  
  const filteredWorkouts = workouts.filter(workout => {
    if (filter === "all") return true;
    if (filter === "yoga") return workout.type.toLowerCase().includes("yoga");
    if (filter === "hiit") return workout.type.toLowerCase().includes("hiit");
    if (filter === "strength") return workout.type.toLowerCase().includes("strength");
    return true;
  });
  
  const groupedWorkouts = groupWorkoutsByMonth(filteredWorkouts);
  const totalWorkouts = filteredWorkouts.length;
  const totalMinutes = filteredWorkouts.length * 60; // Assume 60 minutes per workout
  
  const handleOpenRatingDialog = (workout: Workout) => {
    setSelectedWorkout(workout);
    setRatingDialogOpen(true);
  };

  if (loading && historyLoading) {
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
      
      <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Οι Κρατήσεις μου</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Διαχειριστείτε τις επερχόμενες κρατήσεις και δείτε το ιστορικό προπονήσεών σας
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowRules(true)} variant="outline">
              Κανόνες Γυμναστηρίου
            </Button>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings">Επερχόμενες Κρατήσεις</TabsTrigger>
            <TabsTrigger value="history">Ιστορικό Προπονήσεων</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings" className="mt-6">
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
                <Link to="/classes">
                  <Button>Δείτε το Πρόγραμμα</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Ιστορικό Προπονήσεων</h2>
              
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Φίλτρο τύπου" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες οι Προπονήσεις</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {historyLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-pulse text-lg">Φόρτωση ιστορικού προπονήσεων...</div>
              </div>
            ) : hasWorkouts ? (
              <>
                {/* Stats Summary */}
                <Card className="mb-6">
                  <CardContent className="p-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
                        <Dumbbell className="h-8 w-8 text-primary mb-2" />
                        <p className="text-2xl font-bold">{totalWorkouts}</p>
                        <p className="text-sm text-muted-foreground">Συνολικές Προπονήσεις</p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
                        <Clock className="h-8 w-8 text-primary mb-2" />
                        <p className="text-2xl font-bold">{totalMinutes}</p>
                        <p className="text-sm text-muted-foreground">Συνολικά Λεπτά</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Workout List */}
                <div className="space-y-6">
                  {Object.entries(groupedWorkouts).map(([monthYear, workouts]) => (
                    <div key={monthYear}>
                      <h3 className="text-lg font-semibold mb-3 text-muted-foreground">{monthYear}</h3>
                      <div className="space-y-3">
                        {workouts.map((workout) => (
                          <Card key={workout.id} className="transition-colors">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <span className="bg-muted text-xs font-medium rounded-full px-2 py-1 mr-2">
                                      {workout.type}
                                    </span>
                                    <h4 className="font-medium text-base">{workout.class_name}</h4>
                                    {(workout.attended === true || workout.attended === 1) ? (
                                      <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-red-600 ml-2" />
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-y-1">
                                    <div className="flex items-center mr-4">
                                      <Calendar className="h-4 w-4 mr-1 text-primary" />
                                      {new Date(workout.date).toLocaleDateString('el-GR')}
                                    </div>
                                    <div className="flex items-center mr-4">
                                      <Clock className="h-4 w-4 mr-1 text-primary" />
                                      {workout.time}
                                    </div>
                                    <div className="flex items-center mr-4">
                                      <User className="h-4 w-4 mr-1 text-primary" />
                                      {workout.instructor}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${
                                    (workout.attended === true || workout.attended === 1) ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {(workout.attended === true || workout.attended === 1) ? 'Παρουσία' : 'Απουσία'}
                                  </span>
                                  {(workout.attended === true || workout.attended === 1) && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleOpenRatingDialog(workout)}
                                    >
                                      Αξιολόγηση
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Empty state
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted/40 rounded-full p-6 mb-4">
                  <Dumbbell className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Δεν υπάρχει ιστορικό προπονήσεων</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Το ιστορικό προπονήσεών σας είναι άδειο. Ώρα να ξεκινήσετε!
                </p>
                <Link to="/classes">
                  <Button>Κλείστε ένα Μάθημα</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
      
      {/* Rating Dialog */}
      <RateWorkoutDialog 
        open={ratingDialogOpen} 
        onOpenChange={setRatingDialogOpen} 
        workout={selectedWorkout ? { id: selectedWorkout.id, name: selectedWorkout.class_name, date: selectedWorkout.date } : null}
      />
    </div>
  );
};

export default BookingsPage;