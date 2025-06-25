import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Calendar, Edit, History, Users, Image, Ruler, Settings, User, Activity, Gift, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoyaltyRewardAlert from "@/components/notifications/LoyaltyRewardAlert";
import { useToast } from "@/components/ui/use-toast";

const ProfilePage = () => {
  const [isRewardAlertOpen, setIsRewardAlertOpen] = useState(false);
  const { toast } = useToast();
  
  const handleRedeemReward = (reward) => {
    if (reward.status === "Διαθέσιμο") {
      toast({
        title: "Δώρο Εξαργυρώθηκε!",
        description: `Το δώρο "${reward.name}" εξαργυρώθηκε επιτυχώς. Κωδικός: ${reward.code}`,
        duration: 5000,
      });
    }
  };
  
  // Mock user data for the profile
  const userData = {
    name: "Γιάννης Παπαδόπουλος",
    email: "giannis.papadopoulos@example.com",
    phone: "+30 6944 123456",
    dateOfBirth: "1990-05-15",
    fitnessGoals: ["Απώλεια Βάρους", "Αύξηση Μυϊκής Μάζας", "Καρδιοαναπνευστική Φυσική Κατάσταση"],
    activePackages: [
      {
        id: "pkg_1",
        name: "Πακέτο 10 EMS",
        remaining: 7,
        expiresAt: "2024-09-15",
        type: "EMS"
      },
      {
        id: "pkg_2",
        name: "Πακέτο 20 Ομαδικών",
        remaining: 15,
        expiresAt: "2024-08-30",
        type: "Ομαδικά"
      },
       {
        id: "pkg_3",
        name: "Πακέτο 5 Yoga",
        remaining: 1,
        expiresAt: "2024-07-25",
        type: "Yoga"
      }
    ],
    activity: {
      totalWorkouts: 52,
      totalMinutes: 2500,
      caloriesBurned: 32500,
    },
    loyaltyPoints: 1250,
    rewards: [
      {
        id: 1,
        type: "birthday",
        name: "Δωρεάν Προσωπική Προπόνηση",
        code: "BDAYPT2023",
        status: "Διαθέσιμο",
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      },
      {
        id: 2,
        type: "referral",
        name: "Δωρεάν Προπόνηση",
        code: "REF123456",
        status: "Διαθέσιμο",
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      }
    ]
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Το Προφίλ μου</h1>
          </div>
          
          <div className="space-y-6">
            {/* Profile Header */}
            <Card className="border shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary h-32 relative">
                <div className="absolute -bottom-16 left-6 flex items-end">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src="/placeholder.svg" alt={userData.name} />
                    <AvatarFallback className="text-2xl">{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-background/20 hover:bg-background/40 text-white">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="pt-20 pb-6">
                <h2 className="text-2xl font-bold">{userData.name}</h2>
              </CardContent>
            </Card>
            
            {/* My Packages Section */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Τα Πακέτα μου
                </CardTitle>
                <CardDescription>Τα ενεργά πακέτα προπονήσεων και το υπόλοιπό τους.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.activePackages.length > 0 ? (
                  <div className="space-y-4">
                    {userData.activePackages.map((pkg) => (
                      <div key={pkg.id} className="p-4 rounded-lg border bg-muted/20">
                        <div className="flex flex-col md:flex-row justify-between md:items-center">
                          <div>
                             <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{pkg.name}</h3>
                              <Badge variant="outline">{pkg.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Λήγει στις: {new Date(pkg.expiresAt).toLocaleDateString('el-GR')}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0 text-right">
                            <p className="text-2xl font-bold text-primary">{pkg.remaining}</p>
                            <p className="text-sm text-muted-foreground">συνεδρίες</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Δεν έχετε ενεργά πακέτα.
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* My Rewards Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      Πρόγραμμα Πιστότητας
                    </CardTitle>
                    <CardDescription>Οι πόντοι και τα διαθέσιμα δώρα σας</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{userData.loyaltyPoints}</p>
                    <p className="text-sm text-muted-foreground">πόντοι</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-medium text-md text-foreground">Τα Δώρα μου</h4>
                {userData.rewards.length > 0 ? (
                  <div className="divide-y">
                    {userData.rewards.map((reward) => (
                      <div 
                        key={reward.id} 
                        className={`py-3 first:pt-0 last:pb-0 ${
                          reward.status === "Διαθέσιμο" ? "cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors" : ""
                        }`}
                        onClick={() => handleRedeemReward(reward)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{reward.name}</h3>
                              {reward.type === "birthday" && (
                                <div className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full">
                                  Γενέθλια
                                </div>
                              )}
                              {reward.type === "referral" && (
                                <div className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                  Παραπομπή
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">Κωδικός: {reward.code}</p>
                            <p className="text-sm text-muted-foreground">
                              Λήγει: {new Date(reward.expiresAt).toLocaleDateString()}
                            </p>
                            {reward.status === "Διαθέσιμο" && (
                              <p className="text-xs text-primary font-medium mt-1">👆 Κλικ για εξαργύρωση</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <div className={`px-3 py-1 rounded-full text-sm ${
                              reward.status === "Διαθέσιμο" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {reward.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Δεν υπάρχουν διαθέσιμα δώρα αυτή τη στιγμή.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="secondary" 
                  className="w-full sm:w-auto"
                  onClick={() => setIsRewardAlertOpen(true)}
                >
                  Προσομοίωση Ειδοποίησης Δώρου
                </Button>
                <Link to="/referrals" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    Παράπεμψε Φίλους & Κέρδισε Περισσότερα Δώρα
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Personal Details Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Προσωπικές Λεπτομέρειες</CardTitle>
                    <CardDescription>Οι στοιχεία επικοινωνίας και προσωπικές πληροφορίες σας</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Edit className="h-4 w-4" /> Επεξεργασία
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Τηλέφωνο</p>
                    <p className="font-medium">{userData.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ημερομηνία Γέννησης</p>
                    <p className="font-medium">{new Date(userData.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ηλικία</p>
                    <p className="font-medium">
                      {new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear()} χρόνια
                    </p>
                  </div>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-sm text-muted-foreground">Στόχοι Φυσικής Κατάστασης</p>
                  <div className="flex flex-wrap gap-2">
                    {userData.fitnessGoals.map((goal, index) => (
                      <div key={index} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                        {goal}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Activity Summary */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Σύνοψη Δραστηριότητας</CardTitle>
                <CardDescription>Τα επιτεύγματά σας στη φυσική κατάσταση μέχρι τώρα</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{userData.activity.totalWorkouts}</div>
                    <p className="text-sm text-muted-foreground">Συνολικές Προπονήσεις</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{userData.activity.totalMinutes}</div>
                    <p className="text-sm text-muted-foreground">Συνολικά Λεπτά</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{userData.activity.caloriesBurned.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Καμένες Θερμίδες</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/bookings" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <Calendar className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Επερχόμενα Μαθήματα</h3>
                      <p className="text-sm text-muted-foreground">Προβολή και διαχείριση των κρατήσεων μαθημάτων σας</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/history" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <History className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Ιστορικό Προπονήσεων</h3>
                      <p className="text-sm text-muted-foreground">Δείτε τις προηγούμενες προπονήσεις και επιτεύγματά σας</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/progress-photos" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <Image className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Φωτογραφίες Προόδου</h3>
                      <p className="text-sm text-muted-foreground">Παρακολουθήστε τη φυσική σας μεταμόρφωση</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/body-measurements" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <Ruler className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Σωματικές Μετρήσεις</h3>
                      <p className="text-sm text-muted-foreground">Παρακολουθήστε τη φυσική σας πρόοδο</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/referrals" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <Users className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Πρόγραμμα Παραπομπών</h3>
                      <p className="text-sm text-muted-foreground">Προσκαλέστε φίλους και κερδίστε δώρα</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/settings" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <Settings className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Ρυθμίσεις</h3>
                      <p className="text-sm text-muted-foreground">Διαχειριστείτε τις προτιμήσεις της εφαρμογής</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>

      <LoyaltyRewardAlert 
        open={isRewardAlertOpen}
        onOpenChange={setIsRewardAlertOpen}
        pointsEarned={150}
        rewardName="Έκπτωση 20% σε αξεσουάρ"
        rewardExpiresInDays={15}
      />
    </>
  );
};

export default ProfilePage;
