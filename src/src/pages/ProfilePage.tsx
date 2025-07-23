import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Calendar, Edit, History, Users, Image, Ruler, Settings, User, Activity, Gift, Package, CreditCard, Euro, Loader2, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoyaltyRewardAlert from "@/components/notifications/LoyaltyRewardAlert";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { packageService } from "@/services/apiService";
import { BookingRequests } from "@/components/BookingRequests";

const ProfilePage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab');
  
  const [isRewardAlertOpen, setIsRewardAlertOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);
        const data = await packageService.getAll();
        // For demo purposes, show first 3 packages as user's active packages
        // In a real app, you'd fetch user's actual purchased packages
        const userPackages = data.slice(0, 3).map((pkg, index) => ({
          id: pkg.id,
          name: pkg.name,
          remaining: [7, 15, 1][index], // Mock remaining sessions
          expiresAt: ['2024-09-15', '2024-08-30', '2024-07-25'][index], // Mock expiry dates
          type: pkg.type
        }));
        setPackages(userPackages);
      } catch (err) {
        console.error('Failed to fetch packages:', err);
        // Fallback to mock data if API fails
        setPackages([
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
        ]);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);
  
  const handleRedeemReward = (reward) => {
    if (reward.status === "Διαθέσιμο") {
      toast({
        title: "Δώρο Εξαργυρώθηκε!",
        description: `Το δώρο "${reward.name}" εξαργυρώθηκε επιτυχώς. Κωδικός: ${reward.code}`,
        duration: 5000,
      });
    }
  };
  
  // Use actual user data from auth context
  const userData = {
    name: user?.name || "Χρήστης",
    email: user?.email || "",
    phone: user?.phone || "+30 6944 123456",
    dateOfBirth: "1990-05-15",
    fitnessGoals: ["Απώλεια Βάρους", "Αύξηση Μυϊκής Μάζας", "Καρδιοαναπνευστική Φυσική Κατάσταση"],
    activePackages: packages,
    financialInfo: {
      packages: [
        {
          id: 1,
          packageName: "Πακέτο 20 Ομαδικών",
          totalAmount: 200,
          paidAmount: 80,
          remainingAmount: 120,
          nextInstallment: {
            amount: 40,
            dueDate: "2024-08-15"
          },
          installments: [
            { amount: 80, date: "2024-07-01", status: "Πληρώθηκε" },
            { amount: 40, date: "2024-08-15", status: "Εκκρεμεί" },
            { amount: 40, date: "2024-09-15", status: "Εκκρεμεί" },
            { amount: 40, date: "2024-10-15", status: "Εκκρεμεί" }
          ]
        },
        {
          id: 2,
          packageName: "Πακέτο 10 EMS",
          totalAmount: 350,
          paidAmount: 150,
          remainingAmount: 200,
          nextInstallment: {
            amount: 100,
            dueDate: "2024-08-20"
          },
          installments: [
            { amount: 150, date: "2024-07-10", status: "Πληρώθηκε" },
            { amount: 100, date: "2024-08-20", status: "Εκκρεμεί" },
            { amount: 100, date: "2024-09-20", status: "Εκκρεμεί" }
          ]
        }
      ]
    },
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

  // Show booking requests if tab parameter is set
  if (activeTab === 'booking-requests') {
    return (
      <>
        <div className="min-h-screen bg-background">
          <Header />
          
          <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <Link to="/profile" className="text-muted-foreground hover:text-foreground text-sm mb-2 inline-block">
                  ← Πίσω στο προφίλ
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold">Αιτήματα Ραντεβού</h1>
              </div>
            </div>
            
            <BookingRequests />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Το Προφίλ μου</h1>
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
                {loadingPackages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : userData.activePackages.length > 0 ? (
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

            {/* Financial Information Section */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Οικονομικά Στοιχεία
                </CardTitle>
                <CardDescription>Η κατάσταση των πληρωμών και των δόσεων σας.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userData.financialInfo.packages.length > 0 ? (
                  <div className="space-y-6">
                    {userData.financialInfo.packages.map((pkg) => {
                      const paymentProgress = (pkg.paidAmount / pkg.totalAmount) * 100;
                      const isNextDueSoon = new Date(pkg.nextInstallment.dueDate) <= new Date(new Date().setDate(new Date().getDate() + 7));
                      
                      return (
                        <div key={pkg.id} className="p-4 rounded-lg border bg-muted/20">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-lg">{pkg.packageName}</h3>
                            <Badge variant={pkg.remainingAmount > 0 ? "destructive" : "default"}>
                              {pkg.remainingAmount > 0 ? "Εκκρεμεί Πληρωμή" : "Πληρωμένο"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-background rounded-md">
                              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                                <Euro className="h-4 w-4" />
                                {pkg.totalAmount}
                              </div>
                              <p className="text-sm text-muted-foreground">Συνολικό Ποσό</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-md">
                              <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-700">
                                <Euro className="h-4 w-4" />
                                {pkg.paidAmount}
                              </div>
                              <p className="text-sm text-green-600">Πληρωμένο</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-md">
                              <div className="flex items-center justify-center gap-1 text-lg font-bold text-red-700">
                                <Euro className="h-4 w-4" />
                                {pkg.remainingAmount}
                              </div>
                              <p className="text-sm text-red-600">Υπόλοιπο</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>Πρόοδος πληρωμής</span>
                              <span>{Math.round(paymentProgress)}%</span>
                            </div>
                            <Progress value={paymentProgress} className="h-2" />
                          </div>

                          {pkg.remainingAmount > 0 && (
                            <div className={`p-3 rounded-md ${isNextDueSoon ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Επόμενη Δόση</p>
                                  <p className="text-sm text-muted-foreground">
                                    Λήξη: {new Date(pkg.nextInstallment.dueDate).toLocaleDateString('el-GR')}
                                  </p>
                                  {isNextDueSoon && (
                                    <p className="text-xs text-orange-600 font-medium mt-1">
                                      ⚠️ Λήγει σύντομα
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-xl font-bold">
                                    <Euro className="h-5 w-5" />
                                    {pkg.nextInstallment.amount}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                              Προβολή αναλυτικών δόσεων
                            </summary>
                            <div className="mt-3 space-y-2">
                              {pkg.installments.map((installment, index) => (
                                <div key={index} className="flex justify-between items-center py-2 px-3 bg-background rounded text-sm">
                                  <div>
                                    <span>Δόση {index + 1}</span>
                                    <span className="text-muted-foreground ml-2">
                                      ({new Date(installment.date).toLocaleDateString('el-GR')})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">€{installment.amount}</span>
                                    <Badge variant={installment.status === "Πληρώθηκε" ? "default" : "secondary"} className="text-xs">
                                      {installment.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Δεν υπάρχουν οικονομικά στοιχεία προς εμφάνιση.
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  💡 Για οποιαδήποτε απορία σχετικά με τις πληρωμές σας, επικοινωνήστε μαζί μας.
                </p>
              </CardFooter>
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
              <Link to="/profile?tab=booking-requests" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <FileText className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Αιτήματα Ραντεβού</h3>
                      <p className="text-sm text-muted-foreground">Παρακολουθήστε την κατάσταση των αιτημάτων EMS/Personal Training</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
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
              
              <Link to="/progress" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <Activity className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Έλεγχος Προόδου</h3>
                      <p className="text-sm text-muted-foreground">Παρακολουθήστε την πρόοδό σας με φωτογραφίες και μετρήσεις</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/services" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <User className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Personal & EMS</h3>
                      <p className="text-sm text-muted-foreground">Κλείστε ραντεβού για εξειδικευμένες υπηρεσίες</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/rewards" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <Gift className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Πρόγραμμα Ανταμοιβής</h3>
                      <p className="text-sm text-muted-foreground">Κερδίστε πόντους και εξαργυρώστε υπέροχα δώρα</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/referrals" className="block">
                <Card className="shadow-sm hover:border-primary transition-colors h-full">
                  <CardContent className="flex items-center p-4">
                    <Users className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <h3 className="font-medium">Πρόγραμμα Συστάσεων</h3>
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
