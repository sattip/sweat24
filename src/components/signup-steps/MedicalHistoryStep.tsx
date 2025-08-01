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
import { ScrollArea } from "@/components/ui/scroll-area";

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

export const MedicalHistoryStep: React.FC<MedicalHistoryStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  const [showLiabilityText, setShowLiabilityText] = useState(false);

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

    // Check if liability declaration is accepted
    if (!data.liabilityDeclarationAccepted) {
      toast.error("Παρακαλώ αποδεχτείτε την υπεύθυνη δήλωση για να συνεχίσετε");
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

    onNext();
  };

  const hasAnyMedicalConditions = Object.values(data.medicalConditions).some(condition => condition.hasCondition);

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[70vh] pr-4">
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

          {/* Section 6: Liability Declaration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                ΥΠΕΥΘΥΝΗ ΔΗΛΩΣΗ (άρθρο 8 Ν.1599/1986)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Κάνοντας κλικ παρακάτω μπορείτε να δείτε το πλήρες κείμενο της υπεύθυνης δήλωσης:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLiabilityText(!showLiabilityText)}
                >
                  {showLiabilityText ? "Απόκρυψη" : "Εμφάνιση"} κειμένου υπεύθυνης δήλωσης
                </Button>
              </div>

              {showLiabilityText && (
                <div className="border rounded-lg p-4 bg-muted/20">
                  <ScrollArea className="h-[200px]">
                    <div className="text-sm space-y-3">
                      <p>
                        <strong>ΥΠΕΥΘΥΝΗ ΔΗΛΩΣΗ</strong><br/>
                        (άρθρο 8 παρ. 4 Ν. 1599/1986)
                      </p>
                      <p>
                        Δηλώνω υπεύθυνα ότι όλες οι απαντήσεις που έδωσα στις παραπάνω ερωτήσεις είναι 
                        αληθείς και ακριβείς. Κατανοώ ότι η απόκρυψη πληροφοριών ή η παροχή ψευδών 
                        στοιχείων μπορεί να θέσει σε κίνδυνο την υγεία μου.
                      </p>
                      <p>
                        Κατανοώ ότι η συμμετοχή μου σε προγράμματα άσκησης περιλαμβάνει κινδύνους και 
                        αναλαμβάνω την πλήρη ευθύνη για τυχόν τραυματισμούς ή προβλήματα υγείας που 
                        μπορεί να προκύψουν.
                      </p>
                      <p>
                        Δεσμεύομαι να ενημερώσω άμεσα το προσωπικό του γυμναστηρίου για οποιαδήποτε 
                        αλλαγή στην κατάσταση της υγείας μου ή για οποιαδήποτε συμπτώματα που μπορεί 
                        να εμφανιστούν κατά τη διάρκεια ή μετά την άσκηση.
                      </p>
                      <p>
                        Η παρούσα δήλωση συντάχθηκε για να χρησιμοποιηθεί για την εγγραφή μου στο 
                        γυμναστήριο SWEAT 93 και τα στοιχεία που δηλώνω είναι αληθή.
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="liabilityDeclaration"
                  checked={data.liabilityDeclarationAccepted}
                  onCheckedChange={(checked) => 
                    updateData({ liabilityDeclarationAccepted: checked === true })
                  }
                />
                <Label htmlFor="liabilityDeclaration" className="text-sm font-medium leading-5">
                  <strong>Κατανόησα τις ερωτήσεις που προηγήθηκαν και οι απαντήσεις μου είναι ειλικρινείς και πλήρεις. 
                  Αποδέχομαι τους όρους της υπεύθυνης δήλωσης.</strong>
                </Label>
              </div>

              {hasAnyMedicalConditions && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Έχετε δηλώσει ιατρικές καταστάσεις. Συνιστούμε ανεπιφύλακτα να συμβουλευτείτε 
                    τον γιατρό σας πριν την έναρξη οποιουδήποτε προγράμματος άσκησης.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

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