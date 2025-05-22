
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
      day: "Today",
      date: "May 24, 2025",
      time: "12:00 - 12:45",
      instructor: "Mike Johnson",
      location: "Main Floor",
    },
    {
      id: 3,
      name: "Spin Class",
      day: "Tomorrow",
      date: "May 25, 2025",
      time: "18:00 - 19:00",
      instructor: "Sarah Davis",
      location: "Cycle Studio",
    },
    {
      id: 4,
      name: "Strength Training",
      day: "Tuesday",
      date: "May 26, 2025",
      time: "08:00 - 09:00",
      instructor: "Chris Taylor",
      location: "Weight Room",
    },
  ];
  
  // Example of empty state for demonstration purposes
  const hasBookings = bookedClasses.length > 0;

  // Function to handle agreeing to gym rules
  const handleAgreeToRules = () => {
    setShowRules(false);
    // Logic to save that user has agreed to rules would go here
    alert("Thank you for agreeing to our gym rules!");
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
          <h1 className="text-3xl font-bold">My Bookings</h1>
        </div>
        
        {/* Demo controls (for testing only - would be removed in production) */}
        <div className="mb-6 p-4 bg-muted/20 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Demo Controls</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={toggleRulesModal}>
              Toggle Gym Rules Modal
            </Button>
            <Button size="sm" onClick={cyclePackageStatus} variant="outline">
              Cycle Package Status: {packageStatus}
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowNotification(!showNotification)} 
              variant="outline"
            >
              {showNotification ? "Hide" : "Show"} Notification Sample
            </Button>
            {showNotification && (
              <Button size="sm" onClick={cycleNotificationType} variant="outline">
                Change Notification Type: {notificationType}
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
                          {booking.day === "Today" && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-1 mr-2">
                              TODAY
                            </span>
                          )}
                          {booking.day === "Tomorrow" && (
                            <span className="bg-secondary text-secondary-foreground text-xs font-bold rounded-full px-2 py-1 mr-2">
                              TOMORROW
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
                          alert("This would cancel your booking");
                        }}
                      >
                        Cancel Booking
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
            <h2 className="text-xl font-semibold mb-2">No upcoming bookings</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              You don't have any classes booked yet. Take a look at our schedule and book your next workout.
            </p>
            <Link to="/schedule">
              <Button>View Class Schedule</Button>
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
