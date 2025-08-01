import React, { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, FileText, PenTool, CheckCircle, X, AlertTriangle } from "lucide-react";
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
  const [emailConsent, setEmailConsent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [photoVideoConsent, setPhotoVideoConsent] = useState(false);
  const [showError, setShowError] = useState(false);
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleSignature = async () => {
    if (signaturePadRef.current?.isEmpty()) {
      toast.error("Παρακαλώ υπογράψτε πριν συνεχίσετε");
      return;
    }

    if (!acceptedTerms) {
      setShowError(true);
      toast.error("Παρακαλούμε αποδεχτείτε τους όρους και προϋποθέσεις για να συνεχίσετε");
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
              Εσωτερικός Κανονισμός & Όροι Χρήσης
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
                <h3 className="text-lg font-semibold">Εσωτερικός Κανονισμός Λειτουργίας & Όροι Χρήσης</h3>
              </div>

              <div className="border rounded-lg">
                <ScrollArea className="h-[400px] w-full p-4">
                  <div className="space-y-4 text-sm">
                    <h4 className="font-semibold text-base mb-3">ΕΣΩΤΕΡΙΚΟΣ ΚΑΝΟΝΙΣΜΟΣ ΛΕΙΤΟΥΡΓΙΑΣ ΓΥΜΝΑΣΤΗΡΙΟΥ</h4>
                    
                    <p className="mb-4">
                      Το γυμναστήριο με την επωνυμία «SWEAT 93» και τον διακριτικό τίτλο «SWEAT 93», 
                      λειτουργεί υπό τον παρακάτω εσωτερικό κανονισμό:
                    </p>

                    <h4 className="font-semibold mb-2">Α. ΓΕΝΙΚΕΣ ΑΡΧΕΣ</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Η είσοδος στο γυμναστήριο γίνεται αποκλειστικά με την επίδειξη της κάρτας μέλους.</li>
                      <li>Τα μέλη του γυμναστηρίου οφείλουν να συμμορφώνονται προς τον παρόντα κανονισμό.</li>
                      <li>Η διοίκηση του γυμναστηρίου διατηρεί το δικαίωμα τροποποίησης του κανονισμού κατόπιν ενημέρωσης των μελών.</li>
                      <li>Σε περίπτωση παραβίασης του κανονισμού, η διοίκηση δύναται να διακόψει τη συνδρομή του μέλους.</li>
                    </ol>

                    <h4 className="font-semibold mb-2">Β. ΩΡΑΡΙΟ ΛΕΙΤΟΥΡΓΙΑΣ</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Το γυμναστήριο λειτουργεί σύμφωνα με το αναρτημένο πρόγραμμα.</li>
                      <li>Τυχόν αλλαγές στο ωράριο γνωστοποιούνται εγκαίρως στα μέλη.</li>
                      <li>Κατά τις επίσημες αργίες, το γυμναστήριο παραμένει κλειστό.</li>
                    </ol>

                    <h4 className="font-semibold mb-2">Γ. ΕΣΩΤΕΡΙΚΟΣ ΚΑΝΟΝΙΣΜΟΣ</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Η χρήση του γυμναστηρίου επιτρέπεται αποκλειστικά με αθλητική ενδυμασία και καθαρά αθλητικά παπούτσια.</li>
                      <li>Είναι υποχρεωτική η χρήση πετσέτας κατά τη διάρκεια της άσκησης.</li>
                      <li>Μετά τη χρήση, τα μηχανήματα και ο εξοπλισμός πρέπει να καθαρίζονται και να επιστρέφονται στη θέση τους.</li>
                      <li>Απαγορεύεται το κάπνισμα, η κατανάλωση αλκοόλ και η είσοδος υπό την επήρεια ουσιών.</li>
                      <li>Απαγορεύεται η χρήση κινητού τηλεφώνου στους χώρους εκγύμνασης.</li>
                      <li>Η φωτογράφιση και βιντεοσκόπηση επιτρέπεται μόνο κατόπιν άδειας της διοίκησης.</li>
                      <li>Το προσωπικό του γυμναστηρίου έχει το δικαίωμα ελέγχου και παρατήρησης για την τήρηση των κανόνων.</li>
                    </ol>

                    <h4 className="font-semibold mb-2">Δ. ΥΓΙΕΙΝΗ ΚΑΙ ΑΣΦΑΛΕΙΑ</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Τα μέλη ασκούνται με δική τους ευθύνη και κίνδυνο.</li>
                      <li>Συνιστάται ιατρική εξέταση πριν την έναρξη οποιουδήποτε προγράμματος άσκησης.</li>
                      <li>Σε περίπτωση προβλήματος υγείας, το μέλος οφείλει να ενημερώσει άμεσα το προσωπικό.</li>
                      <li>Το γυμναστήριο δεν φέρει ευθύνη για τραυματισμούς κατά τη διάρκεια της άσκησης.</li>
                    </ol>

                    <h4 className="font-semibold mb-2">Ε. ΧΡΗΣΗ ΑΠΟΔΥΤΗΡΙΩΝ ΚΑΙ ΝΤΟΥΛΑΠΙΩΝ</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Τα ντουλάπια χρησιμοποιούνται αποκλειστικά κατά τη διάρκεια παραμονής στο γυμναστήριο.</li>
                      <li>Το γυμναστήριο δεν φέρει ευθύνη για κλοπές ή απώλεια αντικειμένων.</li>
                      <li>Συνιστάται η χρήση προσωπικού λουκέτου για την ασφάλεια των αντικειμένων.</li>
                      <li>Αντικείμενα που παραμένουν στα ντουλάπια μετά το κλείσιμο θα απομακρύνονται.</li>
                    </ol>

                    <h4 className="font-semibold mb-2">ΣΤ. ΚΡΑΤΗΣΕΙΣ ΚΑΙ ΑΚΥΡΩΣΕΙΣ ΜΑΘΗΜΑΤΩΝ</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Οι κρατήσεις γίνονται μέσω της εφαρμογής του γυμναστηρίου.</li>
                      <li>Η ακύρωση μαθήματος πρέπει να γίνεται τουλάχιστον 4 ώρες πριν την έναρξη.</li>
                      <li>Η μη εμφάνιση σε κρατημένο μάθημα έχει ως αποτέλεσμα την αφαίρεση της συνεδρίας.</li>
                      <li>Για την προσωπική προπόνηση απαιτείται ακύρωση τουλάχιστον 24 ώρες νωρίτερα.</li>
                    </ol>

                    <h4 className="font-semibold mb-2">Ζ. ΟΙΚΟΝΟΜΙΚΕΣ ΥΠΟΧΡΕΩΣΕΙΣ</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Οι συνδρομές καταβάλλονται προκαταβολικά και στην προθεσμία που ορίζεται.</li>
                      <li>Σε περίπτωση καθυστέρησης πληρωμής, το μέλος δεν έχει πρόσβαση στις εγκαταστάσεις.</li>
                      <li>Οι ακυρώσεις συνδρομών γίνονται εγγράφως τουλάχιστον 30 ημέρες πριν την επόμενη χρέωση.</li>
                      <li>Δεν γίνονται επιστροφές για μη χρησιμοποιημένες περιόδους συνδρομής.</li>
                    </ol>

                    <h4 className="font-semibold mb-2">Η. ΠΡΟΣΤΑΣΙΑ ΠΡΟΣΩΠΙΚΩΝ ΔΕΔΟΜΕΝΩΝ</h4>
                    <p className="mb-4">
                      Στο πλαίσιο της συνεργασίας μας και για την παροχή των υπηρεσιών μας, 
                      πρόκειται να επεξεργαστούμε ορισμένα προσωπικά σας δεδομένα. Συγκεκριμένα:
                    </p>

                    <p className="mb-2">
                      <strong>α) Email Marketing:</strong> Θα χρησιμοποιήσουμε τη διεύθυνση email σας για την αποστολή 
                      διαφημιστικών μηνυμάτων, προσφορών και ενημερώσεων σχετικά με τις υπηρεσίες μας.
                    </p>

                    <p className="mb-2">
                      <strong>β) SMS Marketing:</strong> Θα χρησιμοποιήσουμε τον αριθμό του κινητού σας τηλεφώνου 
                      για την αποστολή διαφημιστικών μηνυμάτων και ειδοποιήσεων.
                    </p>

                    <p className="mb-4">
                      <strong>γ) Φωτογραφικό & Βιντεοσκοπικό Υλικό:</strong> Ενδέχεται να πραγματοποιήσουμε φωτογράφισή σας 
                      και ολιγόλεπτη βιντεοσκόπησή σας κατά τη διάρκεια των προγραμμάτων άθλησης. Το υλικό αυτό 
                      θα δημοσιευθεί στην ιστοσελίδα μας και στους λογαριασμούς μας στα μέσα κοινωνικής δικτύωσης 
                      για την προώθηση των δράσεων και των παροχών μας.
                    </p>

                    <p className="mb-4">
                      <strong>Σημειώνουμε ότι:</strong><br/>
                      α) η διατήρησή των ανωτέρω δεδομένων σας διαρκεί μέχρι την ανάκληση της συγκατάθεσής σας.<br/>
                      β) μπορείτε να ανακαλέσετε τη συγκατάθεσή σας οποτεδήποτε, στέλνοντας e-mail στην διεύθυνση 
                      manolis.askou@gmail.com, στην περίπτωση των διαφημιστικών e-mails, πατώντας στο σύνδεσμο 
                      απεγγραφής που βρίσκεται πάντα στο τέλος αυτών των μηνυμάτων.
                    </p>

                    <p className="mb-4">
                      Κατά τα λοιπά, ισχύουν όσα προβλέπονται στην Πολιτική Προστασίας Προσωπικών Δεδομένων 
                      των Πελατών του γυμναστηρίου μας.
                    </p>

                    <p className="mb-4 text-center font-medium">
                      Ο κάτωθι υπογράφων/ Η κάτωθι υπογράφουσα αφού έλαβα γνώση της 
                      Πολιτικής Προστασίας Προσωπικών Δεδομένων των Πελατών του 
                      γυμναστηρίου με την επωνυμία «SWEAT 93» και τον διακριτικό τίτλο «SWEAT 
                      93» συναινώ:
                    </p>
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* GDPR Consent Checkboxes */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-base">Συγκατάθεση για Επεξεργασία Προσωπικών Δεδομένων:</h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="email-consent" 
                    checked={emailConsent} 
                    onCheckedChange={(checked) => setEmailConsent(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="email-consent" className="text-sm leading-5">
                    <strong>1.</strong> στην χρήση του e-mail μου για την αποστολή διαφημιστικών μηνυμάτων
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="sms-consent" 
                    checked={smsConsent} 
                    onCheckedChange={(checked) => setSmsConsent(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="sms-consent" className="text-sm leading-5">
                    <strong>2.</strong> στην χρήση του αριθμού του κινητού μου τηλεφώνου για την αποστολή διαφημιστικών μηνυμάτων
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="photo-video-consent" 
                    checked={photoVideoConsent} 
                    onCheckedChange={(checked) => setPhotoVideoConsent(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="photo-video-consent" className="text-sm leading-5">
                    <strong>3.</strong> στην λήψη της φωτογραφίας μου και στη ολιγόλεπτη βιντεοσκόπησή μου 
                    κατά τη διάρκεια των προγραμμάτων άθλησης και στη δημοσίευση του υλικού 
                    αυτού στην ιστοσελίδα του γυμναστηρίου και στους λογαριασμούς του στα 
                    μέσα κοινωνικής δικτύωσης
                  </label>
                </div>
              </div>
            </div>

            {/* Mandatory Terms Acceptance */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms-accepted" 
                  checked={acceptedTerms} 
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked === true);
                    if (checked) setShowError(false);
                  }}
                  className="mt-1"
                />
                <label htmlFor="terms-accepted" className="text-sm font-medium leading-5">
                  Δηλώνω ότι έλαβα γνώση των ως άνω κανονισμών και όρων και τους αποδέχομαι πλήρως.
                </label>
              </div>

              {showError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Παρακαλούμε αποδεχτείτε τους όρους και προϋποθέσεις για να συνεχίσετε.
                  </AlertDescription>
                </Alert>
              )}
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