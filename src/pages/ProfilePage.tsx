import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import {
  Calendar, Edit, Users, Settings, Package, Loader2,
  Camera, ChevronRight, Gift, ShoppingBag, Dumbbell,
  CalendarDays, UserPlus, Building, Bell, LogOut
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { profileService } from "@/services/apiService";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/apiService";
import { BookingRequests } from "@/components/BookingRequests";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateProfileData } from "@/utils/validation";
import { format, parseISO, differenceInYears } from "date-fns";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'coming-soon';
  disabled?: boolean;
}

const MenuItemRow: React.FC<MenuItem> = ({ icon, label, to, badge, badgeVariant, disabled }) => {
  const content = (
    <div className={`flex items-center justify-between px-4 py-2.5 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/30'}`}>
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge variant={badgeVariant === 'coming-soon' ? 'secondary' : 'default'} className="text-xs">
            {badge}
          </Badge>
        )}
        {!disabled && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
      </div>
    </div>
  );

  if (disabled) {
    return <div className="block">{content}</div>;
  }

  return <Link to={to} className="block">{content}</Link>;
};

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab');

  const [loadingPackages, setLoadingPackages] = useState(false);
  const [activePackages, setActivePackages] = useState<any[]>([]);
  const { user, refreshUser, logout } = useAuth();

  if (!user) {
    return null;
  }

  // Edit profile modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      setEditPhone((user as any).phone || "");
      setEditGender((user as any).gender || "");
    }
  }, [user]);

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

  const isNameLocked = () => {
    return (user as any)?.registration_status === 'completed' && (user as any)?.approved_at !== null;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Δεν έχει οριστεί";
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return "Μη έγκυρη ημερομηνία";
    }
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = parseISO(dateOfBirth);
      return differenceInYears(new Date(), birthDate);
    } catch (error) {
      return null;
    }
  };

  const formatGender = (gender: string | null) => {
    if (!gender) return "Δεν έχει οριστεί";
    const genderMap: { [key: string]: string } = {
      male: "Άνδρας",
      female: "Γυναίκα"
    };
    return genderMap[gender] || "Δεν έχει οριστεί";
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Μη έγκυρο αρχείο",
        description: "Παρακαλώ επιλέξτε μια εικόνα",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Πολύ μεγάλο αρχείο",
        description: "Η εικόνα δεν μπορεί να ξεπερνά τα 2MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setAvatarUploading(true);
      await userService.uploadAvatar(file);
      await refreshUser();
      setAvatarKey(Date.now());
      toast({
        title: "Επιτυχία!",
        description: "Η φωτογραφία προφίλ ενημερώθηκε επιτυχώς"
      });
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: error instanceof Error ? error.message : "Αποτυχία ενημέρωσης φωτογραφίας",
        variant: "destructive"
      });
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποσύνδεσης",
        variant: "destructive"
      });
    }
  };

  const userData = {
    name: user?.name || "Χρήστης",
    email: user?.email || "",
    gender: (user as any)?.gender || null,
    phone: (user as any)?.phone || "",
    dateOfBirth: (user as any)?.date_of_birth || "",
  };

  // Show booking requests if tab parameter is set
  if (activeTab === 'booking-requests') {
    return (
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
            <Link to="/services">
              <Button className="flex items-center gap-2">
                Νέο Αίτημα
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <BookingRequests />
        </main>
      </div>
    );
  }

  // Activities tab menu items
  const activitiesMenuItems: MenuItem[] = [
    { icon: <Calendar className="h-5 w-5" />, label: "Προπονήσεις", to: "/bookings" },
    { icon: <Package className="h-5 w-5" />, label: "Πακέτα", to: "/profile/packages" },
    { icon: <Gift className="h-5 w-5" />, label: "Πρόγραμμα ανταμοιβής", to: "/rewards" },
    { icon: <Dumbbell className="h-5 w-5" />, label: "Προπονητικό κομμάτι", to: "/progress" },
    { icon: <UserPlus className="h-5 w-5" />, label: "Προσκάλεσε έναν φίλο", to: "/referrals" },
    { icon: <ShoppingBag className="h-5 w-5" />, label: "Παραγγελίες", to: "/orders" },
    { icon: <CalendarDays className="h-5 w-5" />, label: "Εκδηλώσεις", to: "/events" },
    {
      icon: <Building className="h-5 w-5" />,
      label: "Συνεργαζόμενες επιχειρήσεις",
      to: "/partners",
      badge: "Σύντομα",
      badgeVariant: 'coming-soon',
      disabled: true
    },
  ];

  const additionalMenuItems: MenuItem[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-0 sm:px-4 py-0 sm:py-6 max-w-5xl mx-auto">
        {/* User Info Section */}
        <div className="bg-red-800 text-white px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                {userData.name}
              </h2>
            </div>
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white" key={avatarKey}>
                <AvatarImage
                  src={(user as any)?.avatar || "/placeholder.svg"}
                  alt={userData.name}
                />
                <AvatarFallback className="text-xl bg-gray-100">
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {/* Green online dot */}
              <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
              {/* Camera button for avatar upload */}
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -left-1 h-7 w-7 rounded-full p-0"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Edit Profile Button */}
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-full bg-transparent border-white text-white hover:bg-white/10"
            onClick={() => setIsEditOpen(true)}
          >
            Επεξεργασία στοιχείων
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-white h-auto p-0">
            <TabsTrigger
              value="activities"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
            >
              Οι δραστηριότητές μου
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
            >
              Λογαριασμός
            </TabsTrigger>
          </TabsList>

          {/* Activities Tab */}
          <TabsContent value="activities" className="mt-0">
            <div className="bg-white pb-24">
              {/* Subtitle */}
              <p className="text-sm text-muted-foreground px-4 py-3">
                Δείτε όλη τη δραστηριότητά σας ως μέλος της επιχείρησης SWEAT 93
              </p>

              {/* Main menu items */}
              <div>
                {activitiesMenuItems.map((item, index) => (
                  <MenuItemRow key={index} {...item} />
                ))}
              </div>

              {/* Additional items */}
              <div>
                {additionalMenuItems.map((item, index) => (
                  <MenuItemRow key={index} {...item} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-0">
            <div className="bg-white pb-24">
              {/* Personal Details */}
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-lg">Προσωπικά Στοιχεία</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{userData.email}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Τηλέφωνο</span>
                    <span className="font-medium">{userData.phone || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Ημερομηνία Γέννησης</span>
                    <span className="font-medium">{formatDate(userData.dateOfBirth)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Φύλο</span>
                    <span className="font-medium">{formatGender(userData.gender)}</span>
                  </div>
                </div>
              </div>

              {/* Settings links */}
              <MenuItemRow
                icon={<Settings className="h-5 w-5" />}
                label="Ρυθμίσεις"
                to="/settings"
              />
              <MenuItemRow
                icon={<Bell className="h-5 w-5" />}
                label="Ειδοποιήσεις"
                to="/notifications"
              />

              {/* Logout */}
              <div className="p-4 mt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Αποσύνδεση
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

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
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isNameLocked()}
                placeholder={isNameLocked() ? "Το όνομα είναι κλειδωμένο μετά την έγκριση" : ""}
              />
              {isNameLocked() && (
                <p className="text-sm text-muted-foreground mt-1">
                  Το όνομα δεν μπορεί να αλλάξει μετά την έγκριση του λογαριασμού
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Τηλέφωνο</Label>
              <Input id="phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="gender">Φύλο</Label>
              <Select value={editGender} onValueChange={setEditGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε φύλο" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Άνδρας</SelectItem>
                  <SelectItem value="female">Γυναίκα</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={savingProfile}>
              Ακύρωση
            </Button>
            <Button
              onClick={async () => {
                if (!user) return;

                const validationData = {
                  name: isNameLocked() ? undefined : editName,
                  email: editEmail,
                  phone: editPhone,
                  gender: editGender,
                };

                const validationErrors = validateProfileData(validationData);

                if (Object.keys(validationErrors).length > 0) {
                  const firstError = Object.values(validationErrors)[0];
                  toast({
                    title: "Μη έγκυρα δεδομένα",
                    description: firstError,
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  setSavingProfile(true);
                  const updateData: any = {
                    email: editEmail,
                    phone: editPhone,
                  };

                  if (!isNameLocked()) {
                    updateData.name = editName;
                  }

                  if (editGender) {
                    updateData.gender = editGender;
                  }

                  await userService.updateProfile(user.id, updateData);
                  toast({ title: "Το προφίλ ενημερώθηκε επιτυχώς" });
                  await refreshUser();
                  setIsEditOpen(false);
                } catch (error) {
                  let errorMessage = "Παρακαλώ δοκιμάστε ξανά";
                  let errorTitle = "Σφάλμα ενημέρωσης προφίλ";

                  if (error instanceof Error) {
                    if (error.message.includes('Το όνομα δεν μπορεί να αλλάξει')) {
                      errorTitle = "Όνομα κλειδωμένο";
                      errorMessage = "Το όνομα δεν μπορεί να αλλάξει μετά την έγκριση του λογαριασμού";
                    } else if (error.message.includes('email χρησιμοποιείται')) {
                      errorTitle = "Email σε χρήση";
                      errorMessage = "Αυτό το email χρησιμοποιείται ήδη από άλλον χρήστη";
                    } else {
                      errorMessage = error.message;
                    }
                  }

                  toast({
                    title: errorTitle,
                    description: errorMessage,
                    variant: "destructive"
                  });
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
    </div>
  );
};

export default ProfilePage;
