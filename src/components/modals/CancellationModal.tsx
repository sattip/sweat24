import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Calendar as CalendarIcon, Clock, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import * as API from "@/config/api"; // This seems unused, but let's keep it for now
import { bookingService } from "@/services/apiService";
import { buildApiUrl } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onSuccess: () => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [action, setAction] = useState<"cancel" | "reschedule" | "cancel_charged">("cancel");
  const [reason, setReason] = useState("");
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingPolicy, setCheckingPolicy] = useState(true);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedNewClass, setSelectedNewClass] = useState<string>("");
  const [acceptCharge, setAcceptCharge] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      checkPolicy();
      if (action === "reschedule") {
        fetchAvailableClasses();
      }
    }
  }, [isOpen, booking, action]);

  const checkPolicy = async () => {
    try {
      setCheckingPolicy(true);
      // Get current user and auth token for authorization
      const userStr = localStorage.getItem('sweat24_user');
      const token = localStorage.getItem('auth_token');
      if (!userStr || !token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(buildApiUrl(`/bookings/${booking.id}/policy-check`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to check policy' }));
        throw new Error(errorData.message || 'Failed to check policy');
      }
      
      const data = await response.json();
      setPolicy(data);
    } catch (error: any) {
      console.error("Error checking policy:", error);
      toast({
        title: "Σφάλμα",
        description: `Δεν ήταν δυνατή η ανάκτηση της πολιτικής ακύρωσης. Παρακαλώ δοκιμάστε ξανά. (${error.message})`,
        variant: "destructive",
      });
      setPolicy(null); // Ensure no stale policy is used
      onClose(); // Close the modal on error
    } finally {
      setCheckingPolicy(false);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      // Use direct fetch to avoid auth issues
      const response = await fetch(buildApiUrl("/classes?status=active"), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      
      // Get the current booking date
      const bookingDate = new Date(booking.date).toDateString();
      
      // Filter: same day only, not current class, future time, has space
      const filtered = data.filter((cls: any) => {
        const classDate = new Date(cls.date).toDateString();
        const classDateTime = new Date(cls.date + ' ' + cls.time);
        
        return cls.id !== booking.class_id && 
               classDate === bookingDate && // Same day only
               classDateTime > new Date() && // Future time
               cls.current_participants < cls.max_participants; // Has space
      });
      
      setAvailableClasses(filtered);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleSubmit = async () => {
    // Enforce policy restrictions
    const requiredHoursForCancel = policy?.policy?.hours_before || 6;
    const requiredHoursForReschedule = policy?.policy?.reschedule_hours_before || 3;
    
    if (action === "cancel" && policy?.hours_until_class < requiredHoursForCancel) {
      toast.error(`Η ακύρωση δεν επιτρέπεται - απαιτούνται τουλάχιστον ${requiredHoursForCancel} ώρες πριν το μάθημα`);
      return;
    }
    
    if (action === "reschedule" && policy?.hours_until_class < requiredHoursForReschedule) {
      toast.error(`Η μετάθεση δεν επιτρέπεται - απαιτούνται τουλάχιστον ${requiredHoursForReschedule} ώρες πριν το μάθημα`);
      return;
    }
    
    setLoading(true);
    try {
      if (action === "cancel" || action === "cancel_charged") {
        const data = await bookingService.cancel(booking.id, reason);
        
        if (action === "cancel_charged") {
          toast.warning("Η κράτηση ακυρώθηκε με χρέωση");
        } else if (data.penalty_percentage > 0) {
          toast.warning(`Η κράτηση ακυρώθηκε με χρέωση ${data.penalty_percentage}%`);
        } else {
          toast.success("Η κράτηση ακυρώθηκε επιτυχώς");
        }
      } else {
        if (!selectedNewClass) {
          toast.error("Παρακαλώ επιλέξτε νέο μάθημα");
          return;
        }
        
        const data = await bookingService.reschedule(booking.id, selectedNewClass, reason);
        toast.success(data.message || "Η κράτηση μετατέθηκε επιτυχώς");
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την επεξεργασία του αιτήματος");
    } finally {
      setLoading(false);
    }
  };

  if (checkingPolicy) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Έλεγχος πολιτικής...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ακύρωση / Μετάθεση Κράτησης</DialogTitle>
          <DialogDescription>
            {booking.class_name} - {new Date(booking.date).toLocaleDateString("el-GR")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Policy Information */}
          {policy && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{policy.policy?.name}</p>
                  <p className="text-sm">{policy.policy?.description}</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>• Ακύρωση:</strong> Επιτρέπεται μέχρι {policy.policy?.hours_before || 6} ώρες πριν το μάθημα
                    </p>
                    {policy.policy?.reschedule_hours_before && (
                      <p>
                        <strong>• Μετάθεση:</strong> Επιτρέπεται μέχρι {policy.policy.reschedule_hours_before} ώρες πριν το μάθημα
                      </p>
                    )}
                    {policy.policy?.penalty_percentage && (
                      <p>
                        <strong>• Εκπρόθεσμη ακύρωση:</strong> Χρέωση {policy.policy.penalty_percentage}% της αξίας
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {Math.floor(policy.hours_until_class)} ώρες μέχρι το μάθημα
                    </p>
                  </div>
                  {policy.policy?.reschedules_used !== undefined && (
                    <p className="text-sm">
                      <RefreshCw className="inline h-3 w-3 mr-1" />
                      Μεταθέσεις: {policy.policy.reschedules_used}/{policy.policy.reschedules_allowed} αυτόν τον μήνα
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Selection */}
          <div>
            <Label>Ενέργεια</Label>
            <RadioGroup value={action} onValueChange={(value: any) => setAction(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="cancel" 
                  id="cancel" 
                  disabled={policy?.hours_until_class < (policy?.policy?.hours_before || 6)}
                />
                <Label 
                  htmlFor="cancel" 
                  className={`font-normal cursor-pointer ${policy?.hours_until_class < (policy?.policy?.hours_before || 6) ? 'opacity-50' : ''}`}
                >
                  Ακύρωση κράτησης (δωρεάν)
                  {policy?.hours_until_class < (policy?.policy?.hours_before || 6) && (
                    <span className="text-sm text-red-600 ml-2">
                      (Δεν επιτρέπεται - απαιτούνται τουλάχιστον {policy?.policy?.hours_before || 6} ώρες πριν το μάθημα)
                    </span>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="reschedule" 
                  id="reschedule"
                  disabled={policy?.hours_until_class < (policy?.policy?.reschedule_hours_before || 3)}
                />
                <Label 
                  htmlFor="reschedule" 
                  className={`font-normal cursor-pointer ${policy?.hours_until_class < (policy?.policy?.reschedule_hours_before || 3) ? 'opacity-50' : ''}`}
                >
                  Μετάθεση σε άλλο μάθημα (ίδια μέρα)
                  {policy?.hours_until_class >= (policy?.policy?.reschedule_hours_before || 3) && (
                    <span className="text-sm text-green-600 ml-2">
                      (Επιτρέπεται)
                    </span>
                  )}
                  {policy?.hours_until_class < (policy?.policy?.reschedule_hours_before || 3) && (
                    <span className="text-sm text-red-600 ml-2">
                      (Δεν επιτρέπεται - απαιτούνται τουλάχιστον {policy?.policy?.reschedule_hours_before || 3} ώρες πριν το μάθημα)
                    </span>
                  )}
                </Label>
              </div>
              {/* Charged cancellation option for valid cancellations */}
              {policy?.hours_until_class >= (policy?.policy?.hours_before || 6) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="cancel_charged" 
                    id="cancel_charged"
                  />
                  <Label 
                    htmlFor="cancel_charged" 
                    className="font-normal cursor-pointer"
                  >
                    Ακύρωση με πληρωμή
                    <span className="text-sm text-blue-600 ml-2">
                      (Θα χρεωθείτε {policy?.policy?.penalty_percentage || 100}% της αξίας του μαθήματος)
                    </span>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* New Class Selection (for reschedule) */}
          {action === "reschedule" && policy?.can_reschedule && policy?.hours_until_class >= (policy?.policy?.reschedule_hours_before || 3) && (
            <div>
              <Label htmlFor="newClass">Επιλογή νέου μαθήματος (μόνο την ίδια μέρα)</Label>
              {availableClasses.length > 0 ? (
                <Select value={selectedNewClass} onValueChange={setSelectedNewClass}>
                  <SelectTrigger id="newClass">
                    <SelectValue placeholder="Επιλέξτε μάθημα..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{cls.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {cls.time} ({cls.max_participants - cls.current_participants} θέσεις)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Δεν υπάρχουν διαθέσιμα μαθήματα για μετάθεση την ίδια μέρα 
                    ({new Date(booking.date).toLocaleDateString("el-GR")}).
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Αιτιολογία (προαιρετικό)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Περιγράψτε τον λόγο ακύρωσης/μετάθεσης..."
              rows={3}
            />
          </div>

          {/* Warning for charged cancellation */}
          {action === "cancel_charged" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p>Επιλέξατε να πληρώσετε για το μάθημα παρότι το ακυρώνετε. Αυτό σημαίνει ότι θα χρεωθείτε κανονικά.</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="acceptCharge" 
                      checked={acceptCharge}
                      onCheckedChange={(checked) => setAcceptCharge(checked as boolean)}
                    />
                    <Label htmlFor="acceptCharge" className="text-sm cursor-pointer">
                      Συμφωνώ να πληρώσω για το μάθημα παρότι το ακυρώνω
                    </Label>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Άκυρο
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || 
              (action === "cancel" && policy?.hours_until_class < (policy?.policy?.hours_before || 6)) ||
              (action === "reschedule" && (policy?.hours_until_class < (policy?.policy?.reschedule_hours_before || 3) || !selectedNewClass)) ||
              (action === "cancel_charged" && !acceptCharge)
            }
            variant={action === "cancel_charged" ? "secondary" : "default"}
          >
            {loading ? "Επεξεργασία..." : 
             action === "cancel" ? "Ακύρωση Κράτησης" : 
             action === "cancel_charged" ? "Ακύρωση με Πληρωμή" :
             "Μετάθεση"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};