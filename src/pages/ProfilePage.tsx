import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Calendar, Edit, Users, User, Settings, Package, Loader2, FileText, Activity } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { profileService } from "@/services/apiService";
import { Badge } from "@/components/ui/badge";
// Αφαιρέθηκαν mock ειδοποιήσεις/loyalty
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/apiService";
import { BookingRequests } from "@/components/BookingRequests";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ProfilePage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab');
  
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [activePackages, setActivePackages] = useState<any[]>([]);
  const { user, refreshUser } = useAuth();
  // Αν δεν υπάρχει χρήστης, μην αποδίδεις τίποτα (το ProtectedRoute θα χειριστεί redirect)
  if (!user) {
    return null;
  }
  
  // Edit profile modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Δεν φορτώνουμε πλέον mock πακέτα. Θα βασιστούμε μόνο στα πραγματικά πεδία του χρήστη από το auth context.

  // Prefill edit form when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      setEditPhone((user as any).phone || "");
    }
  }, [user]);

  // Fetch active packages from profile API
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoadingPackages(true);
        const pkgs = await profileService.getActivePackages();
        setActivePackages(Array.isArray(pkgs) ? pkgs : []);
      } catch (e) {
        setActivePackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };
    loadPackages();
  }, []);
  
  // Πραγματικά δεδομένα χρήστη από το auth context (χωρίς mock sections)
  const activePkg = (Array.isArray(activePackages) && activePackages.length > 0)
    ? activePackages.find((p: any) => p?.status === 'active')
    : ((user as any)?.active_package || (Array.isArray((user as any)?.user_packages) ? (user as any).user_packages.find((p: any) => p?.status === 'active') : null));

  const userData = {
    name: user?.name || "Χρήστης",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
    dateOfBirth: user?.birth_date || "",
    activePackage: {
      exists: Boolean(activePkg) || (user?.remaining_sessions === null) || ((user?.remaining_sessions ?? 0) > 0),
      name: "Συνδρομή",
      type: activePkg?.package?.name || activePkg?.package_name || user?.membership_type || "",
      remaining: (activePkg?.remaining_sessions !== undefined ? activePkg.remaining_sessions : (user as any)?.remaining_sessions) ?? null,
      expiresAt: activePkg?.expires_at || user?.package_end_date || null,
    },
  } as const;

  const fitnessGoals: string[] = Array.isArray((user as any)?.fitness_goals)
    ? (user as any).fitness_goals
    : [];

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-background/20 hover:bg-background/40 text-white"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="pt-20 pb-6">
                <h2 className="text-2xl font-bold">{userData.name}</h2>
              </CardContent>
            </Card>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Επεξεργασία Προσωπικών Στοιχείων</DialogTitle>
                  <DialogDescription>
                    Ενημερώστε το ονοματεπώνυμο, το email και το τηλέφωνο σας.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ονοματεπώνυμο</Label>
                    <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Τηλέφωνο</Label>
                    <Input id="phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={savingProfile}>Ακύρωση</Button>
                  <Button
                    onClick={async () => {
                      if (!user) return;
                      try {
                        setSavingProfile(true);
                        await userService.updateProfile(user.id, {
                          name: editName,
                          email: editEmail,
                          phone: editPhone,
                        });
                        toast({ title: "Το προφίλ ενημερώθηκε επιτυχώς" });
                        await refreshUser();
                        setIsEditOpen(false);
                      } catch (error) {
                        console.error(error);
                        toast({ title: "Σφάλμα ενημέρωσης προφίλ", description: "Παρακαλώ δοκιμάστε ξανά", variant: "destructive" });
                      } finally {
                        setSavingProfile(false);
                      }
                    }}
                    disabled={savingProfile}
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Αποθήκευση"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* My Packages Section - χωρίς mock */}
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
                ) : userData.activePackage.exists ? (
                  <div className="p-4 rounded-lg border bg-muted/20">
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{userData.activePackage.name}</h3>
                          {userData.activePackage.type && (
                            <Badge variant="outline">{userData.activePackage.type}</Badge>
                          )}
                        </div>
                        {userData.activePackage.expiresAt && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Λήγει στις: {new Date(userData.activePackage.expiresAt).toLocaleDateString('el-GR')}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                        {userData.activePackage.remaining === null || userData.activePackage.remaining === undefined ? (
                          <>
                            <p className="text-2xl font-bold text-primary">Απεριόριστο</p>
                            <p className="text-sm text-muted-foreground">πακέτο</p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-primary">{userData.activePackage.remaining}</p>
                            <p className="text-sm text-muted-foreground">συνεδρίες</p>
                          </>
                        )}
                      </div>
                    </div>
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
                  Οικονομικά Στοιχεία
                </CardTitle>
                <CardDescription>Η κατάσταση των πληρωμών και των δόσεων σας.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Array.isArray((user as any)?.financialInfo?.packages) && (user as any).financialInfo.packages.length > 0 ? (
                  <div className="space-y-6">
                    {(user as any).financialInfo.packages.map((pkg: any) => {
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
                                €{pkg.totalAmount}
                              </div>
                              <p className="text-sm text-muted-foreground">Συνολικό Ποσό</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-md">
                              <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-700">
                                €{pkg.paidAmount}
                              </div>
                              <p className="text-sm text-green-600">Πληρωμένο</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-md">
                              <div className="flex items-center justify-center gap-1 text-lg font-bold text-red-700">
                                €{pkg.remainingAmount}
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
                                    €{pkg.nextInstallment.amount}
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
                      Πρόγραμμα Πιστότητας
                    </CardTitle>
                    <CardDescription>Οι πόντοι και τα διαθέσιμα δώρα σας</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-medium text-md text-foreground">Τα Δώρα μου</h4>
                {Array.isArray((user as any)?.rewards) && (user as any).rewards.length > 0 ? (
                  <div className="divide-y">
                    {(user as any).rewards.map((reward: any) => (
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
                                  Σύσταση
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
                {fitnessGoals.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <p className="text-sm text-muted-foreground">Στόχοι Φυσικής Κατάστασης</p>
                    <div className="flex flex-wrap gap-2">
                      {fitnessGoals.map((goal, index) => (
                        <div key={index} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                          {goal}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Activity Summary - αφαιρέθηκε (mock data) */}
            
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
                    <span className="h-5 w-5 mr-4 text-primary">🎁</span>
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
      {/* LoyaltyRewardAlert αφαιρέθηκε */}
    </>
  );
};

export default ProfilePage;
