import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Settings, Info, Package, Calendar } from 'lucide-react';

export const BasicNotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Ειδοποιήσεις</h1>
        <p className="text-muted-foreground">
          Σύστημα ειδοποιήσεων για υπενθυμίσεις
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Κατάσταση Συστήματος
          </CardTitle>
          <CardDescription>
            Το σύστημα ειδοποιήσεων βρίσκεται υπό ανάπτυξη
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Το σύστημα ειδοποιήσεων βρίσκεται στη φάση υλοποίησης. 
              Θα ενεργοποιηθεί σύντομα για να λαμβάνετε υπενθυμίσεις.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Planned Features */}
      <Card>
        <CardHeader>
          <CardTitle>Προγραμματισμένες Λειτουργίες</CardTitle>
          <CardDescription>
            Οι ειδοποιήσεις που θα λαμβάνετε σύντομα
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            
            {/* Package Expiry */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Package className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Λήξη Πακέτου</h4>
                <p className="text-sm text-muted-foreground">
                  Ειδοποιήσεις 1 εβδομάδα και 2 μέρες πριν τη λήξη του πακέτου σας
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    7 μέρες πριν
                  </span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    2 μέρες πριν
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Reminders */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Υπενθύμιση Ραντεβού</h4>
                <p className="text-sm text-muted-foreground">
                  Ειδοποίηση 1 ώρα πριν από κάθε προγραμματισμένο ραντεβού ή μάθημα
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    1 ώρα πριν
                  </span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Development Status */}
      <Card>
        <CardHeader>
          <CardTitle>Κατάσταση Ανάπτυξης</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">📱 Frontend Implementation</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                ✅ Ολοκληρώθηκε
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">🔧 Backend Integration</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                🔄 Σε εξέλιξη
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">🧪 Testing & Deployment</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                ⏳ Αναμονή
              </span>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Το σύστημα ειδοποιήσεων θα ενεργοποιηθεί αυτόματα μόλις ολοκληρωθεί η υλοποίηση στο backend. 
          Δεν χρειάζεται καμία ενέργεια από εσάς.
        </AlertDescription>
      </Alert>
    </div>
  );
};
