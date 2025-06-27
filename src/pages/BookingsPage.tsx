
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Calendar, Clock, MapPin, User, CalendarX, AlertCircle, CheckCircle2 } from "lucide-react";
import GymRulesModal from "@/components/modals/GymRulesModal";
import PackageAlert from "@/components/notifications/PackageAlert";
import PushNotificationSample from "@/components/notifications/PushNotificationSample";
import { classesService } from "@/services/classesService";
import { packagesService } from "@/services/packagesService";
import { toast } from "sonner";

const BookingsPage = () => {
  const queryClient = useQueryClient();
  
  // State for gym rules modal
  const [showRules, setShowRules] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch user bookings
  const { 
    data: bookings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: () => classesService.getUserBookings(),
  });

  // Fetch current package for alerts
  const { data: currentPackage } = useQuery({
    queryKey: ['current-package'],
    queryFn: () => packagesService.getCurrentPackage(),
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) => classesService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Η κράτηση ακυρώθηκε επιτυχώς');
    },
    onError: (error) => {
      toast.error('Αποτυχία ακύρωσης κράτησης: ' + (error instanceof Error ? error.message : 'Άγνωστο σφάλμα'));
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (bookingId: number) => classesService.checkInToClass(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Check-in επιτυχές!');
    },
    onError: (error) => {
      toast.error('Αποτυχία check-in: ' + (error instanceof Error ? error.message : 'Άγνωστο σφάλμα'));
    },
  });

  const hasBookings = bookings && bookings.length > 0;
  const packageStatus = currentPackage ? 
    packagesService.getPackageStatus(currentPackage) : 'normal';

  // Function to handle agreeing to gym rules
  const handleAgreeToRules = () => {
    setShowRules(false);
    toast.success("Ευχαριστούμε που συμφωνήσατε με τους κανόνες του γυμναστηρίου μας!");
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Οι Κρατήσεις μου</h1>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Αποτυχία φόρτωσης κρατήσεων: {error instanceof Error ? error.message : 'Άγνωστο σφάλμα'}
            </AlertDescription>
          </Alert>
        )}

        {/* Package alerts based on status */}
        {currentPackage && packageStatus === "last-session" && (
          <PackageAlert type="last-session" />
        )}
        {currentPackage && packageStatus === "expiring-soon" && (
          <PackageAlert 
            type="expiring-soon" 
            daysRemaining={packagesService.getDaysRemaining(currentPackage.end_date)} 
          />
        )}
        {packageStatus === "expired" && (
          <PackageAlert type="expired" />
        )}

        {/* Demo controls */}
        <div className="mb-6 p-4 bg-muted/20 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Δοκιμαστικά Κοντρόλ</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setShowRules(!showRules)}>
              Εμφάνιση Κανόνων Γυμναστηρίου
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowNotification(!showNotification)} 
              variant="outline"
            >
              {showNotification ? "Απόκρυψη" : "Εμφάνιση"} Δείγματος Ειδοποίησης
            </Button>
          </div>
        </div>

        {/* Push notification sample */}
        {showNotification && (
          <PushNotificationSample type="booking" />
        )}
        
        {!isLoading && hasBookings ? (
          <div className="space-y-4">
            {bookings!.map((booking) => {
              const bookingDate = new Date(booking.booking_date);
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const isToday = bookingDate.toDateString() === today.toDateString();
              const isTomorrow = bookingDate.toDateString() === tomorrow.toDateString();
              
              const getStatusBadge = (status: string) => {
                switch (status) {
                  case 'confirmed':
                    return <Badge variant="default">Επιβεβαιωμένη</Badge>;
                  case 'completed':
                    return <Badge variant="secondary">Ολοκληρωμένη</Badge>;
                  case 'cancelled':
                    return <Badge variant="destructive">Ακυρωμένη</Badge>;
                  case 'no_show':
                    return <Badge variant="outline">Δεν εμφανίστηκε</Badge>;
                  default:
                    return null;
                }
              };

              return (
                <Card key={booking.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="space-y-2 mb-4 md:mb-0">
                        <div className="flex items-center space-x-2">
                          {isToday && (
                            <Badge className="bg-primary text-primary-foreground">
                              ΣΗΜΕΡΑ
                            </Badge>
                          )}
                          {isTomorrow && (
                            <Badge variant="secondary">
                              ΑΥΡΙΟ
                            </Badge>
                          )}
                          <h3 className="font-bold text-lg">{booking.class_name}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center mb-1 sm:mb-0">
                            <Calendar className="h-4 w-4 mr-1 text-primary" />
                            {new Date(booking.booking_date).toLocaleDateString('el-GR')}
                          </div>
                          <div className="flex items-center mb-1 sm:mb-0">
                            <Clock className="h-4 w-4 mr-1 text-primary" />
                            {booking.booking_time}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:space-x-6 text-sm text-muted-foreground">
                          {booking.instructor_name && (
                            <div className="flex items-center mb-1 sm:mb-0">
                              <User className="h-4 w-4 mr-1 text-primary" />
                              {booking.instructor_name}
                            </div>
                          )}
                          {booking.checked_in && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Checked In
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {booking.status === 'confirmed' && !booking.checked_in && isToday && (
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => checkInMutation.mutate(booking.id)}
                            disabled={checkInMutation.isPending}
                          >
                            Check In
                          </Button>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => cancelBookingMutation.mutate(booking.id)}
                            disabled={cancelBookingMutation.isPending}
                          >
                            Ακύρωση
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (!isLoading && (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/40 rounded-full p-6 mb-4">
              <CalendarX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Δεν υπάρχουν επερχόμενες κρατήσεις</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Δεν έχετε κλείσει ακόμη κανένα μάθημα. Ρίξτε μια ματιά στο πρόγραμμά μας και κλείστε την επόμενη προπόνησή σας.
            </p>
            <Link to="/schedule">
              <Button>Προβολή Προγράμματος Μαθημάτων</Button>
            </Link>
          </div>
        ))}
      </main>

      {/* Gym Rules Modal */}
      <GymRulesModal 
        open={showRules} 
        onClose={() => setShowRules(false)}
        onAgree={handleAgreeToRules}
      />
    </div>
  );
};

export default BookingsPage;
