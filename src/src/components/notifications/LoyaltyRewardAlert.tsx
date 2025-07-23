import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Star } from "lucide-react";

interface LoyaltyRewardAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pointsEarned: number;
  rewardName: string;
  rewardExpiresInDays: number;
}

const LoyaltyRewardAlert: React.FC<LoyaltyRewardAlertProps> = ({
  open,
  onOpenChange,
  pointsEarned,
  rewardName,
  rewardExpiresInDays,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
            <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold">Συγχαρητήρια!</DialogTitle>
          <DialogDescription className="text-sm sm:text-md text-muted-foreground">
            Μόλις κερδίσατε νέους πόντους και ένα δώρο!
          </DialogDescription>
        </DialogHeader>
        <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
          <div className="bg-muted p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">Κερδίσατε</p>
            <p className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
              {pointsEarned} <Star className="h-5 w-5 sm:h-6 sm:w-6 ml-2 text-yellow-400 fill-yellow-400" />
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">πόντους</p>
          </div>
          <div className="bg-muted p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">Ξεκλειδώσατε το δώρο</p>
            <p className="text-lg sm:text-xl font-semibold text-primary">{rewardName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Μπορείτε να το εξαργυρώσετε μέσα στις επόμενες {rewardExpiresInDays} ημέρες.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full h-10 sm:h-auto">
            Τέλεια!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoyaltyRewardAlert; 