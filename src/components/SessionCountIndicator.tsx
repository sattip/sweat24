import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface SessionCountIndicatorProps {
  usedSessions: number;
  totalSessions: number;
  remainingSessions: number;
  membershipType: string;
}

interface UpsellSuggestion {
  from: string;
  to: string;
  benefit: string;
}

const SessionCountIndicator: React.FC<SessionCountIndicatorProps> = ({
  usedSessions,
  totalSessions,
  remainingSessions,
  membershipType
}) => {
  const [showUpsellDialog, setShowUpsellDialog] = React.useState(false);
  
  // Determine if we need to show warning
  const showWarning = remainingSessions <= 2 && remainingSessions > 0;
  const isLastSession = remainingSessions === 1;
  const isSecondToLast = remainingSessions === 2;
  
  // Get variant based on remaining sessions
  const getVariant = () => {
    if (remainingSessions === 0) return 'destructive';
    if (remainingSessions <= 2) return 'secondary';
    if (remainingSessions <= 3) return 'outline';
    return 'default';
  };

  // Get upsell suggestions based on current membership
  const getUpsellSuggestion = (): UpsellSuggestion => {
    const suggestions: Record<string, UpsellSuggestion> = {
      'Μηνιαίο': { from: 'Μηνιαίο', to: 'Τρίμηνο', benefit: '20% έκπτωση ανά μήνα' },
      'Τρίμηνο': { from: 'Τρίμηνο', to: 'Εξάμηνο', benefit: '30% έκπτωση ανά μήνα' },
      'Εξάμηνο': { from: 'Εξάμηνο', to: 'Ετήσιο', benefit: '40% έκπτωση ανά μήνα + 1 μήνα δώρο' },
      'Basic': { from: 'Basic', to: 'Premium', benefit: 'Απεριόριστες συνεδρίες' },
      'Premium': { from: 'Premium', to: 'VIP', benefit: 'Personal Training + Διατροφή' }
    };
    
    return suggestions[membershipType] || suggestions['Basic'];
  };

  const handleIndicatorClick = () => {
    if (showWarning) {
      setShowUpsellDialog(true);
    }
  };

  const upsell = getUpsellSuggestion();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`font-medium ${showWarning ? 'animate-pulse cursor-pointer' : 'cursor-default'}`}
        onClick={handleIndicatorClick}
      >
        <Badge variant={getVariant()} className="text-sm">
          {usedSessions}/{totalSessions}
          {showWarning && <AlertTriangle className="h-3 w-3 ml-1" />}
        </Badge>
      </Button>

      <Dialog open={showUpsellDialog} onOpenChange={setShowUpsellDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {isLastSession ? 'Τελευταία Συνεδρία!' : 'Το Πακέτο σας Τελειώνει!'}
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p className="font-medium text-foreground">
                {isLastSession 
                  ? 'Αυτή είναι η τελευταία σας συνεδρία. Παρακαλούμε πληρώστε σήμερα για να συνεχίσετε.'
                  : `Σας απομένουν μόνο ${remainingSessions} συνεδρίες.`
                }
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Προτεινόμενη Αναβάθμιση
                </p>
                <p className="text-sm">
                  Από <span className="font-medium">{upsell.from}</span> σε{' '}
                  <span className="font-medium text-primary">{upsell.to}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Όφελος: {upsell.benefit}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Επικοινωνήστε με τη γραμματεία για να ολοκληρώσετε την ανανέωση του πακέτου σας.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionCountIndicator;