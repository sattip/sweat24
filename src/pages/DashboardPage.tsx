import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, User, Dumbbell, ShoppingCart, Gift, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PackageAlert from "@/components/notifications/PackageAlert";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { packagesService } from "@/services/packagesService";

const DashboardPage = () => {
  const { user } = useAuth();
  
  // Fetch dashboard data
  const { 
    data: dashboardStats, 
    isLoading: statsLoading,
    error: statsError 
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getDashboardStats(),
    enabled: !!user,
  });

  // Fetch current package
  const { 
    data: currentPackage, 
    isLoading: packageLoading,
    error: packageError 
  } = useQuery({
    queryKey: ['current-package'],
    queryFn: () => packagesService.getCurrentPackage(),
    enabled: !!user,
  });

  // Fetch birthday rewards
  const { 
    data: birthdayRewards,
    isLoading: rewardsLoading 
  } = useQuery({
    queryKey: ['birthday-rewards'],
    queryFn: () => dashboardService.getBirthdayRewards(),
    enabled: !!user,
  });

  // Check if it's user's birthday week
  const birthdayWeek = user?.date_of_birth ? 
    dashboardService.isBirthdayWeek(user.date_of_birth) : false;
  
  // Get package status
  const packageStatus = currentPackage ? 
    dashboardService.getPackageStatus(currentPackage) : 'normal';

  // Loading state
  if (statsLoading || packageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-10 w-64 mb-2" />
          </div>
          <div className="grid gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Καλώς ήρθες πίσω, {user?.name?.split(' ')[0] || 'Φίλε'}!
          </h1>
        </div>

        {/* Error Messages */}
        {(statsError || packageError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Αποτυχία φόρτωσης δεδομένων dashboard. Παρακαλώ δοκιμάστε ξανά.
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
        
        <div className="grid gap-6">
          {/* Birthday Reward Card - Only shown during birthday week */}
          {birthdayWeek && birthdayRewards && birthdayRewards.length > 0 && (
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
                  <p className="font-medium text-lg">
                    {birthdayRewards[0].description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ισχύει έως: {new Date(birthdayRewards[0].expires_at).toLocaleDateString()}
                  </p>
                  <div className="bg-secondary/10 text-secondary font-medium rounded-full px-4 py-2 inline-block mt-2">
                    Κωδικός Κράτησης: <span className="font-bold">{birthdayRewards[0].booking_code}</span>
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
          
          {/* Active Package Status */}
          {currentPackage ? (
            <Card className="border-l-4 border-l-primary shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Ενεργή Συνδρομή</CardTitle>
                <CardDescription>Η τρέχουσα κατάσταση της συνδρομής σας</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between md:items-center space-y-3 md:space-y-0">
                  <div>
                    <h3 className="font-medium text-lg">{currentPackage.package_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Λήγει στις {new Date(currentPackage.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Απομένουν: {currentPackage.remaining_credits} από {currentPackage.total_credits} μαθήματα
                    </p>
                  </div>
                  <div className="bg-primary/10 text-primary font-medium rounded-full px-4 py-1 text-center">
                    {packagesService.getDaysRemaining(currentPackage.end_date)} ημέρες απομένουν
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  Ανανέωση Συνδρομής
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-l-4 border-l-orange-500 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Δεν έχετε ενεργή συνδρομή</CardTitle>
                <CardDescription>Επιλέξτε ένα πακέτο για να ξεκινήσετε</CardDescription>
              </CardHeader>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Link to="/store">
                  <Button>
                    Περιήγηση Πακέτων
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}

          {/* Dashboard Stats */}
          {dashboardStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{dashboardStats.total_bookings}</div>
                  <p className="text-sm text-muted-foreground">Συνολικές Κρατήσεις</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.completed_sessions}</div>
                  <p className="text-sm text-muted-foreground">Ολοκληρωμένα Μαθήματα</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.upcoming_sessions}</div>
                  <p className="text-sm text-muted-foreground">Επερχόμενα Μαθήματα</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{dashboardStats.remaining_credits}</div>
                  <p className="text-sm text-muted-foreground">Απομένοντα Credits</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Κλείσε Μάθημα</CardTitle>
                <CardDescription>Δες το πρόγραμμα και κλείσε την επόμενη προπόνησή σου</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <p className="text-sm">Δες το πρόγραμμα μαθημάτων και κρατά τη θέση σου</p>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
