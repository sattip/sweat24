import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Dumbbell, Loader2, Package, CheckCircle, Calendar, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PackageAlert from "@/components/notifications/PackageAlert";
import { DashboardAlert } from "@/components/notifications/DashboardAlert";
import PartialPaymentAlert from "@/components/notifications/PartialPaymentAlert";
import SessionCountIndicator from "@/components/SessionCountIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useSimulation } from "@/hooks/useSimulation";
import { dashboardService, bookingService, profileService, packageService } from "@/services/apiService";
import { buildApiUrl } from "@/config/api";
import { toast } from "sonner";
import { BookingWizard } from "@/components/BookingWizard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateLocalStorageUserStatus } from "@/utils/updateUserStatus";

// Helper function to format date as dd/mm/yyyy
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

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
  const [showNoPackageDialog, setShowNoPackageDialog] = useState(false);
  const [activePackages, setActivePackages] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [installmentData, setInstallmentData] = useState<{
    has_pending_payments?: boolean;
    total_amount_remaining?: number;
    next_installment_due?: string;
    next_installment_amount?: number;
    packages?: any[];
    upcoming_installments?: any[];
  } | null>(null);
  
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

      // Fetch installment data
      try {
        const token = localStorage.getItem("auth_token");
        const installmentResponse = await fetch(buildApiUrl("/my-partial-payments"), {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (installmentResponse.ok) {
          const result = await installmentResponse.json();
          setInstallmentData(result.data || result);
        }
      } catch (e) {
        // Silently ignore - installment data is optional
      }
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <div className="bg-red-800 text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-200 text-sm mb-1">Καλώς ήρθες πίσω</p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {displayUser?.name?.split(' ')[0] || 'φίλε'}! 👋
          </h1>
        </div>
      </div>

      <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        {/* Admin Controls - Only visible to admin users */}
        {user?.email === 'admin@sweat93.gr' && (
          <Card className="mb-6 border-0 shadow-lg bg-white overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
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

        {/* Partial Payment Alert */}
        <PartialPaymentAlert />

        <div className="grid gap-6">
          {/* Birthday Reward Card - Only shown during birthday week */}
          {birthdayWeek && (
            <Card className="border-0 shadow-lg bg-white overflow-hidden animate-fade-in">
              <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
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
                    Ισχύει έως: {formatDate(new Date(new Date().setDate(new Date().getDate() + 14)))}
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
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Ενεργή Συνδρομή</CardTitle>
                <div className="bg-green-100 text-green-700 font-medium rounded-full px-3 py-1 text-sm">
                  ✓ Ενεργή
                </div>
              </div>
              <CardDescription>Η τρέχουσα κατάσταση της συνδρομής σας</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg">Συνδρομή</h3>
                  {(
                    (apiActivePackage?.total_sessions ?? displayUser?.total_sessions) !== undefined ||
                    (apiActivePackage?.remaining_sessions ?? displayUser?.remaining_sessions) !== undefined
                  ) && (
                    <SessionCountIndicator
                      totalSessions={(apiActivePackage?.total_sessions ?? displayUser.total_sessions) ?? null}
                      remainingSessions={(apiActivePackage?.remaining_sessions ?? displayUser.remaining_sessions) ?? null}
                      bonusSessions={(apiActivePackage?.bonus_sessions ?? displayUser.bonus_sessions) ?? 0}
                      bonusSessionsUsed={(apiActivePackage?.bonus_sessions_used ?? displayUser.bonus_sessions_used) ?? 0}
                      membershipType="Μηνιαίο"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {displayUser?.join_date ? (
                    <>Μέλος από {formatDate(displayUser.join_date)}</>
                  ) : (
                    <>Νέο μέλος</>
                  )}
                </p>
              </div>
              {displayUser?.package_start_date && displayUser?.package_end_date && (
                <p className="text-sm text-muted-foreground mt-2">
                  Περίοδος πακέτου: {formatDate(displayUser.package_start_date)} - {formatDate(displayUser.package_end_date)}
                </p>
              )}
              {displayUser?.last_visit && (
                <p className="text-sm text-muted-foreground mt-1">
                  Τελευταία επίσκεψη: {formatDate(displayUser.last_visit)}
                </p>
              )}

              {/* Installment Info */}
              {(() => {
                // Check multiple conditions for pending installments
                const hasPending = installmentData?.has_pending_payments ||
                  (installmentData?.total_amount_remaining && installmentData.total_amount_remaining > 0) ||
                  (installmentData?.packages && installmentData.packages.length > 0) ||
                  (installmentData?.upcoming_installments && installmentData.upcoming_installments.length > 0);

                if (!hasPending) return null;

                // Get next installment info from various sources
                const nextDue = installmentData?.next_installment_due ||
                  installmentData?.upcoming_installments?.[0]?.due_date;
                const nextAmount = installmentData?.next_installment_amount ||
                  installmentData?.upcoming_installments?.[0]?.amount;
                const totalRemaining = installmentData?.total_amount_remaining ||
                  installmentData?.packages?.reduce((sum, pkg) => sum + (pkg.amount_remaining || 0), 0) || 0;

                return (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium text-sm">Εκκρεμείς Δόσεις</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {totalRemaining > 0 && (
                        <p className="text-sm">
                          Υπόλοιπο: <span className="font-semibold">{formatCurrency(totalRemaining)}</span>
                        </p>
                      )}
                      {nextDue && (
                        <p className="text-sm">
                          Επόμενη δόση: <span className="font-semibold">{formatDate(nextDue)}</span>
                          {nextAmount && (
                            <span className="text-muted-foreground"> ({formatCurrency(nextAmount)})</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

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
                        <Button
                          className="w-full sm:w-auto"
                          onClick={() => window.dispatchEvent(new CustomEvent('openChat'))}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Επικοινωνήστε για Ανανέωση
                        </Button>
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


          {/* Προπονήσεις */}
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-600 to-red-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Προπονήσεις</CardTitle>
                  <CardDescription>Κλείσε την επόμενη προπόνησή σου</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                Περιηγήσου σε όλα τα διαθέσιμα μαθήματα και διάλεξε αυτό που σου ταιριάζει.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0">
              <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (!hasActivePackage) {
                    setShowNoPackageDialog(true);
                    return;
                  }
                  setShowBookingWizard(true);
                }}
              >
                Κλείσε Προπόνηση
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link to="/bookings" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  Οι προπονήσεις μου
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Booking Wizard */}
      <BookingWizard
        isOpen={showBookingWizard}
        onClose={() => setShowBookingWizard(false)}
      />

      {/* No Active Package Dialog */}
      <Dialog open={showNoPackageDialog} onOpenChange={setShowNoPackageDialog}>
        <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-destructive" />
              Δεν υπάρχει ενεργό πακέτο
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p className="text-sm">
                Για να κλείσετε μάθημα, χρειάζεστε ενεργό πακέτο συνδρομής.
              </p>
              <p className="text-sm text-muted-foreground">
                Επικοινωνήστε με τη γραμματεία για να αγοράσετε ή να ανανεώσετε το πακέτο σας.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col gap-3 pt-4">
            <Button
              className="w-full"
              onClick={() => {
                setShowNoPackageDialog(false);
                window.dispatchEvent(new CustomEvent('openChat'));
              }}
            >
              Επικοινωνία με Γραμματεία
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowNoPackageDialog(false)}
            >
              Κλείσιμο
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
