import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, AlertTriangle, Users, Cigarette, Activity, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SignupData } from "../SignupSteps";

interface MedicalHistoryStepProps {
  data: SignupData;
  updateData: (updates: Partial<SignupData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Extended list of medical conditions based on typical gym medical questionnaires
const MEDICAL_CONDITIONS = [
  "Καρδιακή νόσος ή καρδιακό επεισόδιο",
  "Υπέρταση (υψηλή πίεση)",
  "Χαμηλή πίεση αίματος",
  "Διαβήτης τύπου 1 ή 2",
  "Υπερχοληστερολαιμία",
  "Άσθμα ή αναπνευστικά προβλήματα",
  "Επιληψία",
  "Αρθρίτιδα ή αρθρώσεις",
  "Οστεοπόρωση",
  "Προβλήματα σπονδυλικής στήλης",
  "Κήλες (αυχενική, οσφυϊκή)",
  "Προβλήματα θυρεοειδούς",
  "Νεφρικά προβλήματα",
  "Ηπατικά προβλήματα", 
  "Αναιμία",
  "Ημικρανίες",
  "Αλλεργίες (φάρμακα, τρόφιμα)",
  "Ψυχολογικά προβλήματα (άγχος, κατάθλιψη)",
  "Διατροφικές διαταραχές",
  "Εγχειρήσεις στο παρελθόν",
  "Τραυματισμοί ή κατάγματα",
  "Προβλήματα ισορροπίας",
  "Κιρσούς",
  "Πρόβλημα κροταφογναθικής άρθρωσης",
  "Άλλη πάθηση"
];

// EMS Contraindications - Absolute
const EMS_ABSOLUTE_CONTRAINDICATIONS = [
  "Βηματοδότης",
  "Εγκυμοσύνη",
  "Πυρετός, οξείες βακτηριακές ή ιογενείς λοιμώξεις",
  "Θρόμβωση / Θρομβοφλεβίτιδα",
  "Stent ή Bypass (εντός τελευταίων 6 μηνών)",
  "Αρτηριοσκλήρωση σε προχωρημένο στάδιο",
  "Υψηλή αρτηριακή πίεση (χωρίς ιατρικό έλεγχο)",
  "Αιμορραγικές διαταραχές",
  "Νεοπλασματικές ασθένειες (όγκοι – καρκίνος)",
  "Οξεία αρθρίτιδα",
  "Νευρολογικές ασθένειες",
  "Προοδευτική μυϊκή δυστροφία",
  "Κήλες κοιλιακού τοιχώματος ή βουβωνοκήλες",
  "Λεμφοίδημα"
];

// EMS Contraindications - Relative (with medical advice)
const EMS_RELATIVE_CONTRAINDICATIONS = [
  "Καρδιολογικές παθήσεις",
  "Καρδιακές αρρυθμίες",
  "Σακχαρώδης διαβήτης τύπου I",
  "Επιληψία (κατά περίπτωση)",
  "Πρόσφατες επεμβάσεις (6–8 μήνες)",
  "Ασκίτης, πνευμονικά ή πλευρικά υγρά",
  "Δερματοπάθειες",
  "Οξύς μη διαγνωσμένος πόνος στη μέση",
  "Οξεία νευραλγία / οξεία κήλη δίσκου",
  "Κήροι (αποφυγή περιοχής)",
  "Εσωτερικές παθήσεις οργάνων (π.χ. νεφρά)",
  "Φαρμακευτική αγωγή",
  "Πρόσφατες φλεγμονές ή τραυματισμοί",
  "Έγκαυμα από τον ήλιο"
];

export const MedicalHistoryStep: React.FC<MedicalHistoryStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  // Quick fill function for testing
  const fillTestData = () => {
    updateData({
      medicalConditions: {
        "Διαβήτης τύπου 1 ή 2": { hasCondition: true, yearOfOnset: "2020", details: "" }
      },
      currentHealthProblems: { hasProblems: false },
      prescribedMedications: [
        { medication: "", reason: "" },
        { medication: "", reason: "" },
        { medication: "", reason: "" }
      ],
      smoking: { currentlySmoking: false, everSmoked: false },
      physicalActivity: { 
        description: "Περπάτημα", 
        frequency: "3 φορές την εβδομάδα", 
        duration: "30 λεπτά" 
      },
      emergencyContactName: "",
      emergencyContactPhone: "",
      emsInterest: true,
      emsContraindications: {
        "Βηματοδότης": { hasCondition: true, yearOfOnset: "2019" }
      },
      emsLiabilityAccepted: true
    });
    toast.success("Συμπληρώθηκαν ιατρικά στοιχεία για δοκιμή");
  };
  

  const handleEmsContraindicationChange = (condition: string, hasCondition: boolean) => {
    const updatedConditions = {
      ...data.emsContraindications,
      [condition]: {
        hasCondition,
        yearOfOnset: hasCondition ? data.emsContraindications[condition]?.yearOfOnset || "" : undefined,
      }
    };
    
    if (!hasCondition) {
      delete updatedConditions[condition];
    }
    
    updateData({ emsContraindications: updatedConditions });
  };

  const handleEmsContraindicationDetails = (condition: string, field: 'yearOfOnset', value: string) => {
    const updatedConditions = {
      ...data.emsContraindications,
      [condition]: {
        ...data.emsContraindications[condition],
        [field]: value
      }
    };
    
    updateData({ emsContraindications: updatedConditions });
  };

  const handleConditionChange = (condition: string, hasCondition: boolean) => {
    const updatedConditions = {
      ...data.medicalConditions,
      [condition]: {
        hasCondition,
        yearOfOnset: hasCondition ? data.medicalConditions[condition]?.yearOfOnset || "" : undefined,
        details: hasCondition ? data.medicalConditions[condition]?.details || "" : undefined,
      }
    };
    
    if (!hasCondition) {
      delete updatedConditions[condition];
    }
    
    updateData({ medicalConditions: updatedConditions });
  };

  const handleConditionDetails = (condition: string, field: 'yearOfOnset' | 'details', value: string) => {
    const updatedConditions = {
      ...data.medicalConditions,
      [condition]: {
        ...data.medicalConditions[condition],
        [field]: value
      }
    };
    
    updateData({ medicalConditions: updatedConditions });
  };

  const handleMedicationChange = (index: number, field: 'medication' | 'reason', value: string) => {
    const updatedMedications = [...data.prescribedMedications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    updateData({ prescribedMedications: updatedMedications });
  };

  const addMedicationField = () => {
    updateData({ 
      prescribedMedications: [...data.prescribedMedications, { medication: "", reason: "" }]
    });
  };

  const removeMedicationField = (index: number) => {
    if (data.prescribedMedications.length > 3) {
      const updatedMedications = data.prescribedMedications.filter((_, i) => i !== index);
      updateData({ prescribedMedications: updatedMedications });
    }
  };

  const handleSmokingChange = (field: string, value: string | boolean) => {
    const updatedSmoking = { ...data.smoking, [field]: value };
    
    // Reset conditional fields when main selection changes
    if (field === 'currentlySmoking') {
      if (value === true) {
        delete updatedSmoking.everSmoked;
        delete updatedSmoking.smokingYears;
        delete updatedSmoking.quitYearsAgo;
      } else {
        delete updatedSmoking.dailyCigarettes;
      }
    }
    
    if (field === 'everSmoked' && value === false) {
      delete updatedSmoking.smokingYears;
      delete updatedSmoking.quitYearsAgo;
    }
    
    updateData({ smoking: updatedSmoking });
  };

  const handleNext = () => {
    // Validation for emergency contact
    if (!data.emergencyContactName || !data.emergencyContactPhone) {
      toast.error("Παρακαλώ συμπληρώστε τα στοιχεία επείγουσας επικοινωνίας");
      return;
    }



    // Validate year fields for medical conditions
    const conditionsWithYears = Object.values(data.medicalConditions).filter(
      condition => condition.hasCondition && condition.yearOfOnset
    );
    
    for (const condition of conditionsWithYears) {
      if (condition.yearOfOnset && (isNaN(Number(condition.yearOfOnset)) || Number(condition.yearOfOnset) < 1900 || Number(condition.yearOfOnset) > new Date().getFullYear())) {
        toast.error("Παρακαλώ εισάγετε έγκυρο έτος έναρξης για τις ιατρικές καταστάσεις");
        return;
      }
    }

    // If EMS interest is selected, validate EMS contraindications years and liability acceptance
    if (data.emsInterest) {
      // Check if EMS liability declaration is accepted
      if (!data.emsLiabilityAccepted) {
        toast.error("Παρακαλώ αποδεχτείτε την υπεύθυνη δήλωση για προπόνηση με EMS για να συνεχίσετε");
        return;
      }

      const emsConditionsWithYears = Object.values(data.emsContraindications).filter(
        condition => condition.hasCondition && condition.yearOfOnset
      );
      
      for (const condition of emsConditionsWithYears) {
        if (condition.yearOfOnset && (isNaN(Number(condition.yearOfOnset)) || Number(condition.yearOfOnset) < 1900 || Number(condition.yearOfOnset) > new Date().getFullYear())) {
          toast.error("Παρακαλώ εισάγετε έγκυρο έτος έναρξης για τις αντενδείξεις EMS");
          return;
        }
      }
    }

    onNext();
  };

  const hasAnyMedicalConditions = Object.values(data.medicalConditions).some(condition => condition.hasCondition);

  return (
    <div className="space-y-6">
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
          Συμπλήρωση Ιατρικών Στοιχείων
        </Button>
      </div>
      
      <div className="space-y-6 max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-2 md:pr-4 -webkit-overflow-scrolling-touch">
        <div className="space-y-6">
          {/* Section 1: Medical Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                1. Υπάρχει κάποια από τις ακόλουθες καταστάσεις;
              </CardTitle>
              <CardDescription>
                Παρακαλώ επιλέξτε "ΝΑΙ" για όσες καταστάσεις σας αφορούν και συμπληρώστε το έτος έναρξης
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {MEDICAL_CONDITIONS.map((condition) => (
                  <div key={condition} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={data.medicalConditions[condition]?.hasCondition || false}
                          onCheckedChange={(checked) => 
                            handleConditionChange(condition, checked === true)
                          }
                        />
                        <Label htmlFor={condition} className="text-sm font-medium">
                          {condition}
                        </Label>
                      </div>
                    </div>
                    
                    {data.medicalConditions[condition]?.hasCondition && (
                      <div className="ml-6 space-y-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Έτος έναρξης</Label>
                            <Input
                              type="number"
                              placeholder="π.χ. 2020"
                              min="1900"
                              max={new Date().getFullYear()}
                              value={data.medicalConditions[condition]?.yearOfOnset || ""}
                              onChange={(e) => handleConditionDetails(condition, 'yearOfOnset', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex-2">
                            <Label className="text-xs text-muted-foreground">Λεπτομέρειες (προαιρετικό)</Label>
                            <Input
                              placeholder="Περιγράψτε εάν χρειάζεται..."
                              value={data.medicalConditions[condition]?.details || ""}
                              onChange={(e) => handleConditionDetails(condition, 'details', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Current Health Problems */}
          <Card>
            <CardHeader>
              <CardTitle>2. Υπάρχουν τρέχοντα προβλήματα υγείας;</CardTitle>
              <CardDescription>
                Αναφέρετε οποιαδήποτε τρέχοντα προβλήματα υγείας που μπορεί να επηρεάσουν την άσκηση
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="currentHealthProblems"
                  checked={data.currentHealthProblems.hasProblems}
                  onCheckedChange={(checked) => 
                    updateData({ 
                      currentHealthProblems: { 
                        hasProblems: checked === true,
                        details: checked === true ? data.currentHealthProblems.details : undefined
                      }
                    })
                  }
                />
                <Label htmlFor="currentHealthProblems">
                  Έχω τρέχοντα προβλήματα υγείας
                </Label>
              </div>

              {data.currentHealthProblems.hasProblems && (
                <div className="space-y-2">
                  <Label>Παρακαλείστε να τα περιγράψετε:</Label>
                  <Textarea
                    placeholder="Περιγράψτε τα τρέχοντα προβλήματα υγείας..."
                    value={data.currentHealthProblems.details || ""}
                    onChange={(e) => 
                      updateData({ 
                        currentHealthProblems: { 
                          ...data.currentHealthProblems,
                          details: e.target.value
                        }
                      })
                    }
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Prescribed Medications */}
          <Card>
            <CardHeader>
              <CardTitle>3. Καταγράψτε τα συνταγογραφημένα φάρμακα</CardTitle>
              <CardDescription>
                Αναφέρετε όλα τα φάρμακα που λαμβάνετε με συνταγή γιατρού
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.prescribedMedications.map((med, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">Φάρμακο {index + 1}</Label>
                    <Input
                      placeholder="Όνομα φαρμάκου"
                      value={med.medication}
                      onChange={(e) => handleMedicationChange(index, 'medication', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">Αιτιολογία</Label>
                    <Input
                      placeholder="Για ποιο λόγο το παίρνετε"
                      value={med.reason}
                      onChange={(e) => handleMedicationChange(index, 'reason', e.target.value)}
                    />
                  </div>
                  {data.prescribedMedications.length > 3 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeMedicationField(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addMedicationField}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Προσθήκη άλλου φαρμάκου
              </Button>
            </CardContent>
          </Card>

          {/* Section 4: Smoking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cigarette className="h-5 w-5 text-orange-500" />
                4. Καπνίζετε;
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={data.smoking.currentlySmoking ? "yes" : "no"}
                onValueChange={(value) => handleSmokingChange('currentlySmoking', value === "yes")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="smoking-no" />
                  <Label htmlFor="smoking-no">Όχι</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="smoking-yes" />
                  <Label htmlFor="smoking-yes">Ναι</Label>
                </div>
              </RadioGroup>

              {data.smoking.currentlySmoking === true && (
                <div className="space-y-2 pl-6">
                  <Label>Μέσος ημερήσιος αριθμός τσιγάρων:</Label>
                  <Input
                    type="number"
                    placeholder="π.χ. 10"
                    min="0"
                    value={data.smoking.dailyCigarettes || ""}
                    onChange={(e) => handleSmokingChange('dailyCigarettes', e.target.value)}
                  />
                </div>
              )}

              {data.smoking.currentlySmoking === false && (
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label>Εάν ΌΧΙ, έχετε καπνίσει ποτέ;</Label>
                    <RadioGroup
                      value={data.smoking.everSmoked === undefined ? "" : data.smoking.everSmoked ? "yes" : "no"}
                      onValueChange={(value) => handleSmokingChange('everSmoked', value === "yes")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ever-smoked-no" />
                        <Label htmlFor="ever-smoked-no">Όχι</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ever-smoked-yes" />
                        <Label htmlFor="ever-smoked-yes">Ναι</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {data.smoking.everSmoked === true && (
                    <div className="space-y-4 pl-6">
                      <div className="space-y-2">
                        <Label>Για πόσα χρόνια;</Label>
                        <Input
                          type="number"
                          placeholder="π.χ. 5"
                          min="0"
                          value={data.smoking.smokingYears || ""}
                          onChange={(e) => handleSmokingChange('smokingYears', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Πριν από πόσα χρόνια διακόψατε;</Label>
                        <Input
                          type="number"
                          placeholder="π.χ. 2"
                          min="0"
                          value={data.smoking.quitYearsAgo || ""}
                          onChange={(e) => handleSmokingChange('quitYearsAgo', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5: Physical Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                5. Ασχολείστε με κάποια φυσική δραστηριότητα;
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Περιγραφή δραστηριότητας:</Label>
                <Textarea
                  placeholder="Περιγράψτε τη φυσική δραστηριότητα που ασχολείστε (π.χ. τρέξιμο, ποδήλατο, κολύμβηση, γυμναστήριο, κτλ.)"
                  value={data.physicalActivity.description}
                  onChange={(e) => 
                    updateData({ 
                      physicalActivity: { 
                        ...data.physicalActivity, 
                        description: e.target.value 
                      }
                    })
                  }
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Πόσο συχνά;</Label>
                  <Input
                    placeholder="π.χ. 3 φορές την εβδομάδα"
                    value={data.physicalActivity.frequency}
                    onChange={(e) => 
                      updateData({ 
                        physicalActivity: { 
                          ...data.physicalActivity, 
                          frequency: e.target.value 
                        }
                      })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Για πόση διάρκεια κάθε φορά;</Label>
                  <Input
                    placeholder="π.χ. 45 λεπτά"
                    value={data.physicalActivity.duration}
                    onChange={(e) => 
                      updateData({ 
                        physicalActivity: { 
                          ...data.physicalActivity, 
                          duration: e.target.value 
                        }
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: EMS Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                6. Ενδιαφέρεστε να κάνετε EMS;
              </CardTitle>
              <CardDescription>
                Ηλεκτρομυϊκή διέγερση (Electrical Muscle Stimulation)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="emsInterest"
                  checked={data.emsInterest}
                  onCheckedChange={(checked) => 
                    updateData({ emsInterest: checked === true })
                  }
                />
                <Label htmlFor="emsInterest" className="text-sm leading-5">
                  Ναι, ενδιαφέρομαι να κάνω προπόνηση με EMS
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: EMS Contraindications - Only show if interested in EMS */}
          {data.emsInterest && (
            <>
              {/* Absolute Contraindications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    7. Αντενδείξεις για προπόνηση με EMS – Απόλυτες
                  </CardTitle>
                  <CardDescription>
                    Παρακαλώ δηλώστε αν έχετε κάποια από τις παρακάτω καταστάσεις
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-900">
                      Είναι σημαντικό να δηλώσετε όλες τις παρακάτω καταστάσεις για την ασφάλειά σας κατά την προπόνηση με EMS.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4">
                    {EMS_ABSOLUTE_CONTRAINDICATIONS.map((condition) => (
                      <div key={condition} className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`ems-absolute-${condition}`}
                            checked={data.emsContraindications[condition]?.hasCondition || false}
                            onCheckedChange={(checked) => 
                              handleEmsContraindicationChange(condition, checked === true)
                            }
                          />
                          <Label htmlFor={`ems-absolute-${condition}`} className="text-sm flex-1">
                            {condition}
                          </Label>
                        </div>
                        {data.emsContraindications[condition]?.hasCondition && (
                          <div className="pl-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Έτος έναρξης:</Label>
                              <Input
                                type="text"
                                placeholder="π.χ. 2020"
                                value={data.emsContraindications[condition]?.yearOfOnset || ""}
                                onChange={(e) => 
                                  handleEmsContraindicationDetails(condition, 'yearOfOnset', e.target.value)
                                }
                                className="w-24"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Relative Contraindications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    8. Αντενδείξεις για προπόνηση με EMS – Σχετικές (με ιατρική συμβουλή)
                  </CardTitle>
                  <CardDescription>
                    Παρακαλώ δηλώστε αν έχετε κάποια από τις παρακάτω καταστάσεις
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900">
                      Για αυτές τις καταστάσεις απαιτείται ιατρική συμβουλή πριν την έναρξη προπόνησης με EMS.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4">
                    {EMS_RELATIVE_CONTRAINDICATIONS.map((condition) => (
                      <div key={condition} className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`ems-relative-${condition}`}
                            checked={data.emsContraindications[condition]?.hasCondition || false}
                            onCheckedChange={(checked) => 
                              handleEmsContraindicationChange(condition, checked === true)
                            }
                          />
                          <Label htmlFor={`ems-relative-${condition}`} className="text-sm flex-1">
                            {condition}
                          </Label>
                        </div>
                        {data.emsContraindications[condition]?.hasCondition && (
                          <div className="pl-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Έτος έναρξης:</Label>
                              <Input
                                type="text"
                                placeholder="π.χ. 2020"
                                value={data.emsContraindications[condition]?.yearOfOnset || ""}
                                onChange={(e) => 
                                  handleEmsContraindicationDetails(condition, 'yearOfOnset', e.target.value)
                                }
                                className="w-24"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* EMS Liability Declaration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    ΥΠΕΥΘΥΝΗ ΔΗΛΩΣΗ (άρθρο 8 Ν.1599/1986) - EMS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-3">
                      Με ατομική μου ευθύνη και γνωρίζοντας τις κυρώσεις (που προβλέπονται από τις διατάξεις 
                      της παρ. 6 του άρθρου 22 του Ν.1599/1986), δηλώνω ότι:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        Κατανόησα τις ερωτήσεις που προηγήθηκαν και οι απαντήσεις μου είναι ειλικρινείς και πλήρεις.
                      </li>
                      <li>
                        Αντιλαμβάνομαι ότι πρέπει να ελέγχομαι από το γιατρό μου περιοδικά και να προσκομίσω 
                        την ιατρική βεβαίωση, στην οποία θα δηλώνεται η ικανότητά μου για άσκηση.
                      </li>
                      <li>
                        Κατανοώ ότι ασκούμαι με δική μου ευθύνη και σε περίπτωση που κατά τη διάρκεια της 
                        άσκησης εμφανισθούν συμπτώματα, θα πρέπει αμέσως να διακόψω τη προσπάθεια και να 
                        τα αναφέρω στο γυμναστή και το γιατρό μου.
                      </li>
                      <li>
                        <strong>Ειδικά για την προπόνηση με EMS, δηλώνω ότι γνωρίζω τη φύση της 
                        ηλεκτρομυοδιέγερσης και τις πιθανές αντενδείξεις, και φέρω την ευθύνη για τυχόν 
                        συμπτώματα ή αντιδράσεις που θα παρουσιαστούν κατά τη διάρκεια ή μετά την άσκηση.</strong>
                      </li>
                    </ul>
                    <p className="text-sm mt-4">
                      Τα συμπτώματα αυτά περιλαμβάνουν: ελαφρύ πονοκέφαλο ή ζάλη, βάρος ή πόνο στο 
                      στήθος, αρρυθμίες, αιφνίδια δυσκολία στην αναπνοή, ή πρόβλημα στους μυς και στις 
                      αρθρώσεις, τα οποία επιμένουν για αρκετές ημέρες μετά την άσκηση. Θα ενημερώσω άμεσα 
                      για οποιαδήποτε πιθανή μεταβολή στην κατάσταση της υγείας μου.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="emsLiabilityDeclaration"
                      checked={data.emsLiabilityAccepted || false}
                      onCheckedChange={(checked) => 
                        updateData({ emsLiabilityAccepted: checked === true })
                      }
                    />
                    <Label htmlFor="emsLiabilityDeclaration" className="text-sm font-medium leading-5">
                      <strong>Κατανόησα και αποδέχομαι τους όρους της υπεύθυνης δήλωσης για προπόνηση με EMS.</strong>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Emergency Contact - Kept from original */}
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
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between border-t pt-4">
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