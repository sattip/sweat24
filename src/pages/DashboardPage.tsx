import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Dumbbell, ShoppingCart, Gift, Loader2, Package, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PackageAlert from "@/components/notifications/PackageAlert";
import { DashboardAlert } from "@/components/notifications/DashboardAlert";
import SessionCountIndicator from "@/components/SessionCountIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useSimulation } from "@/hooks/useSimulation";
import { dashboardService, bookingService, profileService } from "@/services/apiService";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/BookingCalendar";
import { UpcomingBookings } from "@/components/UpcomingBookings";
import { ApprovedAppointments } from "@/components/ApprovedAppointments";
import { updateLocalStorageUserStatus } from "@/utils/updateUserStatus";

// Function to check if it's the user's birthday week
const isBirthdayWeek = (birthDate: string | undefined): boolean => {
  if (!birthDate) return false;
  const today = new Date();
  const birthday = new Date(birthDate);
  birthday.setFullYear(today.getFullYear());
  
  const weekBefore = new Date(birthday);
  weekBefore.setDate(birthday.getDate() - 7);
  
  return today >= weekBefore && today <= birthday;
};

// Function to determine package status
const getLocalPackageStatus = (remainingSessions: number | undefined, lastVisit: string | undefined) => {
  if (!remainingSessions || remainingSessions === 0) return "expired";
  if (remainingSessions === 1) return "last-session";
  if (remainingSessions <= 3) return "expiring-soon";
  return "normal";
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { 
    isAdminTester, 
    getSimulatedUser, 
    getPackageStatus, 
    isBirthdayWeek: isSimulatedBirthdayWeek
  } = useSimulation();
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePackages, setActivePackages] = useState<any[]>([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refetch όταν επιστρέφει ο χρήστης στο tab ή στο παράθυρο
  useEffect(() => {
    const onFocus = () => fetchDashboardData();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchDashboardData();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsData, bookingsData, activePkgs] = await Promise.all([
        dashboardService.getStats(),
        bookingService.getAll(),
        profileService.getActivePackages()
      ]);
      
      setStats(statsData);
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : (Array.isArray(bookingsData?.data) ? bookingsData.data : []);
      setRecentBookings(bookingsArray.slice(0, 5));
      setActivePackages(Array.isArray(activePkgs) ? activePkgs : []);
    } catch (error) {
      toast.error("Σφάλμα κατά τη φόρτωση δεδομένων");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Νέα συνάρτηση για την ενημέρωση του status χρήστη
  const handleUpdateUserStatus = () => {
    try {
      updateLocalStorageUserStatus();
      toast.success("Το status του χρήστη user@sweat93.gr ενημερώθηκε σε ενεργή συνδρομή! Η σελίδα θα ανανεωθεί αυτόματα.");
    } catch (error) {
      toast.error("Σφάλμα κατά την ενημέρωση του status χρήστη");
      console.error(error);
    }
  };
  
  // Get the appropriate user data (simulated for admin, real for others)
  const displayUser = isAdminTester ? getSimulatedUser() : user;

  // Derive active package from user model (backend may not send aggregates)
  const derivedActivePackage: any = (() => {
    const activeFromRoot = (displayUser as any)?.active_package;
    const fromList = Array.isArray((displayUser as any)?.user_packages)
      ? (displayUser as any).user_packages.find((p: any) => p?.status === 'active')
      : undefined;
    return activeFromRoot || fromList || null;
  })();
  
  // Check if it's the user's birthday week (simulated or real)
  const birthdayWeek = isAdminTester ? isSimulatedBirthdayWeek() : (displayUser ? isBirthdayWeek(displayUser.birth_date) : false);
  
  const apiActivePackage = Array.isArray(activePackages) ? activePackages.find(p => p?.status === 'active' && p?.is_frozen === false) : null;
  // Determine package status (simulated for admin, real for others)
  const packageStatus = isAdminTester
    ? getPackageStatus()
    : (() => {
        const rem = apiActivePackage?.remaining_sessions ?? displayUser?.remaining_sessions;
        return getLocalPackageStatus(rem as any, displayUser?.last_visit);
      })();
  const remainingSessions = (
    apiActivePackage?.remaining_sessions ??
    derivedActivePackage?.remaining_sessions ??
    displayUser?.remaining_sessions ?? 0
  );
  const hasActivePackage = Boolean(apiActivePackage || derivedActivePackage) || remainingSessions === null || (typeof remainingSessions === 'number' && remainingSessions > 0);
  
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
      
      <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Καλώς ήρθες πίσω, {displayUser?.name?.split(' ')[0] || 'φίλε'}!
          </h1>
        </div>
        

        {/* Admin Controls - Only visible to admin users */}
        {user?.email === 'admin@sweat93.gr' && (
          <Card className="mb-6 border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" />
                Admin Controls
              </CardTitle>
              <CardDescription>Διαχειριστικές λειτουργίες συστήματος</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleUpdateUserStatus}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4" />
                  Ενεργοποίηση Συνδρομής user@sweat93.gr
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => toast.info("Αυτή η λειτουργία θα προστεθεί σύντομα")}
                >
                  Διαχείριση Χρηστών
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Χρησιμοποιήστε το κουμπί για να ενημερώσετε το status του χρήστη user@sweat93.gr από ληγμένη σε ενεργή συνδρομή.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Package alerts based on status - προβάλλονται μόνο όταν ΔΕΝ υπάρχει ενεργό πακέτο */}
        {!hasActivePackage && packageStatus === "last-session" && (
          <PackageAlert type="last-session" />
        )}
        {!hasActivePackage && packageStatus === "expiring-soon" && (
          <PackageAlert type="expiring-soon" daysRemaining={3} />
        )}
        {!hasActivePackage && packageStatus === "expired" && (
          <PackageAlert type="expired" />
        )}
        
        {/* High Priority Notifications */}
        <DashboardAlert />
        
        <div className="grid gap-6">
          {/* Birthday Reward Card - Only shown during birthday week */}
          {birthdayWeek && (
            <Card className="border-l-4 border-l-secondary bg-gradient-to-r from-secondary/10 to-background shadow-md animate-fade-in">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">🎉 Χρόνια Πολλά!</CardTitle>
                  <Gift className="h-8 w-8 text-secondary" />
                </div>
                <CardDescription>Έχουμε ένα ειδικό δώρο για εσένα</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="font-medium text-lg">Απόλαυσε μια <span className="text-secondary font-bold">ΔΩΡΕΑΝ</span> προσωπική προπόνηση</p>
                  <p className="text-sm text-muted-foreground">
                    Ισχύει έως: {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString()}
                  </p>
                  <div className="bg-secondary/10 text-secondary font-medium rounded-full px-4 py-2 inline-block mt-2">
                    Κωδικός Κράτησης: <span className="font-bold">BDAYPT2023</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Link to="/services/request/personal-training">
                  <Button>
                    Εξαργύρωση Τώρα
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
          
          {/* Active Package Status - show only when there is an active package */}
          {hasActivePackage && (
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Ενεργή Συνδρομή</CardTitle>
              <CardDescription>Η τρέχουσα κατάσταση της συνδρομής σας</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between md:items-center space-y-3 md:space-y-0">
                <div>
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    Συνδρομή
                    {(
                      (apiActivePackage?.total_sessions ?? displayUser?.total_sessions) !== undefined ||
                      (apiActivePackage?.remaining_sessions ?? displayUser?.remaining_sessions) !== undefined
                    ) && (
                      <SessionCountIndicator 
                        totalSessions={(apiActivePackage?.total_sessions ?? displayUser.total_sessions) ?? null}
                        remainingSessions={(apiActivePackage?.remaining_sessions ?? displayUser.remaining_sessions) ?? null}
                        membershipType="Μηνιαίο"
                      />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {displayUser?.join_date ? (
                      <>Μέλος από {new Date(displayUser.join_date).toLocaleDateString()}</>
                    ) : (
                      <>Νέο μέλος</>
                    )}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary font-medium rounded-full px-4 py-1 text-center">
                  {displayUser?.status === 'active' ? 'Ενεργή' : 'Ανενεργή'}
                </div>
              </div>
              {displayUser?.package_start_date && displayUser?.package_end_date && (
                <p className="text-sm text-muted-foreground mt-2">
                  Περίοδος πακέτου: {new Date(displayUser.package_start_date).toLocaleDateString()} - {new Date(displayUser.package_end_date).toLocaleDateString()}
                </p>
              )}
              {displayUser?.last_visit && (
                <p className="text-sm text-muted-foreground mt-1">
                  Τελευταία επίσκεψη: {new Date(displayUser.last_visit).toLocaleDateString()}
                </p>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              {/* Package purchase button removed per user request */}
            </CardFooter>
          </Card>
          )}

          {/* No Active Package - show informative message */}
          {!hasActivePackage && (
            <Card className="border-l-4 border-l-red-500 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Το Πακέτο σας Έληξε</CardTitle>
                <CardDescription>Δεν έχετε ενεργή συνδρομή αυτή τη στιγμή</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Δεν μπορείτε να κλείσετε νέα μαθήματα μέχρι να αγοράσετε νέο πακέτο. Παρακαλούμε
                  επικοινωνήστε με τη γραμματεία για να ανανεώσετε την συνδρομή σας.
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Link to="/contact">
                  <Button variant="outline">Επικοινωνία</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Κλείσε Μάθημα</CardTitle>
                <CardDescription>Δες το πρόγραμμα και κλείσε την επόμενη προπόνησή σου</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <Dumbbell className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Περιηγήσου σε όλα τα διαθέσιμα μαθήματα και κλείσε την προπόνησή σου</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/schedule" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2">
                    Προβολή Προγράμματος
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Συστήστε έναν Φίλο</CardTitle>
                <CardDescription>Κάντε δώρο μια προπόνηση γνωριμίας</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <Gift className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Μοιραστείτε την αγάπη για τη γυμναστική και κερδίστε ανταμοιβές</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/referrals" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    Μάθετε Περισσότερα
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Κατάστημα</CardTitle>
                <CardDescription>Περιήγηση σε συμπληρώματα, ρούχα και άλλα</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Ψώνισε συμπληρώματα, ρούχα γυμναστικής και αξεσουάρ</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/store" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    Επίσκεψη Καταστήματος
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Οι Παραγγελίες μου</CardTitle>
                <CardDescription>Δες την κατάσταση των παραγγελιών σου</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <Package className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Παρακολούθησε τις παραγγελίες σου και δες πότε είναι έτοιμες</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/store?tab=orders" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    Προβολή Παραγγελιών
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Approved Appointments */}
          <div className="mt-6">
            <ApprovedAppointments />
          </div>

          {/* Personal Booking Calendar & Upcoming Bookings */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingCalendar />
            </div>
            <div className="lg:col-span-1">
              <UpcomingBookings />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
