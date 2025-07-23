import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { Settings, User, Bell, Shield, Save } from "lucide-react";

interface AdminSettingsModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

export function AdminSettingsModal({ 
  isOpen, 
  onOpenChange, 
  triggerButton = true 
}: AdminSettingsModalProps) {
  const { toast } = useToast();
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "Διαχειριστής Γυμναστηρίου",
    email: "admin@sweat24.gr",
    phone: "6944123456",
    position: "Γενικός Διευθυντής",
  });

  // Notification Preferences
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    dailyReports: true,
    weeklyReports: true,
    newMemberAlerts: true,
    paymentAlerts: true,
    trainerAlerts: true,
  });

  // System Preferences
  const [systemSettings, setSystemSettings] = useState({
    language: "el",
    timezone: "Europe/Athens",
    dateFormat: "dd/MM/yyyy",
    currency: "EUR",
    autoLogout: "30",
    theme: "light",
  });

  const handleSaveProfile = () => {
    toast({
      title: "Προφίλ Ενημερώθηκε! ✅",
      description: "Οι ρυθμίσεις του προφίλ σας αποθηκεύτηκαν επιτυχώς.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Ειδοποιήσεις Ενημερώθηκαν! 🔔",
      description: "Οι προτιμήσεις ειδοποιήσεων σας αποθηκεύτηκαν.",
    });
  };

  const handleSaveSystem = () => {
    toast({
      title: "Ρυθμίσεις Συστήματος Ενημερώθηκαν! ⚙️",
      description: "Οι προτιμήσεις συστήματος σας αποθηκεύτηκαν.",
    });
  };

  const content = (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Ρυθμίσεις Διαχειριστή
        </DialogTitle>
        <DialogDescription>
          Διαχείριση προφίλ και προτιμήσεων του λογαριασμού σας
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Προφίλ
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Ειδοποιήσεις
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Σύστημα
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ονοματεπώνυμο</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="position">Θέση</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData(prev => ({...prev, position: e.target.value}))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Τηλέφωνο</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
              />
            </div>

            <Button onClick={handleSaveProfile} className="w-fit">
              <Save className="h-4 w-4 mr-2" />
              Αποθήκευση Προφίλ
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-4">
              <h4 className="font-medium">Γενικές Ειδοποιήσεις</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Ειδοποιήσεις</Label>
                  <p className="text-sm text-muted-foreground">Λήψη ειδοποιήσεων μέσω email</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, emailNotifications: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Ειδοποιήσεις</Label>
                  <p className="text-sm text-muted-foreground">Ειδοποιήσεις στην εφαρμογή</p>
                </div>
                <Switch 
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, pushNotifications: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Ειδοποιήσεις</Label>
                  <p className="text-sm text-muted-foreground">Κρίσιμες ειδοποιήσεις μέσω SMS</p>
                </div>
                <Switch 
                  checked={notificationSettings.smsAlerts}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, smsAlerts: checked}))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Αναφορές</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ημερήσιες Αναφορές</Label>
                  <p className="text-sm text-muted-foreground">Καθημερινή αναφορά δραστηριότητας</p>
                </div>
                <Switch 
                  checked={notificationSettings.dailyReports}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, dailyReports: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Εβδομαδιαίες Αναφορές</Label>
                  <p className="text-sm text-muted-foreground">Συγκεντρωτική εβδομαδιαία αναφορά</p>
                </div>
                <Switch 
                  checked={notificationSettings.weeklyReports}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, weeklyReports: checked}))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Επιχειρησιακές Ειδοποιήσεις</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Νέοι Πελάτες</Label>
                  <p className="text-sm text-muted-foreground">Ειδοποίηση για νέες εγγραφές</p>
                </div>
                <Switch 
                  checked={notificationSettings.newMemberAlerts}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, newMemberAlerts: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Πληρωμές</Label>
                  <p className="text-sm text-muted-foreground">Ειδοποιήσεις πληρωμών και δόσεων</p>
                </div>
                <Switch 
                  checked={notificationSettings.paymentAlerts}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, paymentAlerts: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Προπονητές</Label>
                  <p className="text-sm text-muted-foreground">Ειδοποιήσεις από προπονητές</p>
                </div>
                <Switch 
                  checked={notificationSettings.trainerAlerts}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, trainerAlerts: checked}))}
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications} className="w-fit">
              <Save className="h-4 w-4 mr-2" />
              Αποθήκευση Ειδοποιήσεων
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Γλώσσα</Label>
                <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings(prev => ({...prev, language: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="el">🇬🇷 Ελληνικά</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ζώνη Ώρας</Label>
                <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({...prev, timezone: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Athens">Europe/Athens</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Μορφή Ημερομηνίας</Label>
                <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings(prev => ({...prev, dateFormat: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Νόμισμα</Label>
                <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings(prev => ({...prev, currency: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Αυτόματη Αποσύνδεση</Label>
                <Select value={systemSettings.autoLogout} onValueChange={(value) => setSystemSettings(prev => ({...prev, autoLogout: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 λεπτά</SelectItem>
                    <SelectItem value="30">30 λεπτά</SelectItem>
                    <SelectItem value="60">1 ώρα</SelectItem>
                    <SelectItem value="never">Ποτέ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Θέμα</Label>
                <Select value={systemSettings.theme} onValueChange={(value) => setSystemSettings(prev => ({...prev, theme: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Φωτεινό</SelectItem>
                    <SelectItem value="dark">🌙 Σκοτεινό</SelectItem>
                    <SelectItem value="auto">🔄 Αυτόματο</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveSystem} className="w-fit">
              <Save className="h-4 w-4 mr-2" />
              Αποθήκευση Ρυθμίσεων
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );

  if (triggerButton) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Ρυθμίσεις Προφίλ
          </Button>
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
} 