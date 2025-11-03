import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Coins, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookWithPointsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    payment_method: 'full_points' | 'partial' | 'cash_only';
    points_to_use?: number;
  }) => Promise<void>;
  classInfo: {
    id: number;
    name: string;
    price: number;
  };
  userPoints: number;
}

export const BookWithPointsDialog: React.FC<BookWithPointsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  classInfo,
  userPoints,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'full_points' | 'partial' | 'cash_only'>('full_points');
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Points required for this class (1 point = 1 euro)
  const pointsRequired = classInfo.price;

  // Can user afford full points payment?
  const canAffordFullPoints = userPoints >= pointsRequired;

  // Initialize points to use
  useEffect(() => {
    if (isOpen) {
      if (canAffordFullPoints) {
        setPaymentMethod('full_points');
        setPointsToUse(pointsRequired);
      } else if (userPoints > 0) {
        setPaymentMethod('partial');
        setPointsToUse(Math.min(userPoints, pointsRequired));
      } else {
        setPaymentMethod('cash_only');
        setPointsToUse(0);
      }
    }
  }, [isOpen, userPoints, pointsRequired, canAffordFullPoints]);

  // Update points to use when payment method changes
  useEffect(() => {
    if (paymentMethod === 'full_points') {
      setPointsToUse(pointsRequired);
    } else if (paymentMethod === 'cash_only') {
      setPointsToUse(0);
    } else if (paymentMethod === 'partial' && pointsToUse === 0) {
      setPointsToUse(Math.min(userPoints, pointsRequired));
    }
  }, [paymentMethod, pointsRequired, userPoints]);

  // Calculate amounts
  const pointsUsed = paymentMethod === 'cash_only' ? 0 : pointsToUse;
  const cashAmount = classInfo.price - pointsUsed;
  const remainingPoints = userPoints - pointsUsed;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm({
        payment_method: paymentMethod,
        points_to_use: pointsUsed > 0 ? pointsUsed : undefined,
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-purple-600" />
            Κράτηση με Πόντους Loyalty
          </DialogTitle>
          <DialogDescription>
            Επιλέξτε πώς θέλετε να πληρώσετε για αυτό το μάθημα
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Class Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{classInfo.name}</p>
                  <p className="text-sm text-muted-foreground">Κόστος: €{classInfo.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Πόντοι Απαιτούνται: {pointsRequired} πόντοι</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Points Badge */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="text-sm font-medium">Διαθέσιμοι Πόντοι:</span>
            <Badge className="bg-purple-600 hover:bg-purple-700">
              <Coins className="h-3 w-3 mr-1" />
              {userPoints} πόντοι
            </Badge>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Τρόπος Πληρωμής</Label>

            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              {/* Full Points Option */}
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value="full_points" id="full_points" disabled={!canAffordFullPoints} />
                <div className="flex-1">
                  <Label
                    htmlFor="full_points"
                    className={`cursor-pointer ${!canAffordFullPoints ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Πλήρης Πληρωμή με Πόντους</span>
                      {canAffordFullPoints && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Χρήση {pointsRequired} πόντων - Χωρίς χρέωση
                    </p>
                    {!canAffordFullPoints && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Ανεπαρκείς πόντοι (χρειάζεστε {pointsRequired - userPoints} ακόμα)
                      </p>
                    )}
                  </Label>
                </div>
              </div>

              {/* Partial Payment Option */}
              {userPoints > 0 && (
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value="partial" id="partial" />
                  <div className="flex-1">
                    <Label htmlFor="partial" className="cursor-pointer">
                      <div className="font-medium">Μερική Πληρωμή (Πόντοι + Μετρητά)</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Επιλέξτε πόσους πόντους θέλετε να χρησιμοποιήσετε
                      </p>
                    </Label>

                    {paymentMethod === 'partial' && (
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Πόντοι προς χρήση:</span>
                          <Badge variant="outline">{pointsToUse} πόντοι</Badge>
                        </div>
                        <Slider
                          value={[pointsToUse]}
                          onValueChange={(value) => setPointsToUse(value[0])}
                          min={1}
                          max={Math.min(userPoints, pointsRequired)}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1</span>
                          <span>{Math.min(userPoints, pointsRequired)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cash Only Option */}
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value="cash_only" id="cash_only" />
                <div className="flex-1">
                  <Label htmlFor="cash_only" className="cursor-pointer">
                    <div className="font-medium">Μόνο Μετρητά (Χωρίς Πόντους)</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Πλήρης πληρωμή €{classInfo.price.toFixed(2)} - Δεν χρησιμοποιούνται πόντοι
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Summary */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold text-sm mb-3">Σύνοψη Πληρωμής</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Πόντοι:</span>
                  <span className="font-medium text-purple-700">
                    {pointsUsed > 0 ? `${pointsUsed} πόντοι` : '0 πόντοι'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Μετρητά:</span>
                  <span className="font-medium">€{cashAmount.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Υπόλοιπο μετά την κράτηση:</span>
                    <Badge className="bg-purple-600 hover:bg-purple-700">
                      <Coins className="h-3 w-3 mr-1" />
                      {remainingPoints} πόντοι
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Ακύρωση
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Επεξεργασία...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Επιβεβαίωση Κράτησης
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
