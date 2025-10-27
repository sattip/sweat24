import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Dumbbell, ShoppingCart, Gift, Loader2, Package, CheckCircle, ClipboardList, History, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PackageAlert from "@/components/notifications/PackageAlert";
import { DashboardAlert } from "@/components/notifications/DashboardAlert";
import SessionCountIndicator from "@/components/SessionCountIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useSimulation } from "@/hooks/useSimulation";
import { dashboardService, bookingService, profileService, packageService } from "@/services/apiService";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/BookingCalendar";
import { UpcomingBookings } from "@/components/UpcomingBookings";
import { ApprovedAppointments } from "@/components/ApprovedAppointments";
import { BookingWizard } from "@/components/BookingWizard";
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
  const { user, refreshUser } = useAuth();
  const { 
    isAdminTester, 
    getSimulatedUser, 
    getPackageStatus, 
    isBirthdayWeek: isSimulatedBirthdayWeek
  } = useSimulation();
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [activePackages, setActivePackages] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  
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
      
      // Refresh user data first to ensure we have latest session info
      if (!isAdminTester && refreshUser) {
        await refreshUser();
      }
      
      // Fetch all data in parallel
      const [statsData, bookingsData, activePkgs, packagesData] = await Promise.all([
        dashboardService.getStats(),
        bookingService.getAll(),
        profileService.getActivePackages(),
        packageService.getAll()
      ]);
      
      setStats(statsData);
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : (Array.isArray(bookingsData?.data) ? bookingsData.data : []);
      setRecentBookings(bookingsArray.slice(0, 5));

      if (Array.isArray(activePkgs)) {
        const activePackage = activePkgs.find(p => {
          const status = p?.status?.toLowerCase();
          const isActive = status === 'active' || status === 'ενεργό' || p?.is_active === true;
          const notFrozen = p?.is_frozen === false || p?.is_frozen === undefined;
          return isActive && notFrozen;
        });
      }

      setActivePackages(Array.isArray(activePkgs) ? activePkgs : []);

      // Process and set available packages
      const packages = Array.isArray(packagesData) ? packagesData : (packagesData?.data || []);
      setAvailablePackages(packages);
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
      ? (displayUser as any).user_packages.find((p: any) => {
          const status = p?.status?.toLowerCase();
          return status === 'active' || status === 'ενεργό' || p?.is_active === true;
        })
      : undefined;
    const result = activeFromRoot || fromList || null;
    return result;
  })();
  
  // Check if it's the user's birthday week (simulated or real)
  const birthdayWeek = isAdminTester ? isSimulatedBirthdayWeek() : (displayUser ? isBirthdayWeek(displayUser.birth_date) : false);
  
  // More flexible active package detection - handle Greek and English status values
  const apiActivePackage = Array.isArray(activePackages)
    ? activePackages.find(p => {
        const status = p?.status?.toLowerCase();
        const isActive = status === 'active' || status === 'ενεργό' || p?.is_active === true;
        const notFrozen = p?.is_frozen === false || p?.is_frozen === undefined;
        return isActive && notFrozen;
      })
    : null;
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

  // Check if package end date is in the future
  const isPackageNotExpired = displayUser?.package_end_date
    ? new Date(displayUser.package_end_date) > new Date()
    : false;

  // More robust check for active package
  const hasActivePackage = Boolean(
    apiActivePackage ||
    derivedActivePackage ||
    (displayUser?.status === 'active' && isPackageNotExpired) ||
    (remainingSessions !== null && remainingSessions !== undefined && remainingSessions > 0) ||
    isPackageNotExpired
  );

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

              {/* Package renewal suggestions when expiring */}
              {(packageStatus === "expiring-soon" || packageStatus === "last-session") && (() => {
                // Get current package total sessions for comparison
                const currentTotalSessions = apiActivePackage?.total_sessions ?? displayUser?.total_sessions ?? 0;

                // Filter packages that are larger than current package and sort by sessions
                const suggestedPackages = availablePackages
                  .filter(pkg => {
                    const pkgSessions = pkg.total_sessions || pkg.sessions || 0;
                    // Show packages with more sessions than current, or unlimited packages
                    return pkgSessions > currentTotalSessions || pkg.is_unlimited || pkgSessions === 0;
                  })
                  .sort((a, b) => {
                    const aVal = a.total_sessions || a.sessions || 0;
                    const bVal = b.total_sessions || b.sessions || 0;
                    // Unlimited packages go last
                    if (a.is_unlimited) return 1;
                    if (b.is_unlimited) return -1;
                    return aVal - bVal;
                  })
                  .slice(0, 3); // Show top 3

                if (suggestedPackages.length === 0) return null;

                return (
                  <div className="mt-6 pt-6 border-t">
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <Package className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-lg mb-1">
                            {packageStatus === "last-session" ? "Τελευταία προπόνηση!" : "Η συνδρομή σας λήγει σύντομα"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Ανανεώστε τώρα με ένα μεγαλύτερο πακέτο και συνεχίστε την πρόοδό σας!
                          </p>
                        </div>
                      </div>

                      <div className={`grid grid-cols-1 ${suggestedPackages.length >= 3 ? 'sm:grid-cols-3' : suggestedPackages.length === 2 ? 'sm:grid-cols-2' : ''} gap-3`}>
                        {suggestedPackages.map((pkg, index) => {
                          const isPopular = index === 1 && suggestedPackages.length >= 3; // Middle one is popular
                          const sessions = pkg.total_sessions || pkg.sessions || 0;
                          const isUnlimited = pkg.is_unlimited || sessions === 0;

                          return (
                            <div
                              key={pkg.id}
                              className={`bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border-2 ${isPopular ? 'border-primary' : 'border-transparent hover:border-primary'} transition-colors`}
                            >
                              {isPopular && (
                                <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2">
                                  ΔΗΜΟΦΙΛΕΣ
                                </div>
                              )}
                              <div className="text-center">
                                <p className="font-bold text-2xl text-primary">
                                  {isUnlimited ? '∞' : sessions}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {isUnlimited ? 'Απεριόριστα' : 'Μαθήματα'}
                                </p>
                                <p className="text-xs font-medium mt-1">
                                  {pkg.name || pkg.title || `Πακέτο ${sessions} μαθημάτων`}
                                </p>
                                {pkg.price && (
                                  <p className="text-sm font-bold text-primary mt-2">
                                    €{pkg.price}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex justify-center">
                        <Link to="/contact">
                          <Button className="w-full sm:w-auto">
                            <Package className="h-4 w-4 mr-2" />
                            Επικοινωνήστε για Ανανέωση
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
              <CardFooter className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setShowBookingWizard(true)}
                >
                  Κλείσε Μάθημα Βήμα-Βήμα
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link to="/workout-history" className="w-full">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    Ιστορικό Προπονήσεων
                    <History className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Approved Appointments - Right after booking card */}
          <ApprovedAppointments />

          {/* Referral & Questionnaires - Side by side */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-xl">Συστήστε έναν Φίλο</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Κάντε δώρο μια προπόνηση γνωριμίας</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 sm:h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-2 sm:p-4">
                    <Gift className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-xs sm:text-sm hidden sm:block">Μοιραστείτε την αγάπη για τη γυμναστική και κερδίστε ανταμοιβές</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Link to="/referrals" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm" variant="outline">
                    <span className="hidden sm:inline">Μάθετε Περισσότερα</span>
                    <span className="sm:hidden">Περισσότερα</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-xl">Ερωτηματολόγια</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Συμπλήρωσε τα ερωτηματολόγιά σου</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 sm:h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-2 sm:p-4">
                    <ClipboardList className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-xs sm:text-sm hidden sm:block">Βοήθησέ μας να βελτιώσουμε την εμπειρία σου συμπληρώνοντας ερωτηματολόγια</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Link to="/questionnaires" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm" variant="outline">
                    <span className="hidden sm:inline">Προβολή Ερωτηματολογίων</span>
                    <span className="sm:hidden">Προβολή</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* More Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Κατάστημα & Παραγγελίες</CardTitle>
                <CardDescription>Περιήγηση και διαχείριση παραγγελιών</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Ψώνισε προϊόντα και παρακολούθησε τις παραγγελίες σου</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Link to="/store" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    Επίσκεψη Καταστήματος
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/store?tab=orders" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    Οι Παραγγελίες μου
                    <Package className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Οδηγός Νέου Μέλους</CardTitle>
                <CardDescription>Όλα όσα πρέπει να γνωρίζεις</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <Sparkles className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Κανόνες, οφέλη, πρόγραμμα και όλες οι πληροφορίες που χρειάζεσαι</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Link to="/new-member-info" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    Προβολή Οδηγού
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Personal Booking Calendar & Upcoming Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingCalendar />
            </div>
            <div className="lg:col-span-1">
              <UpcomingBookings />
            </div>
          </div>
        </div>
      </main>

      {/* Booking Wizard */}
      <BookingWizard
        isOpen={showBookingWizard}
        onClose={() => setShowBookingWizard(false)}
      />
    </div>
  );
};

export default DashboardPage;
