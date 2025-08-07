import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Heart, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { BasicInfoStep } from "./signup-steps/BasicInfoStep";
import { HowFoundUsStep } from "./signup-steps/HowFoundUsStep";
import { MedicalHistoryStep } from "./signup-steps/MedicalHistoryStep";
import { ReviewStep } from "./signup-steps/ReviewStep";
import { ParentConsentStep } from "./signup-steps/ParentConsentStep";

export interface SignupData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: string;
  
  // Medical History - Basic (Legacy)
  hasConditions: boolean;
  conditions: string[];
  otherCondition: string;
  medications: string;
  injuries: string;
  doctorClearance: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Extended Medical History - New Detailed Fields
  
  // Section 1: Medical Conditions with Year of Onset
  medicalConditions: {
    [key: string]: {
      hasCondition: boolean;
      yearOfOnset?: string;
      details?: string;
    };
  };

  // Section 2: Current Health Problems
  currentHealthProblems: {
    hasProblems: boolean;
    details?: string;
  };

  // Section 3: Prescribed Medications (3+ pairs)
  prescribedMedications: Array<{
    medication: string;
    reason: string;
  }>;

  // Section 4: Smoking Details
  smoking: {
    currentlySmoking: boolean; // true = Ναι, false = Όχι
    dailyCigarettes?: string; // if currentlySmoking = true
    everSmoked?: boolean; // if currentlySmoking = false
    smokingYears?: string; // if everSmoked = true
    quitYearsAgo?: string; // if everSmoked = true
  };

  // Section 5: Physical Activity
  physicalActivity: {
    description: string;
    frequency: string;
    duration: string;
  };

  // Section 6: Additional Medical Information
  familyHistory: string;
  allergies: string;
  surgeries: string;
  recentIllness: string;

  // Section 7: EMS Interest
  emsInterest: boolean;
  
  // Section 8: EMS Contraindications (only if emsInterest is true)
  emsContraindications: {
    [key: string]: {
      hasCondition: boolean;
      yearOfOnset?: string;
    };
  };
  
  // Section 8.1: EMS Liability Declaration (only if emsInterest is true)
  emsLiabilityAccepted?: boolean;



  // How found us data
  howFoundUs?: string;
  referralCodeOrName?: string;
  referralValidated?: boolean;
  referrerId?: number;
  socialPlatform?: string;

  // Minor status and parent consent data
  isMinor?: boolean;
  serverVerifiedAge?: number;
  parentConsent?: {
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
  };
}

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface SignupStepsProps {
  onComplete: (data: SignupData) => void;
  loading?: boolean;
}

export const SignupSteps: React.FC<SignupStepsProps> = ({ onComplete, loading = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: "",
    hasConditions: false,
    conditions: [],
    otherCondition: "",
    medications: "",
    injuries: "",
    doctorClearance: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalConditions: {},
    currentHealthProblems: { hasProblems: false },
    prescribedMedications: [
      { medication: "", reason: "" },
      { medication: "", reason: "" },
      { medication: "", reason: "" }
    ],
    smoking: { currentlySmoking: false },
    physicalActivity: { description: "", frequency: "", duration: "" },
    familyHistory: "",
    allergies: "",
    surgeries: "",
    recentIllness: "",
    emsInterest: false,
    emsContraindications: {},

    isMinor: false,
  });

  // Dynamic steps based on whether user is minor
  const getSteps = (): Step[] => {
    const baseSteps: Step[] = [
      {
        id: 1,
        title: "Βασικά Στοιχεία",
        icon: <User className="h-4 w-4" />,
        completed: currentStep > 1,
      },
      {
        id: 2,
        title: "Πώς μας βρήκατε",
        icon: <Search className="h-4 w-4" />,
        completed: currentStep > 2,
      },
    ];

    let nextStepId = 3;

    // Add parent consent step for minors
    if (signupData.isMinor) {
      baseSteps.push({
        id: nextStepId,
        title: "Συγκατάθεση Γονέα",
        icon: <User className="h-4 w-4" />,
        completed: currentStep > nextStepId,
      });
      nextStepId++;
    }

    // Medical history
    baseSteps.push({
      id: nextStepId,
      title: "Ιατρικό Ιστορικό",
      icon: <Heart className="h-4 w-4" />,
      completed: currentStep > nextStepId,
    });
    nextStepId++;

    // Review
    baseSteps.push({
      id: nextStepId,
      title: "Επισκόπηση",
      icon: <FileText className="h-4 w-4" />,
      completed: false,
    });

    return baseSteps;
  };

  const steps = getSteps();

  const updateSignupData = (updates: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    const maxSteps = signupData.isMinor ? 4 : 3;
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleParentConsentComplete = (parentData: any) => {
    updateSignupData({ 
      parentConsent: parentData 
    });
    nextStep();
  };

  const handleComplete = () => {
    onComplete(signupData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  step.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : step.id === currentStep
                    ? "border-primary text-primary"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                {step.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "ml-6 h-px w-16 transition-colors",
                    step.completed ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <BasicInfoStep
              data={signupData}
              updateData={updateSignupData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <HowFoundUsStep
              data={signupData}
              updateData={updateSignupData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 3 && signupData.isMinor && (
            <ParentConsentStep
              childFirstName={signupData.firstName}
              childLastName={signupData.lastName}
              onComplete={handleParentConsentComplete}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && !signupData.isMinor && (
            <MedicalHistoryStep
              data={signupData}
              updateData={updateSignupData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 4 && signupData.isMinor && (
            <MedicalHistoryStep
              data={signupData}
              updateData={updateSignupData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 4 && !signupData.isMinor && (
            <ReviewStep
              data={signupData}
              onComplete={handleComplete}
              onPrev={prevStep}
              loading={loading}
            />
          )}
          {currentStep === 5 && signupData.isMinor && (
            <ReviewStep
              data={signupData}
              onComplete={handleComplete}
              onPrev={prevStep}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 