import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, CreditCard, Phone, MapPin, Mail } from "lucide-react";
import { toast } from "sonner";
import { SignaturePad, SignaturePadRef } from "@/components/SignaturePad";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ParentConsentData {
  parentFullName: string;
  fatherFirstName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherLastName: string;
  parentBirthDate: string;
  parentIdNumber: string;
  parentPhone: string;
  parentLocation: string;
  parentStreet: string;
  parentStreetNumber: string;
  parentPostalCode: string;
  parentEmail: string;
  consentAccepted: boolean;
  signature: string;
}

interface ParentConsentStepProps {
  childFirstName: string;
  childLastName: string;
  onComplete: (data: ParentConsentData) => void;
  onBack: () => void;
}

export const ParentConsentStep: React.FC<ParentConsentStepProps> = ({ 
  childFirstName, 
  childLastName,
  onComplete, 
  onBack 
}) => {
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const [parentData, setParentData] = useState<ParentConsentData>({
    parentFullName: "",
    fatherFirstName: "",
    fatherLastName: "",
    motherFirstName: "",
    motherLastName: "",
    parentBirthDate: "",
    parentIdNumber: "",
    parentPhone: "",
    parentLocation: "",
    parentStreet: "",
    parentStreetNumber: "",
    parentPostalCode: "",
    parentEmail: "",
    consentAccepted: false,
    signature: ""
  });

  const updateParentData = (updates: Partial<ParentConsentData>) => {
    setParentData(prev => ({ ...prev, ...updates }));
  };

  // Quick fill function for testing
  const fillTestData = () => {
    setParentData({
      parentFullName: "",
      fatherFirstName: "",
      fatherLastName: "",
      motherFirstName: "Μαρία",
      motherLastName: "Γεωργίου",
      parentBirthDate: "1978-08-09",
      parentIdNumber: "ΑΙ908388",
      parentPhone: "6945678901",
      parentLocation: "Αθήνα",
      parentStreet: "Πανεπιστημίου",
      parentStreetNumber: "42",
      parentPostalCode: "10434",
      parentEmail: "parent.test@example.com",
      consentAccepted: true,
      signature: ""
    });
    toast.success("Συμπληρώθηκαν στοιχεία γονέα για δοκιμή");
  };

  const handleNext = () => {
    // Validation
    if (!parentData.parentFullName || !parentData.fatherFirstName || !parentData.fatherLastName ||
        !parentData.motherFirstName || !parentData.motherLastName || !parentData.parentBirthDate ||
        !parentData.parentIdNumber || !parentData.parentPhone || !parentData.parentLocation ||
        !parentData.parentStreet || !parentData.parentStreetNumber || !parentData.parentPostalCode ||
        !parentData.parentEmail) {
      toast.error("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία");
      return;
    }

    if (!parentData.consentAccepted) {
      toast.error("Παρακαλώ αποδεχτείτε την υπεύθυνη δήλωση");
      return;
    }

    const sigRef = signaturePadRef.current;
    const signatureData = sigRef?.toDataURLJpeg ? sigRef.toDataURLJpeg() : sigRef?.toDataURL();
    if (!signatureData || signaturePadRef.current?.isEmpty()) {
      toast.error("Παρακαλώ υπογράψτε την υπεύθυνη δήλωση");
      return;
    }

    onComplete({
      ...parentData,
      signature: signatureData
    });
  };

  const childFullName = `${childFirstName} ${childLastName}`;

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Επειδή το παιδί σας είναι ανήλικο, απαιτείται η συγκατάθεση του γονέα/κηδεμόνα για την εγγραφή στο γυμναστήριο.
        </AlertDescription>
      </Alert>

      {/* Test button for quick fill */}
      <div className="flex gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="text-xs text-yellow-800 dark:text-yellow-200 mr-2">Δοκιμή:</div>
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={fillTestData}
          className="text-xs"
        >
          Συμπλήρωση Στοιχείων Γονέα
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Στοιχεία Γονέα/Κηδεμόνα
          </CardTitle>
          <CardDescription>
            Συμπληρώστε τα στοιχεία του γονέα/κηδεμόνα που δίνει τη συγκατάθεση
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="parentFullName">Ονοματεπώνυμο Γονέα/Κηδεμόνα *</Label>
            <Input
              id="parentFullName"
              type="text"
              placeholder="Πλήρες όνομα γονέα/κηδεμόνα"
              value={parentData.parentFullName}
              onChange={(e) => updateParentData({ parentFullName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fatherFirstName">Όνομα Πατέρα *</Label>
              <Input
                id="fatherFirstName"
                type="text"
                placeholder="π.χ. Νικόλαος"
                value={parentData.fatherFirstName}
                onChange={(e) => updateParentData({ fatherFirstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherLastName">Επώνυμο Πατέρα *</Label>
              <Input
                id="fatherLastName"
                type="text"
                placeholder="Επώνυμο πατρός"
                value={parentData.fatherLastName}
                onChange={(e) => updateParentData({ fatherLastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motherFirstName">Όνομα Μητέρας *</Label>
              <Input
                id="motherFirstName"
                type="text"
                placeholder="π.χ. Μαρία"
                value={parentData.motherFirstName}
                onChange={(e) => updateParentData({ motherFirstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherLastName">Επώνυμο Μητέρας *</Label>
              <Input
                id="motherLastName"
                type="text"
                placeholder="π.χ. Γεωργίου"
                value={parentData.motherLastName}
                onChange={(e) => updateParentData({ motherLastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentBirthDate">Ημερομηνία Γέννησης *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="parentBirthDate"
                  type="date"
                  value={parentData.parentBirthDate}
                  onChange={(e) => updateParentData({ parentBirthDate: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentIdNumber">Αριθμός Δελτίου Ταυτότητας *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="parentIdNumber"
                  type="text"
                  placeholder="π.χ. ΑΒ123456"
                  value={parentData.parentIdNumber}
                  onChange={(e) => updateParentData({ parentIdNumber: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone">Τηλέφωνο *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="parentPhone"
                type="tel"
                placeholder="π.χ. 6901234567"
                value={parentData.parentPhone}
                onChange={(e) => updateParentData({ parentPhone: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Διεύθυνση
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentLocation">Τόπος *</Label>
                <Input
                  id="parentLocation"
                  type="text"
                  placeholder="π.χ. Αθήνα"
                  value={parentData.parentLocation}
                  onChange={(e) => updateParentData({ parentLocation: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPostalCode">Τ.Κ. *</Label>
                <Input
                  id="parentPostalCode"
                  type="text"
                  placeholder="π.χ. 10434"
                  value={parentData.parentPostalCode}
                  onChange={(e) => updateParentData({ parentPostalCode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="parentStreet">Οδός *</Label>
                <Input
                  id="parentStreet"
                  type="text"
                  placeholder="π.χ. Πανεπιστημίου"
                  value={parentData.parentStreet}
                  onChange={(e) => updateParentData({ parentStreet: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentStreetNumber">Αριθμός *</Label>
                <Input
                  id="parentStreetNumber"
                  type="text"
                  placeholder="π.χ. 42"
                  value={parentData.parentStreetNumber}
                  onChange={(e) => updateParentData({ parentStreetNumber: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentEmail">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="parentEmail"
                type="email"
                placeholder="π.χ. parent@email.com"
                value={parentData.parentEmail}
                onChange={(e) => updateParentData({ parentEmail: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Υπεύθυνη Δήλωση</CardTitle>
          <CardDescription>
            Διαβάστε προσεκτικά και αποδεχτείτε την υπεύθυνη δήλωση
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-48 w-full rounded-md border p-4">
            <div className="space-y-4 text-sm">
              <p className="font-medium">ΥΠΕΥΘΥΝΗ ΔΗΛΩΣΗ (άρθρο 8 Ν.1599/1986)</p>
              
              <p>
                Με ατομική μου ευθύνη και γνωρίζοντας τις κυρώσεις (3), που προβλέπονται από τις διατάξεις 
                της παρ. 6 του άρθρου 22 του Ν. 1599/1986, δηλώνω ότι:
              </p>
              
              <p>
                Ως γονέας ασκώ την επιμέλεια του/της <strong>{childFullName}</strong> και δίνω τη συγκατάθεσή μου 
                για την εγγραφή του ανηλίκου τέκνου μου <strong>{childFullName}</strong> ως μέλους του 
                γυμναστηρίου SWEAT 93.
              </p>
              
              <p>
                Επιπρόσθετα δηλώνω ότι η εγγραφή αυτή συνεπάγεται και την αποδοχή του κανονισμού λειτουργίας αυτού.
              </p>
            </div>
          </ScrollArea>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="consentAccepted"
              checked={parentData.consentAccepted}
              onCheckedChange={(checked) => 
                updateParentData({ consentAccepted: checked === true })
              }
            />
            <Label htmlFor="consentAccepted" className="text-sm font-medium leading-5">
              Έχω διαβάσει και αποδέχομαι την υπεύθυνη δήλωση
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Υπογραφή Γονέα/Κηδεμόνα *</Label>
            <SignaturePad
              ref={signaturePadRef}
              onClear={() => updateParentData({ signature: "" })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Πίσω
        </Button>
        <Button onClick={handleNext}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
};