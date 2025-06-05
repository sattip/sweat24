
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Dumbbell, ShoppingCart, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PackageAlert from "@/components/notifications/PackageAlert";

// Mock function to check if it's the user's birthday week
const isBirthdayWeek = (dateOfBirth: string): boolean => {
  // For demo purposes, we'll just return true to show the birthday card
  // In a real app, this would compare the current date with the user's birthday
  return true;
};

const DashboardPage = () => {
  // Mock data for the dashboard
  const userData = {
    name: "Γιάννης",
    activePackage: {
      name: "Premium Συνδρομή",
      expiresAt: "2023-12-31",
      remainingDays: 45,
    },
    dateOfBirth: "1990-05-15", // Example date of birth
  };
  
  // Check if it's the user's birthday week
  const birthdayWeek = isBirthdayWeek(userData.dateOfBirth);
  
  // State for package status (for demo purposes)
  const [packageStatus, setPackageStatus] = useState<"normal" | "last-session" | "expiring-soon" | "expired">("normal");
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Καλώς ήρθες πίσω, {userData.name}!
          </h1>
        </div>
        
        {/* Demo controls (for testing only - would be removed in production) */}
        <div className="mb-6 p-4 bg-muted/20 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Δοκιμαστικά Κοντρόλ</h2>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={() => {
                const statuses = ["normal", "last-session", "expiring-soon", "expired"];
                const currentIndex = statuses.indexOf(packageStatus);
                const nextIndex = (currentIndex + 1) % statuses.length;
                setPackageStatus(statuses[nextIndex] as any);
              }} 
              variant="outline"
            >
              Αλλαγή Κατάστασης Πακέτου: {packageStatus}
            </Button>
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
          
          {/* Active Package Status */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Ενεργή Συνδρομή</CardTitle>
              <CardDescription>Η τρέχουσα κατάσταση της συνδρομής σας</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between md:items-center space-y-3 md:space-y-0">
                <div>
                  <h3 className="font-medium text-lg">{userData.activePackage.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Λήγει στις {new Date(userData.activePackage.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary font-medium rounded-full px-4 py-1 text-center">
                  {userData.activePackage.remainingDays} ημέρες απομένουν
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button variant="outline" size="sm">
                Ανανέωση Συνδρομής
              </Button>
            </CardFooter>
          </Card>
          
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
                <CardTitle className="text-xl">Γνώρισε τους Προπονητές</CardTitle>
                <CardDescription>Μάθε για το ειδικευμένο προπονητικό προσωπικό μας</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <User className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Ανακάλυψε την ομάδα πιστοποιημένων προπονητών και ειδικών μας</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/trainers" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    Προβολή Προπονητών
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
