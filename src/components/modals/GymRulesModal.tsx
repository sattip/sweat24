
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gym Rules / Κανονισμοί Χώρου</DialogTitle>
          <DialogDescription>
            Please read and agree to the following rules before proceeding.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 py-2">
            <h3 className="text-sm font-medium">General Rules / Γενικοί Κανονισμοί</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>All members must scan their membership card upon entry.</li>
              <li>Appropriate athletic attire and clean sports shoes are required.</li>
              <li>Please bring a towel and use it during your workout.</li>
              <li>Wipe down equipment after use.</li>
              <li>Return weights and equipment to their proper places after use.</li>
              <li>Be respectful of other members' space and workout time.</li>
            </ul>
            
            <h3 className="text-sm font-medium">Class Attendance / Παρακολούθηση Μαθημάτων</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Arrive at least 5 minutes before class starts.</li>
              <li>Late arrivals may not be permitted to join classes in progress.</li>
              <li>Cancellations must be made at least 4 hours before class start time.</li>
              <li>No-shows will result in the class being deducted from your package.</li>
            </ul>
            
            <h3 className="text-sm font-medium">Personal Training / Personal Training</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>24-hour cancellation notice is required for all personal training sessions.</li>
              <li>Late cancellations or no-shows will be charged the full session fee.</li>
            </ul>
            
            <h3 className="text-sm font-medium">Facility Usage / Χρήση Εγκαταστάσεων</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Locker use is limited to your time in the facility.</li>
              <li>Sweat24 is not responsible for lost or stolen items.</li>
              <li>Cell phone calls are not permitted in workout areas.</li>
            </ul>
          </div>
        </ScrollArea>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel / Άκυρο
          </Button>
          <Button onClick={onAgree} className="sm:ml-auto">
            I Understand and Agree / Έχω Διαβάσει και Συμφωνώ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GymRulesModal;
