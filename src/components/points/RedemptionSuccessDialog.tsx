import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface RedemptionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  redemptionData: {
    reward_code: string;
    reward_name: string;
    points_spent: number;
    instructions: string;
    expires_at: string;
    status: string;
  } | null;
}

export const RedemptionSuccessDialog: React.FC<RedemptionSuccessDialogProps> = ({
  isOpen,
  onClose,
  redemptionData,
}) => {
  if (!redemptionData) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(redemptionData.reward_code);
    toast.success('Ο κωδικός αντιγράφηκε!');
  };

  const formatExpiryDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Επιτυχία! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Η ανταμοιβή εξαργυρώθηκε επιτυχώς
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reward Name */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-purple-600 mb-1">Ανταμοιβή</p>
                <p className="font-semibold text-lg text-purple-900">
                  {redemptionData.reward_name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reward Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Κωδικός Εξαργύρωσης
            </label>
            <div className="flex items-center gap-2">
              <Card className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300">
                <CardContent className="p-3">
                  <p className="text-center font-mono text-xl font-bold text-gray-900 tracking-wider">
                    {redemptionData.reward_code}
                  </p>
                </CardContent>
              </Card>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Οδηγίες Χρήσης
                  </p>
                  <p className="text-sm text-blue-700">
                    {redemptionData.instructions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points & Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Πόντοι που Χρησιμοποιήθηκαν</p>
                <p className="text-lg font-bold text-purple-600">
                  {redemptionData.points_spent}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="h-3 w-3 text-gray-600" />
                  <p className="text-xs text-gray-600">Λήγει</p>
                </div>
                <p className="text-xs font-semibold text-gray-900">
                  {formatExpiryDate(redemptionData.expires_at)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              className={`${
                redemptionData.status === 'active'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
              variant="outline"
            >
              {redemptionData.status === 'active' ? '✓ Ενεργό' : redemptionData.status}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Εντάξει
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
