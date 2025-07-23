
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
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Κανόνες Γυμναστηρίου</DialogTitle>
          <DialogDescription>
            Παρακαλούμε διαβάστε και συμφωνήστε με τους παρακάτω κανόνες πριν συνεχίσετε.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 py-2">
            <h3 className="text-sm font-medium">Γενικοί Κανόνες</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Όλα τα μέλη πρέπει να σκανάρουν την κάρτα μελών τους κατά την είσοδο.</li>
              <li>Απαιτείται κατάλληλη αθλητική ενδυμασία και καθαρά αθλητικά παπούτσια.</li>
              <li>Παρακαλούμε φέρτε πετσέτα και χρησιμοποιήστε την κατά τη διάρκεια της προπόνησής σας.</li>
              <li>Καθαρίστε τον εξοπλισμό μετά τη χρήση.</li>
              <li>Επιστρέψτε τα βάρη και τον εξοπλισμό στις κατάλληλες θέσεις τους μετά τη χρήση.</li>
              <li>Σεβαστείτε τον χώρο και τον χρόνο προπόνησης των άλλων μελών.</li>
            </ul>
            
            <h3 className="text-sm font-medium">Παρακολούθηση Μαθημάτων</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Φτάστε τουλάχιστον 5 λεπτά πριν την έναρξη του μαθήματος.</li>
              <li>Οι καθυστερημένες αφίξεις ενδέχεται να μην επιτρέπονται να συμμετάσχουν σε μαθήματα σε εξέλιξη.</li>
              <li>Οι ακυρώσεις πρέπει να γίνονται τουλάχιστον 4 ώρες πριν την έναρξη του μαθήματος.</li>
              <li>Η μη εμφάνιση θα έχει ως αποτέλεσμα την αφαίρεση του μαθήματος από το πακέτο σας.</li>
            </ul>
            
            <h3 className="text-sm font-medium">Προσωπική Προπόνηση</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Απαιτείται 24ωρη προειδοποίηση ακύρωσης για όλες τις συνεδρίες προσωπικής προπόνησης.</li>
              <li>Οι καθυστερημένες ακυρώσεις ή η μη εμφάνιση θα χρεωθούν με το πλήρες κόστος της συνεδρίας.</li>
            </ul>
            
            <h3 className="text-sm font-medium">Χρήση Εγκαταστάσεων</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Η χρήση των ντουλαπιών περιορίζεται στον χρόνο παραμονής σας στις εγκαταστάσεις.</li>
              <li>Το Sweat93 δεν είναι υπεύθυνο για χαμένα ή κλεμμένα αντικείμενα.</li>
              <li>Οι κλήσεις κινητού τηλεφώνου δεν επιτρέπονται στους χώρους προπόνησης.</li>
            </ul>
          </div>
        </ScrollArea>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Ακύρωση
          </Button>
          <Button onClick={onAgree} className="sm:ml-auto">
            Κατανοώ και Συμφωνώ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GymRulesModal;
