import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Calendar, Clock, MapPin, User, CalendarX, Loader2, X, RefreshCw, Dumbbell, CheckCircle, XCircle, Plus, Users } from "lucide-react";
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
import MuscleGroupDialog from "@/components/workouts/MuscleGroupDialog";
import { bookingService } from "@/services/apiService";
import { toast } from "sonner";
import { BookingWizard } from "@/components/BookingWizard";
import { waitlistApi, type WaitlistEntry } from "@/services/waitlistApi";
import { WaitlistStatusBadge } from "@/components/WaitlistStatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";

// Define types for workout data
interface Workout {
  id: number;
  class_name: string;
  date: string;
  time: string;
  instructor: string;
  type: string;
  attended: boolean | number;
  muscle_groups?: string[] | null;
  muscle_groups_recorded?: boolean;
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
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);

  // Waitlist state
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // History state
  const [filter, setFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [muscleGroupDialogOpen, setMuscleGroupDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchWorkoutHistory();
    fetchWaitlists();

    // Set up polling every 25 seconds for real-time booking and waitlist updates
    const pollingInterval = setInterval(() => {
      console.log('🔄 Polling for booking and waitlist updates...');
      fetchBookings();
      fetchWaitlists();
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

      // Get current user ID
      const userStr = localStorage.getItem('sweat93_user');
      const currentUserId = userStr ? JSON.parse(userStr).id : null;
      console.log('BookingsPage - Current user ID:', currentUserId);

      // Filter only future bookings for current user (both confirmed and waitlist)
      const userBookings = allBookings.filter((b: any) => {
        // First filter: must be current user's booking
        if (currentUserId && b.user_id !== currentUserId) {
          return false;
        }

        // Second filter: must be future booking
        // Handle different date formats
        if (!b.date) {
          console.warn('Booking missing date:', b);
          return false;
        }

        let bookingDate;
        try {
          if (b.date.includes('T')) {
            // Already a full timestamp
            bookingDate = new Date(b.date);
          } else {
            // Combine date and time
            bookingDate = new Date(b.date + ' ' + b.time);
          }

          const isFuture = bookingDate >= new Date();
          console.log('Booking date check:', {
            id: b.id,
            class_name: b.class_name,
            date: b.date,
            time: b.time,
            bookingDate: bookingDate.toISOString(),
            now: new Date().toISOString(),
            isFuture
          });

          return isFuture;
        } catch (error) {
          console.error('Error parsing booking date:', b, error);
          return false;
        }
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
      console.log('Setting bookings state with:', userBookings.length, 'bookings');
      console.log('userBookings:', userBookings);
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

  const fetchWaitlists = async () => {
    try {
      setWaitlistLoading(true);
      console.log('Fetching waitlist entries...');
      const response = await waitlistApi.getMyWaitlists();
      console.log('Waitlist entries received:', response.data);
      setWaitlistEntries(response.data || []);

      // Check for newly notified waitlist entries
      response.data?.forEach((entry: WaitlistEntry) => {
        if (entry.status === 'notified') {
          toast.success(`🎉 Διαθέσιμη θέση στο μάθημα!`, {
            description: `Μια θέση ελευθερώθηκε στο ${entry.class.name}. Έχετε 2 ώρες για επιβεβαίωση.`,
            duration: 10000,
          });
        }
      });
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      // Don't show error toast on every poll, only log it
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async (classId: number) => {
    try {
      await waitlistApi.leave(classId);
      toast.success('Αφαιρεθήκατε από τη λίστα αναμονής');
      fetchWaitlists(); // Refresh waitlist
    } catch (error: any) {
      toast.error(error.message || 'Αποτυχία αφαίρεσης από τη λίστα αναμονής');
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

  console.log('Render - bookings state:', bookings.length, 'hasBookings:', hasBookings);
  console.log('Render - bookings array:', bookings);
  
  const filteredWorkouts = workouts.filter(workout => {
    // Type filter
    let typeMatch = true;
    if (filter !== "all") {
      if (filter === "yoga") typeMatch = workout.type.toLowerCase().includes("yoga");
      else if (filter === "hiit") typeMatch = workout.type.toLowerCase().includes("hiit");
      else if (filter === "strength") typeMatch = workout.type.toLowerCase().includes("strength");
    }

    // Attendance filter
    let attendanceMatch = true;
    if (attendanceFilter === "attended") {
      attendanceMatch = workout.attended === true || workout.attended === 1;
    } else if (attendanceFilter === "missed") {
      attendanceMatch = workout.attended === false || workout.attended === 0;
    }

    return typeMatch && attendanceMatch;
  });
  
  const groupedWorkouts = groupWorkoutsByMonth(filteredWorkouts);
  const totalWorkouts = filteredWorkouts.length;
  const totalMinutes = filteredWorkouts.length * 60; // Assume 60 minutes per workout
  
  const handleOpenRatingDialog = (workout: Workout) => {
    setSelectedWorkout(workout);
    setRatingDialogOpen(true);
  };

  const handleOpenMuscleGroupDialog = (workout: Workout) => {
    setSelectedWorkout(workout);
    setMuscleGroupDialogOpen(true);
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
            <Button size="sm" onClick={() => setBookingWizardOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              Νέα Κράτηση
            </Button>
            <Button size="sm" onClick={() => setShowRules(true)} variant="outline">
              Κανόνες Γυμναστηρίου
            </Button>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">
              Επερχόμενες Κρατήσεις
            </TabsTrigger>
            <TabsTrigger value="waitlist">
              <Users className="h-4 w-4 mr-1" />
              Λίστα Αναμονής ({waitlistEntries.length})
            </TabsTrigger>
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
                <Link to="/schedule">
                  <Button>Δείτε το Πρόγραμμα</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="waitlist" className="mt-6">
            {waitlistEntries.length > 0 ? (
              <div className="space-y-4">
                {waitlistEntries.map((entry) => (
                  <Card key={entry.waitlist_id} className="hover:border-orange-500 transition-colors border-orange-200 bg-orange-50/30">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{entry.class.name}</h3>
                            <WaitlistStatusBadge status={entry.status} position={entry.position} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>{new Date(entry.class.date).toLocaleDateString('el-GR')}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>{entry.class.time}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              <span>{entry.class.instructor}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>{entry.class.location}</span>
                            </div>
                          </div>

                          {entry.status === 'notified' && entry.expires_at && (
                            <div className="flex items-center gap-2 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-orange-900">
                                  🎉 Μια θέση ελευθερώθηκε! Η κράτησή σας επιβεβαιώθηκε αυτόματα.
                                </p>
                                <p className="text-xs text-orange-700 mt-1">
                                  Λήγει σε:
                                </p>
                                <CountdownTimer expiresAt={entry.expires_at} className="mt-1" />
                              </div>
                            </div>
                          )}

                          {entry.status === 'waiting' && (
                            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              Θα ειδοποιηθείτε όταν ελευθερωθεί μια θέση
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveWaitlist(entry.class.id)}
                            className="hover:border-red-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Αφαίρεση
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium mb-1">Δεν είστε σε καμία λίστα αναμονής</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Όταν ένα μάθημα είναι πλήρες, μπορείτε να προστεθείτε στη λίστα αναμονής
                </p>
                <Button onClick={() => setBookingWizardOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Κλείσε Μάθημα
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3">Ιστορικό Προπονήσεων</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Φίλτρο τύπου" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Όλοι οι Τύποι</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Φίλτρο παρουσίας" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Όλες οι Προπονήσεις</SelectItem>
                    <SelectItem value="attended">Με Παρουσία</SelectItem>
                    <SelectItem value="missed">Με Απουσία</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                              <div className="space-y-3">
                                {/* Row 1: Title, Category, Attendance Icon */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="bg-muted text-xs font-medium rounded-full px-2 py-1">
                                      {workout.type}
                                    </span>
                                    <h4 className="font-semibold text-base">{workout.class_name}</h4>
                                  </div>
                                  {(workout.attended === true || workout.attended === 1) ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                                  )}
                                </div>

                                {/* Row 2: Date and Time */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(workout.date).toLocaleDateString('el-GR')}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{workout.time}</span>
                                  </div>
                                </div>

                                {/* Row 3: Instructor */}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <User className="h-4 w-4" />
                                  <span>{workout.instructor}</span>
                                </div>

                                {/* Row 4: Action Buttons */}
                                {(workout.attended === true || workout.attended === 1) && (
                                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                                    <Button
                                      size="sm"
                                      variant={workout.muscle_groups_recorded ? "default" : "outline"}
                                      onClick={() => handleOpenMuscleGroupDialog(workout)}
                                      className="flex-1 sm:flex-none"
                                    >
                                      {workout.muscle_groups_recorded ? (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Μυϊκές ομάδες
                                        </>
                                      ) : (
                                        "Καταγραφή μυϊκών"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenRatingDialog(workout)}
                                      className="flex-1 sm:flex-none"
                                    >
                                      Αξιολόγηση
                                    </Button>
                                  </div>
                                )}
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
                <Link to="/schedule">
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

      {/* Muscle Group Dialog */}
      <MuscleGroupDialog
        open={muscleGroupDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMuscleGroupDialogOpen(false);
            // Refresh workout history when dialog closes
            fetchWorkoutHistory();
          }
        }}
        workout={selectedWorkout ? { id: selectedWorkout.id, class_name: selectedWorkout.class_name, date: selectedWorkout.date } : null}
      />

      {/* Booking Wizard */}
      <BookingWizard
        isOpen={bookingWizardOpen}
        onClose={() => {
          setBookingWizardOpen(false);
          // Refresh bookings when wizard closes
          fetchBookings();
        }}
      />
    </div>
  );
};

export default BookingsPage;