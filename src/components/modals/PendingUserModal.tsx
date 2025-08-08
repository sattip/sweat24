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

    const sigRef = signaturePadRef.current;
    const signature = sigRef?.toDataURLJpeg ? sigRef.toDataURLJpeg() : sigRef?.toDataURL();
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
                    <h4 className="font-semibold text-base mb-3">Εσωτερικός Κανονισμός Λειτουργίας & Όροι Χρήσης</h4>
                    
                    <p className="mb-4">
                      Ο κανονισμός λειτουργίας έχει υιοθετηθεί τόσο για την ομαλή λειτουργία του Γυμναστηρίου όσο και για την καλύτερη εξυπηρέτηση των μελών του. Τα μέλη του Γυμναστηρίου πρέπει να γνωρίζουν και να συμμορφώνονται με τα παρακάτω:
                    </p>

                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Τα μέλη οφείλουν να τηρούν τους κανόνες υγιεινής του Γυμναστηρίου και να φροντίζουν για την καθαριότητα των χώρων του. Τα μέλη οφείλουν επίσης να φροντίζουν την προσωπική τους καθαριότητα και υγιεινή κατά την παραμονή τους στο Γυμναστήριο.</li>
                      <li>Το Γυμναστήριο δεν παρέχει υπηρεσία φύλαξης των προσωπικών αντικειμένων των μελών. Τα μέλη του Γυμναστηρίου φέρουν προσωπική ευθύνη για τη φύλαξη των προσωπικών τους αντικειμένων. Το Γυμναστήριο προτείνει στα μέλη του να μη φέρνουν πολύτιμα αντικείμενα κατά την παραμονή τους στο Γυμναστήριο. Το Γυμναστήριο ουδεμία ευθύνη φέρει σε περίπτωση κλοπής, απώλειας ή φθοράς αντικειμένων, χρημάτων ή προσωπικών ειδών των μελών σε οποιοδήποτε χώρο του Γυμναστηρίου.</li>
                      <li>Τα μέλη συνίσταται να φέρουν βεβαίωση από γιατρό ότι μπορούν να ασκηθούν. Αν όχι ασκούνται με δική τους ευθύνη όσον αφορά την υγεία τους.</li>
                      <li>Η χρήση των μηχανημάτων και του εν γένει εξοπλισμού του Γυμναστήριου πρέπει να γίνεται με προσοχή και με τρόπο που να μην θέτει σε κίνδυνο την σωματική ακεραιότητα τόσο του μέλους όσο και των υπολοίπων μελών και πάντα με βάση τις υποδείξεις του προσωπικού. Το Γυμναστήριο δεν φέρει καμία ευθύνη για ατυχήματα που προκύπτουν από πλημμελή χρήση οργάνων. Σε περίπτωση που κάποιο μέλος απωλέσει ή φθείρει από πλημμελή χρήση προϊόν, όργανο γυμναστικής ή μηχάνημα του Γυμναστηρίου είναι υποχρεωμένο να το αντικαταστήσει. Σε περίπτωση που μέλος προκαλέσει ζημιά σε χώρους του γυμναστηρίου από πλημμελή ενέργειά του είναι υποχρεωμένο να αποζημιώσει το Γυμναστήριο για την ζημιά αυτή. Παρακαλούμε τα μέλη να μην πλησιάζουν τους καθρέπτες με ελεύθερους πάγκους, αλτήρες, βάρη ή/και μπάρες για την αποφυγή τυχόν ατυχημάτων.</li>
                      <li>Η επιστροφή εξοπλισμού του Γυμναστηρίου στην προβλεπόμενη θέση μετά το τέλος της προπόνησης είναι υποχρεωτική από όλα τα μέλη.</li>
                      <li>Η μεταδιδόμενη μουσική στο Γυμναστήριο αποτελεί επιλογή του Γυμναστηρίου.</li>
                      <li>Απαγορεύεται το κάπνισμα σε όλους τους χώρους του Γυμναστηρίου.</li>
                      <li>Απαγορεύεται αυστηρά η είσοδος σε ανήλικα άτομα κάτω των 10 ετών, με, ή χωρίς συνοδεία, τα οποία δεν είναι μέλη του Γυμναστηρίου. Το γυμναστήριο δεν παρέχει υπηρεσία φύλαξης ή συνοδείας παιδιών και δεν φέρει καμία ευθύνη για τυχόν ατύχημα εντός του Γυμναστηρίου.</li>
                      <li>Οι διαθέσιμες συνδρομές και πακέτα προπονήσεων που παρέχει το Γυμναστήριό μας σύμφωνα με τον ισχύοντα τιμοκατάλογο διακρίνονται ανάλογα με τον αριθμό συνεδριών και τη χρονική διάρκεια ισχύος τους. Η πληρωμή πραγματοποιείται εφάπαξ κατά την αγορά τους, καθώς πρόκειται για ειδική συμφωνία προς όφελος του καταναλωτή. Η διάρκεια ισχύος κάθε πακέτου εκκινεί από την ημερομηνία πραγματοποίησης της πρώτης προπόνησης και ισχύει έως την προκαθορισμένη ημερομηνία λήξης που το συνοδεύει. Μετά τη λήξη της περιόδου ισχύος, o καταναλωτής-μέλος δεν θα μπορεί να χρησιμοποιήσει τις υπηρεσίες της συνδρομής εάν δεν προβεί σε σχετική ανανέωση και οι μη πραγματοποιθείσες συνεδρίες δεν μεταφέρονται, δεν επιστρέφονται και δεν συμψηφίζονται,</li>
                      <li>Η εκ μέρους του μέλους ακύρωση της συνδρομής, δε μπορεί να πραγματοποιηθεί για κανένα λόγο. Εάν η πληρωμή έχει πραγματοποιηθεί, δε γίνεται καμία επιστροφή χρημάτων.</li>
                      <li>Απαγορεύεται η ακύρωση των προγραμματισμένων ραντεβού σε διάστημα μικρότερο των 10 ωρών πριν από την προκαθορισμένη ώρα (σε αυτή την περίπτωση το μέλος χρεώνεται το ραντεβού το οποίο ακύρωσε).</li>
                      <li>Το Γυμναστήριο διατηρεί το δικαίωμα να διακόψει την είσοδο και χρήση του χώρου του σε οποιοδήποτε άτομο δεν έχει τακτοποιήσει τις οικονομικές του υποχρεώσεις έναντι του Γυμναστήριου. Το Γυμναστήριο δεν επιστρέφει προκαταβολή ή χρήματα σε περίπτωση που το μέλος άλλαξε γνώμη σχετικά με την συνδρομή του.</li>
                      <li>Το Γυμναστήριο διατηρεί το δικαίωμα τροποποίησης του ωραρίου λειτουργίας του καθώς και/ή τροποποίησης /ακύρωσης των επιμέρους τμημάτων/προγραμμάτων του για λόγους που το κρίνει σκόπιμο. Το Γυμναστήριο διατηρεί το δικαίωμα αλλαγής του τιμοκαταλόγου του.</li>
                      <li>Το Γυμναστήριο διατηρεί το δικαίωμα ακύρωσης της εγγραφής/συνδρομής μέλους το οποίο έχει παραβιάσει κανονισμούς του Γυμναστηρίου, οπότε καταπίπτουν υπέρ του Γυμναστηρίου οι καταβολές του μέλους που έχουν έως τότε πραγματοποιηθεί.</li>
                      <li>Η παραμονή στον χώρο του γυμναστηρίου πριν ή μετά το προκαθορισμένο ραντεβού δεν επιτρέπεται για την εύρυθμη λειτουργία του προγράμματος και την εξυπηρέτηση όλων των πελατών.</li>
                      <li>Η παραμονή στον χώρο του γυμναστηρίου πριν ή μετά το προκαθορισμένο ραντεβού δεν επιτρέπεται για την εύρυθμη λειτουργία του προγράμματος και την εξυπηρέτηση όλων των πελατών. Σε περίπτωση καθυστερημένης άφιξης, η διάρκεια της προπόνησης δεν παρατείνεται πέραν της προκαθορισμένης ώρας λήξης.</li>
                      <li>Η προπόνηση διαρθρώνεται σε τρία στάδια: προθέρμανση, κύριο μέρος και αποθεραπεία, τα οποία συνιστούν ενιαίο και αδιάσπαστο σύνολο και εκτελούνται αποκλειστικά εντός του προκαθορισμένου χρόνου της συνεδρίας. Καμία δραστηριότητα που σχετίζεται με την προπόνηση δεν επιτρέπεται να λαμβάνει χώρα πριν την έναρξη ή μετά τη λήξη της συμφωνηθείσας διάρκειας.</li>
                      <li>Για τη διασφάλιση της καθαριότητας και της υγιεινής του χώρου, τα μέλη υποχρεούνται να φέρνουν μαζί τους και να φορούν καθαρό ζευγάρι αθλητικών παπουτσιών αποκλειστικά για χρήση εντός του γυμναστηρίου. Η είσοδος με υποδήματα που φορέθηκαν εκτός του γυμναστηρίου δεν επιτρέπεται.</li>
                      <li>Το Γυμναστήριο διατηρεί το δικαίωμα να τροποποιεί τον κανονισμό λειτουργίας του ανάλογα με της ανάγκες του Γυμναστηρίου. Οποιαδήποτε τροποποίηση θα γνωστοποιείται στα μέλη με ανάρτηση στο χώρο του Γυμναστηρίου.</li>
                    </ol>

                    <h4 className="font-semibold mb-2">Συγκατάθεση για Επεξεργασία Προσωπικών Δεδομένων</h4>
                    
                    <p className="mb-4">
                      Η επιχείρηση «Ninetythreesweat» και τον διακριτικό τίτλο «SWEAT93», με με ΑΦΜ 159275736 και έδρα στον Δήμο Βάρης- Βούλας-Βουλιαγμένης επί της οδού Ηφαίστου 4, ταχυδρομικός κώδικας 16672 και υποκατάστημα στο Δήμο Σαρωνικού, επί της οδού Ολύμπου 2, ταχυδρομικός κώδικας: 19010, σέβεται απόλυτα τα προσωπικά σας δεδομένα και φροντίζει για την ασφαλή διαχείρισή τους σύμφωνα με τον Γενικό Κανονισμό για την Προστασία των Δεδομένων Προσωπικού Χαρακτήρα (Κανονισμός (ΕΕ) 2016/679 του Ευρωπαϊκού Κοινοβουλίου και του Συμβουλίου, στο εξής ΓΚΠΔ) και τον Νόμο 4624/19 (ΦΕΚ Ά 137/29-8-19). Στο πλαίσιο των δραστηριοτήτων μας επιθυμούμε να προβούμε στις εξής ενέργειες, οι οποίες αποτελούν κατά τον ΓΚΠΔ πράξεις επεξεργασίας προσωπικών δεδομένων και οι οποίες περιγράφονται αναλυτικά στην Πολιτική Προστασίας Προσωπικών Δεδομένων των Πελατών του γυμναστηρίου μας:
                    </p>
                    
                    <p className="mb-2">
                      <strong>α)</strong> στην χρήση της διεύθυνσης του ηλεκτρονικού ταχυδρομείου σας (e-mail) ή του αριθμού του κινητού σας τηλεφώνου , ώστε να σας αποστέλλουμε διαφημιστικά μηνύματα με τις προσφορές και τις δράσεις μας
                    </p>
                    
                    <p className="mb-2">
                      <strong>β)</strong> η επικοινωνία με τα μέλη δύναται να πραγματοποιείται και μέσω ηλεκτρονικών εφαρμογών ή ψηφιακών πλατφορμών που διαχειρίζεται η επιχείρηση, με σκοπό την παροχή υπηρεσιών, τον προγραμματισμό ραντεβού και την ενημέρωση για ζητήματα που αφορούν τη συνδρομή ή την άθληση.
                    </p>
                    
                    <p className="mb-2">
                      <strong>γ)</strong> τα προσωπικά σας δεδομένα ενδέχεται να διαβιβαστούν σε τρίτους συνεργάτες ή παρόχους τεχνολογικών υπηρεσιών, αποκλειστικά για την υποστήριξη της λειτουργίας της εφαρμογής και των σχετικών υπηρεσιών μας, με απόλυτο σεβασμό στον GDPR
                    </p>
                    
                    <p className="mb-4">
                      <strong>δ)</strong> στην λήψη φωτογραφιών ή/και στην ολιγόλεπτη βιντεοσκόπησή σας κατά τη διάρκεια των προγραμμάτων άθλησης. Το υλικό αυτό θα δημοσιευθεί στην ιστοσελίδα μας και στους λογαριασμούς μας στα μέσα κοινωνικής δικτύωσης για την προώθηση των δράσεων και των παροχών μας. Με το παρόν έγγραφο ζητούμε, συνεπώς, την συγκατάθεσή σας για την επεξεργασία των δεδομένων σας στο πλαίσιο κάθε μιας από τις παραπάνω ενέργειες και μόνο για τους παραπάνω σκοπούς.
                    </p>
                    
                    <p className="mb-4">
                      <strong>Σημειώνουμε ότι</strong><br/>
                      α) η διατήρησή των ανωτέρω δεδομένων σας διαρκεί μέχρι την ανάκληση της συγκατάθεσής σας.<br/>
                      β) μπορείτε να ανακαλέσετε τη συγκατάθεσή σας οποτεδήποτε , στέλνοντας e-mail στην διεύθυνση manolis.askou@gmail.com , στην περίπτωση των διαφημιστικών e-mails, πατώντας στο σύνδεσμο απεγγραφής που βρίσκεται πάντα στο τέλος αυτών των μηνυμάτων. Κατά τα λοιπά, ισχύουν όσα προβλέπονται στην Πολιτική Προστασίας Προσωπικών Δεδομένων των Πελατών του γυμναστηρίου μας.
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