import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Settings, Info } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';

export const SafeNotificationSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleRequestPermissions = async () => {
    try {
      setLoading(true);
      const granted = await notificationService.requestPermissions();
      setPermissionsGranted(granted);
      
      if (granted) {
        toast.success('Οι ειδοποιήσεις ενεργοποιήθηκαν!');
        setIsInitialized(true);
      } else {
        toast.error('Δεν δόθηκε άδεια για ειδοποιήσεις');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      toast.error('Σφάλμα κατά την αίτηση αδειών');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setLoading(true);
      const success = await notificationService.initialize();
      setIsInitialized(success);
      
      if (success) {
        const permissions = await notificationService.areNotificationsEnabled();
        setPermissionsGranted(permissions);
        toast.success('Το σύστημα ειδοποιήσεων ενεργοποιήθηκε!');
      } else {
        toast.error('Αποτυχία ενεργοποίησης ειδοποιήσεων');
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      toast.error('Σφάλμα κατά την ενεργοποίηση');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setLoading(true);
      await notificationService.sendTestNotification(
        'Test Ειδοποίηση',
        'Αυτή είναι μια δοκιμαστική ειδοποίηση από το SWEAT93!'
      );
      toast.success('Δοκιμαστική ειδοποίηση στάλθηκε!');
    } catch (error) {
      console.error('Test notification failed:', error);
      toast.error('Αποτυχία αποστολής δοκιμαστικής ειδοποίησης');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Ειδοποιήσεις</h1>
        <p className="text-muted-foreground">
          Διαχειριστείτε τις ειδοποιήσεις της εφαρμογής
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Κατάσταση Ειδοποιήσεων
          </CardTitle>
          <CardDescription>
            Ενεργοποιήστε τις ειδοποιήσεις για να λαμβάνετε υπενθυμίσεις
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInitialized && (
            <div className="space-y-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Οι ειδοποιήσεις δεν είναι ενεργοποιημένες. Κάντε κλικ παρακάτω για ενεργοποίηση.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleInitialize} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Ενεργοποίηση..." : "Ενεργοποίηση Ειδοποιήσεων"}
              </Button>
            </div>
          )}

          {isInitialized && !permissionsGranted && (
            <div className="space-y-3">
              <Alert variant="destructive">
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Χρειάζεται άδεια για αποστολή ειδοποιήσεων.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleRequestPermissions} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Αίτηση αδειών..." : "Αίτηση Αδειών Ειδοποιήσεων"}
              </Button>
            </div>
          )}

          {isInitialized && permissionsGranted && (
            <div className="space-y-3">
              <Alert className="border-green-200 bg-green-50">
                <Bell className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Οι ειδοποιήσεις είναι ενεργές! Θα λαμβάνετε υπενθυμίσεις για ραντεβού και λήξη πακέτων.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleSendTest} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Αποστολή..." : "Αποστολή Δοκιμαστικής Ειδοποίησης"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Τύποι Ειδοποιήσεων</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">📅 Λήξη Πακέτου</h4>
              <p className="text-sm text-muted-foreground">
                Ειδοποιήσεις 1 εβδομάδα και 2 μέρες πριν τη λήξη του πακέτου σας
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">⏰ Υπενθύμιση Ραντεβού</h4>
              <p className="text-sm text-muted-foreground">
                Ειδοποίηση 1 ώρα πριν από κάθε προγραμματισμένο ραντεβού ή μάθημα
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Οι ειδοποιήσεις θα ενεργοποιηθούν πλήρως μόλις ολοκληρωθεί η υλοποίηση στο backend.
        </AlertDescription>
      </Alert>
    </div>
  );
};
