import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, MapPin, User, BarChart, Loader2, Users, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { classService, bookingService, waitlistService, userService, profileService } from "@/services/apiService";
import { CancellationModal } from "@/components/modals/CancellationModal";
import { toast } from "sonner";
import { buildApiUrl } from "@/config/api";

const ClassDetailsPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [classDetails, setClassDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userHasBooking, setUserHasBooking] = useState(false);
  const [userBookingId, setUserBookingId] = useState<number | null>(null);
  const [userBooking, setUserBooking] = useState<any>(null);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [bookingPolicy, setBookingPolicy] = useState<any>(null);


  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch class details
      const classData = await classService.getById(classId!);
      setClassDetails(classData);
      
      
      // Fetch current user
      try {
        const userData = await userService.getCurrentUser();
        setCurrentUser(userData);

        // Check if user already has a booking for this class
        try {
          const userBookings = await bookingService.getUserBookings();
          const existingBooking = userBookings.find((booking: any) =>
            booking.class_id === parseInt(classId!) &&
            booking.status !== 'cancelled' &&
            booking.status !== 'canceled' &&
            booking.status !== 'rejected'
          );

          if (existingBooking) {
            setUserHasBooking(true);
            setUserBookingId(existingBooking.id);
            setUserBooking(existingBooking);

            // Fetch cancellation policy for this booking
            fetchCancellationPolicy(existingBooking.id);
          }
        } catch (err) {
          console.log('Error checking user bookings:', err);
        }

        // Fetch waitlist status if class is full
        if (classData.current_participants >= classData.max_participants) {
          const status = await waitlistService.getStatus(classId!);
          setWaitlistStatus(status);
        }
      } catch (error) {
        // User might not be logged in
        console.log('User not logged in');
      }
    } catch (error) {
      toast.error("Σφάλμα κατά τη φόρτωση λεπτομερειών μαθήματος");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCancellationPolicy = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(
        buildApiUrl(`/bookings/${bookingId}/policy-check`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingPolicy(data);
      }
    } catch (error) {
      console.error('Error fetching cancellation policy:', error);
    }
  };

  const handleBooking = async () => {
    if (!currentUser) {
      toast.error("Πρέπει να συνδεθείτε για να κάνετε κράτηση");
      navigate('/login');
      return;
    }

    // Check active package via profile API
    let canBook = false;
    try {
      const pkgs = await profileService.getActivePackages();
      const today = new Date().toISOString().split('T')[0];
      const active = Array.isArray(pkgs)
        ? pkgs.find((p: any) => p?.status === 'active' && p?.is_frozen === false && (!p?.expiry_date || p.expiry_date > today))
        : null;
      if (active) {
        const rem = active.remaining_sessions;
        canBook = rem === null || rem === undefined || rem > 0;
      }
    } catch {}
    // Fallback to aggregate check only if we didn't detect active package
    if (!canBook) {
      if (currentUser?.remaining_sessions === null || currentUser?.remaining_sessions === undefined || currentUser?.remaining_sessions > 0) {
        canBook = true;
      }
    }
    if (!canBook) {
      toast.error("Δεν έχετε διαθέσιμες συνεδρίες. Παρακαλούμε επικοινωνήστε με τη γραμματεία για να αγοράσετε νέο πακέτο.", { duration: 5000 });
      return;
    }

    setBookingLoading(true);
    try {
      // Create booking - backend will handle waitlist logic automatically
      const bookingData = {
        user_id: currentUser.id,
        customer_name: currentUser.name,
        customer_email: currentUser.email,
        class_id: classDetails.id,
        class_name: classDetails.name,
        instructor: classDetails.instructor?.name || classDetails.trainer_name || classDetails.instructor || 'TBD',
        date: classDetails.date,
        time: classDetails.time,
        type: classDetails.type,
        location: classDetails.location || classDetails.store_name,
        store_id: classDetails.store_id,
      };
      
      const response = await bookingService.create(bookingData);
      
      // Check if the response indicates waitlist
      if (response.waitlist) {
        // User was added to waitlist
        toast.success(response.message || "Μπήκατε στη λίστα αναμονής. Θα ενημερωθείτε αυτόματα αν υπάρξει διαθέσιμη θέση.", {
          duration: 5000,
          style: {
            backgroundColor: '#fff3cd',
            borderColor: '#ffeaa7',
            color: '#856404'
          }
        });
        setWaitlistStatus({
          in_waitlist: true,
          position: response.booking?.position || 1,
          status: 'waiting'
        });
      } else {
        // Normal booking confirmed
        toast.success(`Η θέση σας στο μάθημα "${classDetails.name}" επιβεβαιώθηκε.`);
        
        // Navigate to bookings page after a brief delay
        setTimeout(() => {
          navigate("/bookings");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την κράτηση");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    setBookingLoading(true);
    try {
      await waitlistService.leave(classId!);
      toast.success("Αφαιρεθήκατε από τη λίστα αναμονής");
      setWaitlistStatus({ in_waitlist: false });
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την αφαίρεση από τη λίστα αναμονής");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelClick = () => {
    setCancellationModalOpen(true);
  };

  const handleCancellationSuccess = () => {
    setUserHasBooking(false);
    setUserBookingId(null);
    setUserBooking(null);
    setCancellationModalOpen(false);
    // Refresh class details to update participant count
    fetchData();
  };

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
  
  if (!classDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-6 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Το μάθημα δεν βρέθηκε</h1>
          <Button onClick={() => navigate("/schedule")}>
            Επιστροφή στο Πρόγραμμα
          </Button>
        </div>
      </div>
    );
  }
  
  const isFull = classDetails.current_participants >= classDetails.max_participants;
  const spotsAvailable = classDetails.max_participants - classDetails.current_participants;
  
  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
    const months = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 
                    'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (time: string, duration: number) => {
    // Extract time part if it's a full timestamp
    let timeOnly = time;
    if (time.includes('T')) {
      // It's a full timestamp like "2025-07-15T10:00:00"
      timeOnly = time.split('T')[1].substring(0, 5);
    } else if (time.length > 5) {
      // It might be in another format, take first 5 chars
      timeOnly = time.substring(0, 5);
    }
    
    const [hours, minutes] = timeOnly.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    return `${timeOnly} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/bookings")}
          className="mb-4"
        >
          &larr; Πίσω στις Κρατήσεις
        </Button>
        
        {/* Class Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{classDetails.name}</h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1">
              {classDetails.type}
            </span>
            {classDetails.status === 'active' && (
              <span className="bg-green-100 text-green-800 rounded-full px-3 py-1">
                Ενεργό
              </span>
            )}
            {isFull && (
              <span className="bg-red-100 text-red-800 rounded-full px-3 py-1">
                Πλήρες
              </span>
            )}
          </div>
        </div>
        
        {/* Full Class Warning */}
        {isFull && !waitlistStatus?.in_waitlist && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Το μάθημα είναι πλήρες!</strong> Κάνοντας κράτηση θα μπείτε στη λίστα αναμονής. 
              Θα ενημερωθείτε αυτόματα αν υπάρξει διαθέσιμη θέση.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Class Details Card */}
        <Card className="mb-6">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center">
              <Calendar className="text-primary h-5 w-5 mr-3" />
              <div>
                <p className="font-medium">{formatDate(classDetails.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="text-primary h-5 w-5 mr-3" />
              <div>
                <p className="font-medium">{formatTime(classDetails.time, classDetails.duration)}</p>
                <p className="text-sm text-muted-foreground">{classDetails.duration} λεπτά</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="text-primary h-5 w-5 mr-3" />
              <p className="font-medium">{classDetails.location || 'Κύρια Αίθουσα'}</p>
            </div>
            
            <div className="flex items-center">
              <User className="text-primary h-5 w-5 mr-3" />
              <p className="font-medium">{classDetails.instructor?.name || 'TBD'}</p>
            </div>
            
            <div className="flex items-center">
              <Users className="text-primary h-5 w-5 mr-3" />
              <div>
                <p className="font-medium">
                  {classDetails.current_participants}/{classDetails.max_participants} συμμετέχοντες
                </p>
                {!isFull && (
                  <p className="text-sm text-muted-foreground">
                    {spotsAvailable} {spotsAvailable === 1 ? 'θέση διαθέσιμη' : 'θέσεις διαθέσιμες'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Class Description */}
        {classDetails.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Σχετικά με αυτό το μάθημα</h2>
            <p className="text-muted-foreground">{classDetails.description}</p>
          </div>
        )}
        
        {/* Waitlist Status */}
        {waitlistStatus?.in_waitlist && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-800">
                    Είστε στη λίστα αναμονής
                  </p>
                  <p className="text-sm text-orange-600">
                    Θέση #{waitlistStatus.position} στη λίστα
                  </p>
                  {waitlistStatus.status === 'notified' && (
                    <p className="text-sm text-orange-600 mt-1">
                      Έχετε ειδοποιηθεί! Παρακαλώ επιβεβαιώστε τη θέση σας.
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeaveWaitlist}
                  disabled={bookingLoading}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Αποχώρηση από λίστα
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Cancellation Policy Notice */}
        {userHasBooking && bookingPolicy ? (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="w-full">
                  <h3 className="font-semibold text-blue-800 mb-3">Πολιτική Ακύρωσης & Μετάθεσης για την Κράτησή σας</h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex justify-between items-center">
                      <span>Ακύρωση:</span>
                      <span className="font-medium">
                        Τουλάχιστον {bookingPolicy?.policy?.hours_before || 'N/A'} ώρες πριν
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Μετάθεση:</span>
                      <span className="font-medium">
                        Τουλάχιστον {bookingPolicy?.policy?.reschedule_hours_before || 'N/A'} ώρες πριν
                      </span>
                    </div>
                    {bookingPolicy?.policy?.penalty_percentage > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Χρέωση καθυστερημένης ακύρωσης:</span>
                        <span className="font-medium">{bookingPolicy.policy.penalty_percentage}%</span>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-blue-300">
                      <div className="flex justify-between items-center font-medium">
                        <span>Χρόνος μέχρι το μάθημα:</span>
                        <span className="text-blue-900">
                          {bookingPolicy?.hours_until_class ?
                            `${Math.floor(bookingPolicy.hours_until_class)} ώρες` :
                            'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !userHasBooking ? (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Πολιτική Ακύρωσης & Μετάθεσης</h3>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>Κάθε μάθημα έχει τη δική του πολιτική ακύρωσης και μετάθεσης.</p>
                    <p className="text-xs text-blue-600 mt-2">
                      Οι λεπτομερείς κανόνες θα εμφανιστούν όταν προβείτε σε κράτηση.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Action Button */}
        {!waitlistStatus?.in_waitlist && !userHasBooking && (
          <div className="mt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <Button
              className="w-full"
              size="lg"
              onClick={handleBooking}
              disabled={bookingLoading}
            >
              {bookingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Κράτηση Θέσης
            </Button>
            {isFull && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Το μάθημα είναι πλήρες. Θα μπείτε στη λίστα αναμονής.
              </p>
            )}
          </div>
        )}

        {/* Already Booked - Show Cancel/Reschedule Button */}
        {userHasBooking && (
          <div className="mt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={handleCancelClick}
            >
              Ακύρωση/Μετάθεση
            </Button>
          </div>
        )}
      </main>

      {/* Cancellation Modal */}
      {userBooking && (
        <CancellationModal
          isOpen={cancellationModalOpen}
          onClose={() => setCancellationModalOpen(false)}
          booking={userBooking}
          onSuccess={handleCancellationSuccess}
        />
      )}
    </div>
  );
};

export default ClassDetailsPage;