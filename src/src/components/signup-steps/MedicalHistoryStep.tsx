import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, AlertTriangle, Users } from "lucide-react";
import { toast } from "sonner";
import { SignupData } from "../SignupSteps";

interface MedicalHistoryStepProps {
  data: SignupData;
  updateData: (updates: Partial<SignupData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MEDICAL_CONDITIONS = [
  "Καρδιακή νόσος",
  "Υπέρταση",
  "Διαβήτης",
  "Άσθμα",
  "Αρθρίτιδα",
  "Προβλήματα σπονδυλικής στήλης",
  "Επιληψία",
  "Άλλο"
];

export const MedicalHistoryStep: React.FC<MedicalHistoryStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  const handleConditionChange = (condition: string, checked: boolean) => {
    const updatedConditions = checked
      ? [...data.conditions, condition]
      : data.conditions.filter(c => c !== condition);
    
    updateData({ conditions: updatedConditions });
  };

  const handleNext = () => {
    // Validation for emergency contact
    if (!data.emergencyContactName || !data.emergencyContactPhone) {
      toast.error("Παρακαλώ συμπληρώστε τα στοιχεία επείγουσας επικοινωνίας");
      return;
    }

    // If user has medical conditions but didn't provide doctor clearance
    if (data.hasConditions && !data.doctorClearance) {
      toast.error("Παρακαλώ επιβεβαιώστε ότι έχετε ιατρική έγκριση για άσκηση");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Ιατρικές Παθήσεις
          </CardTitle>
          <CardDescription>
            Παρακαλώ ενημερώστε μας για τυχόν ιατρικές παθήσεις που μπορεί να επηρεάσουν την άσκηση
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasConditions"
              checked={data.hasConditions}
              onCheckedChange={(checked) => updateData({ hasConditions: checked === true })}
            />
            <Label htmlFor="hasConditions">
              Έχω ιατρικές παθήσεις που μπορεί να επηρεάσουν την άσκηση
            </Label>
          </div>

          {data.hasConditions && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="space-y-2">
                <Label>Επιλέξτε τις παθήσεις που σας αφορούν:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MEDICAL_CONDITIONS.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={data.conditions.includes(condition)}
                        onCheckedChange={(checked) => 
                          handleConditionChange(condition, checked === true)
                        }
                      />
                      <Label htmlFor={condition} className="text-sm">
                        {condition}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {data.conditions.includes("Άλλο") && (
                <div className="space-y-2">
                  <Label htmlFor="otherCondition">Περιγράψτε την άλλη πάθηση:</Label>
                  <Input
                    id="otherCondition"
                    value={data.otherCondition}
                    onChange={(e) => updateData({ otherCondition: e.target.value })}
                    placeholder="Περιγράψτε την πάθηση..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="medications">Φάρμακα που λαμβάνετε (προαιρετικό):</Label>
                <Textarea
                  id="medications"
                  value={data.medications}
                  onChange={(e) => updateData({ medications: e.target.value })}
                  placeholder="Αναφέρετε τα φάρμακα που λαμβάνετε..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="doctorClearance"
                  checked={data.doctorClearance}
                  onCheckedChange={(checked) => updateData({ doctorClearance: checked === true })}
                />
                <Label htmlFor="doctorClearance">
                  Έχω ιατρική έγκριση για συμμετοχή σε προγράμματα άσκησης
                </Label>
              </div>

              {data.hasConditions && !data.doctorClearance && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Συνιστούμε να συμβουλευτείτε τον γιατρό σας πριν την έναρξη του προγράμματος άσκησης.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Injuries */}
      <Card>
        <CardHeader>
          <CardTitle>Τραυματισμοί</CardTitle>
          <CardDescription>
            Ενημερώστε μας για τυχόν τραυματισμούς που μπορεί να επηρεάσουν την προπόνηση
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="injuries">Προηγούμενοι τραυματισμοί (προαιρετικό):</Label>
            <Textarea
              id="injuries"
              value={data.injuries}
              onChange={(e) => updateData({ injuries: e.target.value })}
              placeholder="Περιγράψτε τυχόν τραυματισμούς που μπορεί να επηρεάσουν την άσκηση..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Επείγουσα Επικοινωνία
          </CardTitle>
          <CardDescription>
            Στοιχεία ατόμου που μπορούμε να επικοινωνήσουμε σε περίπτωση ανάγκης
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Όνομα επικοινωνίας *</Label>
            <Input
              id="emergencyContactName"
              value={data.emergencyContactName}
              onChange={(e) => updateData({ emergencyContactName: e.target.value })}
              placeholder="Όνομα και επώνυμο"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Τηλέφωνο επικοινωνίας *</Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={data.emergencyContactPhone}
              onChange={(e) => updateData({ emergencyContactPhone: e.target.value })}
              placeholder="6901234567"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Πίσω
        </Button>
        <Button onClick={handleNext}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
}; 