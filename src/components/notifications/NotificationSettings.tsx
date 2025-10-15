import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Package, 
  Send,
  Settings,
  Clock
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';

export const NotificationSettings: React.FC = () => {
  const {
    isInitialized,
    permissionsGranted,
    userNotifications,
    loading,
    error,
    requestPermissions,
    sendTestNotification,
    cancelNotification,
    refreshNotifications
  } = useNotifications();

  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testBody, setTestBody] = useState('Αυτή είναι μια δοκιμαστική ειδοποίηση!');
  const [sendingTest, setSendingTest] = useState(false);

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      await sendTestNotification(testTitle, testBody);
    } catch (error) {
      // Error handled by the hook
    } finally {
      setSendingTest(false);
    }
  };

  const handleCancelNotification = async (notificationId: string) => {
    try {
      await cancelNotification(notificationId);
    } catch (error) {
      // Error handled by the hook
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    if (type.includes('package')) return <Package className="h-4 w-4" />;
    if (type.includes('appointment')) return <Calendar className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const getNotificationTypeBadge = (type: string) => {
    if (type.includes('package_expiry_week')) return <Badge variant="outline">Λήξη Πακέτου - 1 Εβδομάδα</Badge>;
    if (type.includes('package_expiry_2days')) return <Badge variant="destructive">Λήξη Πακέτου - 2 Μέρες</Badge>;
    if (type.includes('appointment')) return <Badge variant="secondary">Υπενθύμιση Ραντεβού</Badge>;
    return <Badge>{type}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Κατάσταση Ειδοποιήσεων
          </CardTitle>
          <CardDescription>
            Διαχειριστείτε τις ειδοποιήσεις της εφαρμογής
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Initialization Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isInitialized ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Label>Υπηρεσία Ειδοποιήσεων</Label>
            </div>
            <Badge variant={isInitialized ? "default" : "destructive"}>
              {isInitialized ? "Ενεργή" : "Ανενεργή"}
            </Badge>
          </div>

          {/* Permissions Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {permissionsGranted ? (
                <Bell className="h-5 w-5 text-green-500" />
              ) : (
                <BellOff className="h-5 w-5 text-orange-500" />
              )}
              <Label>Άδειες Ειδοποιήσεων</Label>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={permissionsGranted ? "default" : "secondary"}>
                {permissionsGranted ? "Ενεργές" : "Ανενεργές"}
              </Badge>
              {!permissionsGranted && (
                <Button size="sm" onClick={requestPermissions} disabled={loading}>
                  Ενεργοποίηση
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Notifications */}
      {permissionsGranted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Δοκιμαστική Ειδοποίηση
            </CardTitle>
            <CardDescription>
              Στείλτε μια δοκιμαστική ειδοποίηση για να ελέγξετε τη λειτουργία
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testTitle">Τίτλος</Label>
              <Input
                id="testTitle"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Εισάγετε τίτλο ειδοποίησης"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testBody">Περιεχόμενο</Label>
              <Input
                id="testBody"
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                placeholder="Εισάγετε περιεχόμενο ειδοποίησης"
              />
            </div>
            <Button 
              onClick={handleSendTest} 
              disabled={sendingTest || !testTitle || !testBody}
              className="w-full"
            >
              {sendingTest ? "Αποστολή..." : "Αποστολή Δοκιμαστικής Ειδοποίησης"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Προγραμματισμένες Ειδοποιήσεις
          </CardTitle>
          <CardDescription>
            Οι ειδοποιήσεις που έχουν προγραμματιστεί για εσάς
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Φόρτωση ειδοποιήσεων...</p>
            </div>
          ) : userNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Δεν υπάρχουν προγραμματισμένες ειδοποιήσεις</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userNotifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getNotificationTypeIcon(notification.type)}
                        <h4 className="font-medium">{notification.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                      <div className="flex items-center gap-2">
                        {getNotificationTypeBadge(notification.type)}
                        <Badge variant="outline">
                          {formatDateTime(notification.scheduledFor.toString())}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelNotification(notification.id)}
                    >
                      Ακύρωση
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={refreshNotifications}
                disabled={loading}
                className="w-full"
              >
                Ανανέωση Λίστας
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
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Λήξη Πακέτου</p>
              <p className="text-sm text-muted-foreground">
                1 εβδομάδα και 2 μέρες πριν τη λήξη του πακέτου σας
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Υπενθύμιση Ραντεβού</p>
              <p className="text-sm text-muted-foreground">
                1 ώρα πριν από κάθε προγραμματισμένο ραντεβού ή μάθημα
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
