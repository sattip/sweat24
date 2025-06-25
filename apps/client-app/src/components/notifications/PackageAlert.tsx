
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CircleAlert, Package, Clock } from "lucide-react";
import { Link } from "react-router-dom";

type AlertType = "last-session" | "expiring-soon" | "expired";

interface PackageAlertProps {
  type: AlertType;
  daysRemaining?: number;
}

const PackageAlert: React.FC<PackageAlertProps> = ({ type, daysRemaining = 0 }) => {
  const getAlertContent = () => {
    switch (type) {
      case "last-session":
        return {
          icon: <Package className="h-4 w-4" />,
          title: "Ειδοποίηση Τελευταίας Συνεδρίας",
          description: "Αυτή είναι η τελευταία σας συνεδρία στο τρέχον πακέτο σας. Παρακαλούμε ανανεώστε για να συνεχίσετε να κλείνετε μαθήματα.",
          greekDescription: "Προσοχή! Αυτή είναι η τελευταία σας συνεδρία. Παρακαλούμε ανανεώστε το πακέτο σας για να συνεχίσετε."
        };
      case "expiring-soon":
        return {
          icon: <Clock className="h-4 w-4" />,
          title: "Το Πακέτο σας Λήγει Σύντομα",
          description: `Το πακέτο σας θα λήξει σε ${daysRemaining} ${daysRemaining === 1 ? 'ημέρα' : 'ημέρες'}. Ανανεώστε τώρα για να διατηρήσετε την πρόσβαση.`,
          greekDescription: `Το πακέτο σας λήγει σε ${daysRemaining} ${daysRemaining === 1 ? 'ημέρα' : 'ημέρες'}! Ανανεώστε το τώρα.`
        };
      case "expired":
        return {
          icon: <CircleAlert className="h-4 w-4" />,
          title: "Το Πακέτο σας Έληξε",
          description: "Το πακέτο σας έχει λήξει. Ανανεώστε τώρα για να συνεχίσετε να κλείνετε μαθήματα και να χρησιμοποιείτε τις εγκαταστάσεις του γυμναστηρίου.",
          greekDescription: "Το πακέτο σας έχει λήξει. Ανανεώστε τώρα για να συνεχίσετε να κάνετε κρατήσεις και να χρησιμοποιείτε τις εγκαταστάσεις του γυμναστηρίου."
        };
      default:
        return {
          icon: <Package className="h-4 w-4" />,
          title: "Ειδοποίηση Πακέτου",
          description: "Παρακαλούμε ελέγξτε την κατάσταση του πακέτου σας.",
          greekDescription: "Παρακαλούμε ελέγξτε την κατάσταση του πακέτου σας."
        };
    }
  };

  const content = getAlertContent();
  const variant = type === "expired" ? "destructive" : "default";
  
  return (
    <Alert 
      variant={variant} 
      className={`mb-6 border-l-4 ${
        type === "expired" 
          ? "border-l-destructive" 
          : type === "last-session" 
            ? "border-l-secondary" 
            : "border-l-primary"
      } animate-fade-in`}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full mr-3 ${
          type === "expired" 
            ? "bg-destructive/10 text-destructive" 
            : type === "last-session" 
              ? "bg-secondary/10 text-secondary" 
              : "bg-primary/10 text-primary"
        }`}>
          {content.icon}
        </div>
        <div className="flex-1">
          <AlertTitle>{content.title}</AlertTitle>
          <AlertDescription className="mt-1">
            <p className="mb-1">{content.description}</p>
            <p className="mb-3 text-sm opacity-80">{content.greekDescription}</p>
            <Link to="/dashboard?tab=membership">
              <Button 
                size="sm"
                variant={type === "expired" ? "destructive" : "default"}
              >
                Ανανεώστε Τώρα
              </Button>
            </Link>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default PackageAlert;
