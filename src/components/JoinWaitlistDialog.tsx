import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { waitlistApi } from "@/services/waitlistApi";
import { Clock, Users } from "lucide-react";

interface JoinWaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  className: string;
  classDate: string;
  classTime: string;
  currentWaitlistCount?: number;
  onJoined?: () => void;
}

export function JoinWaitlistDialog({
  open,
  onOpenChange,
  classId,
  className,
  classDate,
  classTime,
  currentWaitlistCount = 0,
  onJoined,
}: JoinWaitlistDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    try {
      setLoading(true);
      const response = await waitlistApi.join(classId);

      toast.success("Προστεθήκατε στη λίστα αναμονής", {
        description: `Η θέση σας είναι #${response.position}. Θα ειδοποιηθείτε όταν ελευθερωθεί μια θέση.`,
      });

      onOpenChange(false);
      if (onJoined) onJoined();
    } catch (error: any) {
      toast.error("Σφάλμα", {
        description: error.message || "Αποτυχία προσθήκης στη λίστα αναμονής",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Προσθήκη στη Λίστα Αναμονής</DialogTitle>
          <DialogDescription>
            Το μάθημα είναι πλήρες. Θέλετε να προστεθείτε στη λίστα αναμονής;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium mb-2">{className}</h4>
            <p className="text-sm text-muted-foreground">
              📅 {new Date(classDate).toLocaleDateString('el-GR')} στις {classTime}
            </p>
          </div>

          {currentWaitlistCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {currentWaitlistCount} {currentWaitlistCount === 1 ? 'άτομο' : 'άτομα'} ήδη στη λίστα
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-blue-900">Πώς λειτουργεί;</p>
              <p className="text-blue-700 mt-1">
                Θα ειδοποιηθείτε αυτόματα (email & εφαρμογή) όταν ελευθερωθεί μια θέση.
                Θα έχετε 2 ώρες για να επιβεβαιώσετε την κράτησή σας.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Ακύρωση
          </Button>
          <Button onClick={handleJoin} disabled={loading}>
            {loading ? 'Προσθήκη...' : 'Προσθήκη στη Λίστα'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
