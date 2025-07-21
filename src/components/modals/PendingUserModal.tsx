import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, FileText, PenTool, CheckCircle } from "lucide-react";
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
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleSignature = () => {
    if (signaturePadRef.current?.isEmpty()) {
      toast.error("Παρακαλώ υπογράψτε πριν συνεχίσετε");
      return;
    }

    const signature = signaturePadRef.current?.toDataURL();
    if (signature) {
      setSignatureData(signature);
      onSignature(signature);
      toast.success("Η υπογραφή σας αποθηκεύτηκε επιτυχώς!");
    }
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setSignatureData("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Όροι Χρήσης και Κανονισμοί - {userName}
          </DialogTitle>
          <DialogDescription>
            Καλώς ήρθατε στο Sweat24! Για να ολοκληρωθεί η ενεργοποίηση του λογαριασμού σας,
            παρακαλώ διαβάστε και υπογράψτε τους όρους χρήσης.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Welcome Alert */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              Ο λογαριασμός σας έχει εγκριθεί! Παρακαλώ διαβάστε και υπογράψτε τους όρους χρήσης 
              για να ξεκινήσετε να χρησιμοποιείτε την εφαρμογή.
            </AlertDescription>
          </Alert>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Όροι Χρήσης και Προϋποθέσεις</h3>
            </div>

            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
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
                <p>
                  Οι ακυρώσεις συνδρομών γίνονται εγγράφως τουλάχιστον 30 ημέρες πριν την επόμενη χρέωση.
                  Δεν γίνονται επιστροφές για μη χρησιμοποιημένες περιόδους.
                </p>

                <h4 className="font-semibold text-base">Προστασία Προσωπικών Δεδομένων</h4>
                <p>
                  Τα προσωπικά σας δεδομένα χρησιμοποιούνται αποκλειστικά για τη λειτουργία του γυμναστηρίου
                  και δεν κοινοποιούνται σε τρίτους χωρίς συγκατάθεση. Έχετε δικαίωμα πρόσβασης, 
                  διόρθωσης και διαγραφής των δεδομένων σας.
                </p>

                <h4 className="font-semibold text-base">Ιατρικές Προϋποθέσεις</h4>
                <p>
                  Συμμετοχή στα προγράμματα άσκησης γίνεται με δική σας ευθύνη. Συνιστάται ιατρική 
                  εξέταση πριν την έναρξη εντατικού προγράμματος άσκησης.
                </p>
              </div>
            </ScrollArea>
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
                πλήρως τους όρους και προϋποθέσεις χρήσης του γυμναστηρίου Sweat24.
              </p>
              
              <SignaturePad
                ref={signaturePadRef}
                title="Η Υπογραφή σας"
                description={`Υπογράψτε εδώ για να επιβεβαιώσετε την αποδοχή των όρων - ${userName}`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={clearSignature}
              disabled={!signatureData && signaturePadRef.current?.isEmpty()}
            >
              Καθαρισμός Υπογραφής
            </Button>
            <Button
              onClick={handleSignature}
              className="min-w-[140px]"
            >
              Αποδοχή & Υπογραφή
            </Button>
          </div>

          {signatureData && (
            <Alert className="border-green-200 bg-green-50">
              <PenTool className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Η υπογραφή σας αποθηκεύτηκε επιτυχώς! Μπορείτε τώρα να χρησιμοποιήσετε όλες τις λειτουργίες της εφαρμογής.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 