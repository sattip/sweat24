
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface GymRulesModalProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const GymRulesModal: React.FC<GymRulesModalProps> = ({
  open,
  onClose,
  onAgree,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Εσωτερικός Κανονισμός Λειτουργίας & Όροι Χρήσης</DialogTitle>
          <DialogDescription>
            Κανόνες και όροι χρήσης του γυμναστηρίου SWEAT 93 που έχετε αποδεχθεί.
          </DialogDescription>
        </DialogHeader>
        
        {/* Status Alert */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 text-sm">
            Έχετε αποδεχθεί τους όρους χρήσης και τον κανονισμό λειτουργίας του γυμναστηρίου.
          </AlertDescription>
        </Alert>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2 text-sm">
            <div className="prose prose-sm max-w-none">
              <h3 className="font-semibold text-base mb-3">ΕΣΩΤΕΡΙΚΟΣ ΚΑΝΟΝΙΣΜΟΣ ΛΕΙΤΟΥΡΓΙΑΣ ΓΥΜΝΑΣΤΗΡΙΟΥ</h3>
              
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
                Τα προσωπικά σας δεδομένα χρησιμοποιούνται αποκλειστικά για τη λειτουργία του γυμναστηρίου
                και δεν κοινοποιούνται σε τρίτους χωρίς συγκατάθεση. Έχετε δικαίωμα πρόσβασης, 
                διόρθωσης και διαγραφής των δεδομένων σας σύμφωνα με τον Κανονισμό GDPR.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onAgree} className="w-full">
            Κλείσιμο
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GymRulesModal;
