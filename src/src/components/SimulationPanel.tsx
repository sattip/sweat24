import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Package, 
  Calendar, 
  Zap, 
  RotateCcw,
  AlertTriangle,
  Gift,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import PushNotificationSample from './notifications/PushNotificationSample';


interface SimulationState {
  packageState: 'normal' | 'expiring-soon' | 'last-session' | 'expired';
  remainingSessions: number;
  totalSessions: number;
  membershipType: string;
  birthdayWeek: boolean;
  lastVisit: string;
  packageStartDate?: string;
  packageEndDate?: string;
}

interface SimulationPanelProps {
  onStateChange?: (state: SimulationState) => void;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ onStateChange }) => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    packageState: 'normal',
    remainingSessions: 10,
    totalSessions: 10,
    membershipType: 'Premium',
    birthdayWeek: false,
    lastVisit: new Date().toISOString().split('T')[0],
    packageStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    packageEndDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [previewNotification, setPreviewNotification] = useState<'booking' | 'reminder' | 'offer' | null>(null);

  const updateSimulationState = (updates: Partial<SimulationState>) => {
    const newState = { ...simulationState, ...updates };
    setSimulationState(newState);
    
    // Store simulation state in localStorage for persistence
    localStorage.setItem('simulation_state', JSON.stringify(newState));
    
    if (onStateChange) {
      onStateChange(newState);
    }

    // Show feedback toast
    toast.success('Η κατάσταση προσομοίωσης ενημερώθηκε');
  };

  const handlePackageStateChange = (state: string) => {
    let remainingSessions = simulationState.remainingSessions;
    let totalSessions = simulationState.totalSessions;
    
    switch (state) {
      case 'expired':
        remainingSessions = 0;
        totalSessions = 10;
        break;
      case 'last-session':
        remainingSessions = 1;
        totalSessions = 10;
        break;
      case 'expiring-soon':
        remainingSessions = 2;
        totalSessions = 10;
        break;
      case 'normal':
        remainingSessions = 10;
        totalSessions = 10;
        break;
    }

    updateSimulationState({
      packageState: state as SimulationState['packageState'],
      remainingSessions,
      totalSessions
    });
  };

  const triggerFakeNotification = (type: 'booking' | 'reminder' | 'offer') => {
    setPreviewNotification(type);
    
    const messages = {
      booking: 'Η κράτησή σας για Power Yoga αύριο στις 10:00 π.μ. επιβεβαιώθηκε!',
      reminder: 'Υπενθύμιση! Το Personal Training σας είναι σε 2 ώρες.',
      offer: 'Μην χάσετε την προσφορά μας! 20% έκπτωση σε όλα τα συμπληρώματα!'
    };

    toast.success(`Ψεύτικη ειδοποίηση στάλθηκε: ${messages[type]}`);

    // Hide preview after 10 seconds
    setTimeout(() => {
      setPreviewNotification(null);
    }, 10000);
  };

  const resetSimulation = () => {
    const defaultState: SimulationState = {
      packageState: 'normal',
      remainingSessions: 10,
      totalSessions: 10,
      membershipType: 'Premium',
      birthdayWeek: false,
      lastVisit: new Date().toISOString().split('T')[0],
      packageStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      packageEndDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setSimulationState(defaultState);
    localStorage.removeItem('simulation_state');
    setPreviewNotification(null);
    
    if (onStateChange) {
      onStateChange(defaultState);
    }

    toast.success('Επαναφορά προσομοίωσης στην αρχική κατάσταση');
  };

  const packageStateOptions = [
    { value: 'normal', label: 'Κανονική (10 συνεδρίες)', icon: Package },
    { value: 'expiring-soon', label: 'Λήγει Σύντομα (2 συνεδρίες)', icon: Clock },
    { value: 'last-session', label: 'Τελευταία Συνεδρία (1 συνεδρία)', icon: AlertTriangle },
    { value: 'expired', label: 'Έληξε (0 συνεδρίες)', icon: AlertTriangle }
  ];


  return (
    <div className="space-y-6">
      {/* Simulation Panel Header */}
      <Card className="border-2 border-dashed border-orange-300 bg-orange-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Πίνακας Προσομοίωσης</CardTitle>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                ΜΟΝΟ ΓΙΑ ADMIN
              </Badge>
            </div>
            <Button onClick={resetSimulation} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Επαναφορά
            </Button>
          </div>
          <CardDescription className="text-orange-700">
            Προσομοίωση διαφόρων καταστάσεων της εφαρμογής για testing και επίδειξη.
            Οι αλλαγές είναι ορατές μόνο στον admin@sweat93.gr και παραμένουν μεταξύ των συνεδριών.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Package State Simulation */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Προσομοίωση Κατάστασης Πακέτου
            </h3>
            <Select
              value={simulationState.packageState}
              onValueChange={handlePackageStateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε κατάσταση πακέτου" />
              </SelectTrigger>
              <SelectContent>
                {packageStateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Special States */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Ειδικές Καταστάσεις
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">Λειτουργία Εβδομάδας Γενεθλίων</span>
              <Button
                onClick={() => updateSimulationState({ birthdayWeek: !simulationState.birthdayWeek })}
                variant={simulationState.birthdayWeek ? "default" : "outline"}
                size="sm"
              >
                {simulationState.birthdayWeek ? 'ΕΝΕΡΓΟ' : 'ΑΝΕΝΕΡΓΟ'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Push Notification Simulation */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Προσομοίωση Push Notifications (Παλιά)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                onClick={() => triggerFakeNotification('booking')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Κράτηση
              </Button>
              <Button
                onClick={() => triggerFakeNotification('reminder')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Υπενθύμιση
              </Button>
              <Button
                onClick={() => triggerFakeNotification('offer')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Προσφορά
              </Button>
            </div>
          </div>



          {/* Current State Display */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Τρέχουσα Κατάσταση Προσομοίωσης</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Πακέτο: <Badge variant="outline">{simulationState.packageState}</Badge></div>
              <div>Συνεδρίες: <Badge variant="outline">{simulationState.remainingSessions}/{simulationState.totalSessions}</Badge></div>
              <div>Εβδομάδα Γενεθλίων: <Badge variant="outline">{simulationState.birthdayWeek ? 'Ναι' : 'Όχι'}</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preview */}
      {previewNotification && (
        <Card className="border-2 border-blue-300 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Προεπισκόπηση Ειδοποίησης
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Έτσι θα εμφανιστεί η ειδοποίηση σε μια κινητή συσκευή
                </CardDescription>
              </div>
              <Button 
                onClick={() => setPreviewNotification(null)} 
                variant="ghost" 
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                Κλείσιμο
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PushNotificationSample type={previewNotification} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimulationPanel;