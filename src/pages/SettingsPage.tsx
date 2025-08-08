
import React, { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    bookings: true,
    promotions: true,
    referrals: true,
  });

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications((previousSettings) => {
      const updatedSettings = { ...previousSettings, [type]: !previousSettings[type] };
      toast.success(`${updatedSettings[type] ? 'Ενεργοποιήθηκαν' : 'Απενεργοποιήθηκαν'} οι ειδοποιήσεις`);
      return updatedSettings;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-6 max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Ρυθμίσεις</h1>
          <p className="text-muted-foreground mt-2">Προσαρμόστε την εμπειρία χρήσης της εφαρμογής</p>
        </div>

        {/* Ρυθμίσεις ειδοποιήσεων */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-3 text-muted-foreground" />
                <p className="font-medium">Ρυθμίσεις Ειδοποιήσεων</p>
              </div>
              <p className="text-sm text-muted-foreground ml-8">Διαχείριση ρυθμίσεων ειδοποιήσεων</p>
            </div>

            <Separator />

            <div className="p-4 flex items-center justify-between">
              <p>Επιβεβαιώσεις Κρατήσεων & Υπενθυμίσεις</p>
              <Switch
                checked={notifications.bookings}
                onCheckedChange={() => handleNotificationChange("bookings")}
              />
            </div>

            <Separator />

            <div className="p-4 flex items-center justify-between">
              <p>Προωθήσεις & Ανακοινώσεις</p>
              <Switch
                checked={notifications.promotions}
                onCheckedChange={() => handleNotificationChange("promotions")}
              />
            </div>

            <Separator />

            <div className="p-4 flex items-center justify-between">
              <p>Ενημερώσεις Προγράμματος Ανταμοιβών</p>
              <Switch
                checked={notifications.referrals}
                onCheckedChange={() => handleNotificationChange("referrals")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Νομικά κείμενα */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto font-normal text-base"
              onClick={() => toast.info("Η Πολιτική Απορρήτου θα είναι σύντομα διαθέσιμη!")}
            >
              <span>Πολιτική Απορρήτου</span>
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Separator />

            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto font-normal text-base"
              onClick={() => toast.info("Οι Όροι Χρήσης θα είναι σύντομα διαθέσιμοι!")}
            >
              <span>Όροι Χρήσης</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">Έκδοση 1.0.0</div>
      </main>
    </div>
  );
};

export default SettingsPage;
