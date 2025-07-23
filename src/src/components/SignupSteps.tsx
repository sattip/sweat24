import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Heart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { BasicInfoStep } from "./signup-steps/BasicInfoStep";
import { MedicalHistoryStep } from "./signup-steps/MedicalHistoryStep";
import { ReviewStep } from "./signup-steps/ReviewStep";

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
  
  // Medical History
  hasConditions: boolean;
  conditions: string[];
  otherCondition: string;
  medications: string;
  injuries: string;
  doctorClearance: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
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
  });

  const steps: Step[] = [
    {
      id: 1,
      title: "Βασικά Στοιχεία",
      icon: <User className="h-4 w-4" />,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: "Ιατρικό Ιστορικό",
      icon: <Heart className="h-4 w-4" />,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: "Επισκόπηση",
      icon: <FileText className="h-4 w-4" />,
      completed: false,
    },
  ];

  const updateSignupData = (updates: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
            <MedicalHistoryStep
              data={signupData}
              updateData={updateSignupData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 3 && (
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