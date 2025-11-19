import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { waitlistApi } from "@/services/waitlistApi";
import { WaitlistStatusBadge } from "./WaitlistStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Loader2 } from "lucide-react";

interface WaitlistManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  className: string;
}

export function WaitlistManagementDialog({
  open,
  onOpenChange,
  classId,
  className,
}: WaitlistManagementDialogProps) {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && classId) {
      loadWaitlist();
    }
  }, [open, classId]);

  const loadWaitlist = async () => {
    try {
      setLoading(true);
      const response = await waitlistApi.getClassWaitlist(classId);
      setWaitlist(response.waitlist || []);
    } catch (error: any) {
      toast.error("Σφάλμα", {
        description: error.message || "Αποτυχία φόρτωσης λίστας αναμονής",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Λίστα Αναμονής - {className}</DialogTitle>
          <DialogDescription>
            {waitlist.length} {waitlist.length === 1 ? 'άτομο' : 'άτομα'} στη λίστα αναμονής
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Φόρτωση...
            </div>
          ) : waitlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Δεν υπάρχουν άτομα στη λίστα αναμονής
            </div>
          ) : (
            waitlist.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(entry.user?.name || 'N/A')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium truncate">{entry.user?.name || 'Άγνωστο όνομα'}</span>
                    <WaitlistStatusBadge status={entry.status} position={entry.position} />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {entry.user?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{entry.user.email}</span>
                      </span>
                    )}
                    {entry.user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {entry.user.phone}
                      </span>
                    )}
                  </div>

                  {entry.notified_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Ειδοποιήθηκε: {new Date(entry.notified_at).toLocaleString('el-GR')}
                    </div>
                  )}

                  {entry.created_at && (
                    <div className="text-xs text-muted-foreground">
                      Προστέθηκε: {new Date(entry.created_at).toLocaleString('el-GR')}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
