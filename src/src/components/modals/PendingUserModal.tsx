import React, { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, FileText, PenTool, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import SignaturePad, { SignaturePadRef } from "../SignaturePad";

interface PendingUserModalProps {
  isOpen: boolean;
  onSignature: (signatureData: string) => void;
  userName: string;
}

export const PendingUserModal: React.FC<PendingUserModalProps> = ({
  isOpen,
  onSignature,
  userName
}) => {
  const [signatureData, setSignatureData] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleSignature = async () => {
    if (signaturePadRef.current?.isEmpty()) {
      toast.error("Παρακαλώ υπογράψτε πριν συνεχίσετε");
      return;
    }

    const signature = signaturePadRef.current?.toDataURL();
    if (signature) {
      setIsProcessing(true);
      setSignatureData(signature);
      
      try {
        // Call the parent handler (AuthContext)
        await onSignature(signature);
        
        // Success feedback - the modal will close automatically when user is refreshed
        toast.success("Η υπογραφή σας αποθηκεύτηκε επιτυχώς!");
        
        // No need for window.location.reload() - AuthContext will handle user refresh
        // and modal will close when has_signed_terms becomes true
        
      } catch (error) {
        toast.error("Σφάλμα κατά την αποθήκευση της υπογραφής");
        setIsProcessing(false);
        setSignatureData(""); // Reset on error
      }
    }
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setSignatureData("");
  };

  const handleClose = () => {
    // Don't allow closing the modal - signature is required
    toast.error("Η υπογραφή είναι υποχρεωτική για τη χρήση της εφαρμογής");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-semibold text-left">
              Όροι Χρήσης
            </h2>
            <p className="text-sm text-muted-foreground text-left mt-1">
              {userName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8 rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Κλείσιμο</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-left mt-2">
          Για να ολοκληρωθεί η ενεργοποίηση του λογαριασμού σας, παρακαλώ διαβάστε και υπογράψτε τους όρους χρήσης.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 140px - 140px)' }}>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Welcome Alert */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 text-sm">
                Ο λογαριασμός σας έχει εγκριθεί! Παρακαλώ διαβάστε και υπογράψτε τους όρους χρήσης.
              </AlertDescription>
            </Alert>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Όροι Χρήσης και Προϋποθέσεις</h3>
              </div>

              <div className="border rounded-lg">
                <ScrollArea className="h-[250px] w-full p-4">
                  <div className="space-y-4 text-sm">
                    <h4 className="font-semibold text-base">Γενικοί Κανόνες Γυμναστηρίου</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Όλα τα μέλη πρέπει να σκανάρουν την κάρτα μελών τους κατά την είσοδο</li>
                      <li>Απαιτείται κατάλληλη αθλητική ενδυμασία και καθαρά αθλητικά παπούτσια</li>
                      <li>Παρακαλούμε φέρτε πετσέτα και χρησιμοποιήστε την κατά τη διάρκεια της προπόνησης</li>
                      <li>Καθαρίστε τον εξοπλισμό μετά τη χρήση</li>
                      <li>Επιστρέψτε τα βάρη και τον εξοπλισμό στις κατάλληλες θέσεις τους</li>
                      <li>Σεβαστείτε τον χώρο και τον χρόνο προπόνησης των άλλων μελών</li>
                    </ul>

                    <h4 className="font-semibold text-base">Κανόνες Μαθημάτων</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Φτάστε τουλάχιστον 5 λεπτά πριν την έναρξη του μαθήματος</li>
                      <li>Οι καθυστερημένες αφίξεις ενδέχεται να μην επιτρέπονται</li>
                      <li>Ακυρώσεις πρέπει να γίνονται τουλάχιστον 6 ώρες πριν το μάθημα</li>
                      <li>Μετατάξεις επιτρέπονται τουλάχιστον 3 ώρες πριν το μάθημα</li>
                      <li>Η μη εμφάνιση θα έχει ως αποτέλεσμα την αφαίρεση συνεδρίας</li>
                    </ul>

                    <h4 className="font-semibold text-base">Προσωπική Προπόνηση</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Απαιτείται 24ωρη προειδοποίηση για ακυρώσεις</li>
                      <li>Καθυστερημένες ακυρώσεις θα χρεωθούν πλήρως</li>
                      <li>Τα ραντεβού προγραμματίζονται μέσω της εφαρμογής</li>
                    </ul>

                    <h4 className="font-semibold text-base">Χρήση Εγκαταστάσεων</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Τα ντουλάπια χρησιμοποιούνται μόνο κατά τη διάρκεια παραμονής</li>
                      <li>Το γυμναστήριο δεν ευθύνεται για χαμένα αντικείμενα</li>
                      <li>Δεν επιτρέπονται κλήσεις κινητού στους χώρους προπόνησης</li>
                      <li>Απαγορεύεται το φαγητό στο χώρο προπόνησης</li>
                    </ul>

                    <h4 className="font-semibold text-base">Πολιτική Ακύρωσης Συνδρομής</h4>
                    <p className="text-sm">
                      Οι ακυρώσεις συνδρομών γίνονται εγγράφως τουλάχιστον 30 ημέρες πριν την επόμενη χρέωση.
                      Δεν γίνονται επιστροφές για μη χρησιμοποιημένες περιόδους.
                    </p>

                    <h4 className="font-semibold text-base">Προστασία Προσωπικών Δεδομένων</h4>
                    <p className="text-sm">
                      Τα προσωπικά σας δεδομένα χρησιμοποιούνται αποκλειστικά για τη λειτουργία του γυμναστηρίου
                      και δεν κοινοποιούνται σε τρίτους χωρίς συγκατάθεση. Έχετε δικαίωμα πρόσβασης, 
                      διόρθωσης και διαγραφής των δεδομένων σας.
                    </p>

                    <h4 className="font-semibold text-base">Ιατρικές Προϋποθέσεις</h4>
                    <p className="text-sm">
                      Συμμετοχή στα προγράμματα άσκησης γίνεται με δική σας ευθύνη. Συνιστάται ιατρική 
                      εξέταση πριν την έναρξη εντατικού προγράμματος άσκησης.
                    </p>
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Ψηφιακή Υπογραφή</h3>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Υπογράφοντας παρακάτω, δηλώνετε ότι έχετε διαβάσει, κατανοήσει και αποδέχεστε 
                  πλήρως τους όρους και προϋποθέσεις χρήσης του γυμναστηρίου Sweat93.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                  <SignaturePad
                    ref={signaturePadRef}
                    title="Η Υπογραφή σας"
                    description={`Υπογράψτε εδώ για να επιβεβαιώσετε την αποδοχή των όρων - ${userName}`}
                  />
                </div>
              </div>
            </div>

            {signatureData && (
              <Alert className="border-green-200 bg-green-50">
                <PenTool className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 text-sm">
                  Η υπογραφή σας αποθηκεύτηκε επιτυχώς! Το παράθυρο θα κλείσει αυτόματα...
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Footer - Always at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background">
        <div className="flex flex-col gap-3 w-full">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!signatureData && signaturePadRef.current?.isEmpty()}
            className="w-full h-12 text-sm"
          >
            Καθαρισμός Υπογραφής
          </Button>
          <Button
            onClick={handleSignature}
            disabled={isProcessing}
            className="w-full h-12 text-sm"
          >
            {isProcessing ? "Αποθήκευση..." : "Αποδοχή & Υπογραφή"}
          </Button>
        </div>
      </div>
    </div>
  );
}; 