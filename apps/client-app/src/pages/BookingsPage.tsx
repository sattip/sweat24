
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { Calendar, Clock, MapPin, User, CalendarX } from "lucide-react";
import GymRulesModal from "@/components/modals/GymRulesModal";
import PackageAlert from "@/components/notifications/PackageAlert";
import PushNotificationSample from "@/components/notifications/PushNotificationSample";

const BookingsPage = () => {
  // State for gym rules modal
  const [showRules, setShowRules] = useState(false);
  // State to track if this is first booking (for demo purposes)
  const [isFirstBooking, setIsFirstBooking] = useState(false);
  // State for package status (for demo purposes)
  const [packageStatus, setPackageStatus] = useState<"normal" | "last-session" | "expiring-soon" | "expired">("normal");
  // State for notification type (for demo purposes)
  const [notificationType, setNotificationType] = useState<"booking" | "reminder" | "offer">("booking");
  // State to show notification demo
  const [showNotification, setShowNotification] = useState(false);

  // Mock data for booked classes
  const bookedClasses = [
    {
      id: 2,
      name: "HIIT Blast",
      day: "Σήμερα",
      date: "24 Μαΐου 2025",
      time: "12:00 - 12:45",
      instructor: "Mike Johnson",
      location: "Κυρίως Όροφος",
    },
    {
      id: 3,
      name: "Spin Class",
      day: "Αύριο",
      date: "25 Μαΐου 2025",
      time: "18:00 - 19:00",
      instructor: "Sarah Davis",
      location: "Στούντιο Ποδηλασίας",
    },
    {
      id: 4,
      name: "Προπόνηση Δύναμης",
      day: "Τρίτη",
      date: "26 Μαΐου 2025",
      time: "08:00 - 09:00",
      instructor: "Chris Taylor",
      location: "Αίθουσα Βαρών",
    },
  ];
  
  // Example of empty state for demonstration purposes
  const hasBookings = bookedClasses.length > 0;

  // Function to handle agreeing to gym rules
  const handleAgreeToRules = () => {
    setShowRules(false);
    // Logic to save that user has agreed to rules would go here
    alert("Ευχαριστούμε που συμφωνήσατε με τους κανόνες του γυμναστηρίου μας!");
  };
  
  // Demo functions
  const toggleRulesModal = () => {
    setShowRules(prev => !prev);
  };

  const cyclePackageStatus = () => {
    const statuses = ["normal", "last-session", "expiring-soon", "expired"];
    const currentIndex = statuses.indexOf(packageStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setPackageStatus(statuses[nextIndex] as any);
  };

  const cycleNotificationType = () => {
    const types = ["booking", "reminder", "offer"];
    const currentIndex = types.indexOf(notificationType);
    const nextIndex = (currentIndex + 1) % types.length;
    setNotificationType(types[nextIndex] as any);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Οι Κρατήσεις μου</h1>
        </div>
        
        {/* Demo controls (for testing only - would be removed in production) */}
        <div className="mb-6 p-4 bg-muted/20 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Δοκιμαστικά Κοντρόλ</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={toggleRulesModal}>
              Εμφάνιση Κανόνων Γυμναστηρίου
            </Button>
            <Button size="sm" onClick={cyclePackageStatus} variant="outline">
              Αλλαγή Κατάστασης Πακέτου: {packageStatus}
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowNotification(!showNotification)} 
              variant="outline"
            >
              {showNotification ? "Απόκρυψη" : "Εμφάνιση"} Δείγματος Ειδοποίησης
            </Button>
            {showNotification && (
              <Button size="sm" onClick={cycleNotificationType} variant="outline">
                Αλλαγή Τύπου Ειδοποίησης: {notificationType}
              </Button>
            )}
          </div>
        </div>

        {/* Package alerts based on status */}
        {packageStatus === "last-session" && (
          <PackageAlert type="last-session" />
        )}
        {packageStatus === "expiring-soon" && (
          <PackageAlert type="expiring-soon" daysRemaining={3} />
        )}
        {packageStatus === "expired" && (
          <PackageAlert type="expired" />
        )}

        {/* Push notification sample */}
        {showNotification && (
          <PushNotificationSample type={notificationType} />
        )}
        
        {hasBookings ? (
          <div className="space-y-4">
            {bookedClasses.map((booking) => (
              <Link to={`/class/${booking.id}`} key={booking.id} className="block">
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="space-y-2 mb-4 md:mb-0">
                        <div className="flex items-center">
                          {booking.day === "Σήμερα" && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-1 mr-2">
                              ΣΗΜΕΡΑ
                            </span>
                          )}
                          {booking.day === "Αύριο" && (
                            <span className="bg-secondary text-secondary-foreground text-xs font-bold rounded-full px-2 py-1 mr-2">
                              ΑΥΡΙΟ
                            </span>
                          )}
                          <h3 className="font-bold text-lg">{booking.name}</h3>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center mb-1 sm:mb-0">
                            <Calendar className="h-4 w-4 mr-1 text-primary" />
                            {booking.date}
                          </div>
                          <div className="flex items-center mb-1 sm:mb-0">
                            <Clock className="h-4 w-4 mr-1 text-primary" />
                            {booking.time}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center mb-1 sm:mb-0">
                            <User className="h-4 w-4 mr-1 text-primary" />
                            {booking.instructor}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            {booking.location}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          // Cancel booking logic would go here
                          alert("Αυτό θα ακυρώσει την κράτησή σας");
                        }}
                      >
                        Ακύρωση Κράτησης
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
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
        )}
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
