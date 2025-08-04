
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { SignupSteps, SignupData } from "@/components/SignupSteps";
import { authService } from "@/services/authService";

const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupComplete = async (data: SignupData) => {
    setLoading(true);
    
    try {
      // Transform medical history data to API format
      const transformedConditions: { [key: string]: { has_condition: boolean; year_of_onset?: string | null; details?: string | null } } = {};
      if (data.medicalConditions) {
        Object.entries(data.medicalConditions).forEach(([condition, conditionData]) => {
          transformedConditions[condition] = {
            has_condition: conditionData.hasCondition,
            year_of_onset: conditionData.yearOfOnset || null,
            details: conditionData.details || null
          };
        });
      }

      const medicalHistoryData = {
        medical_conditions: transformedConditions,
        current_health_problems: {
          has_problems: data.currentHealthProblems?.hasProblems || false,
          details: data.currentHealthProblems?.details || ''
        },
        prescribed_medications: data.prescribedMedications || [],
        smoking: {
          currently_smoking: data.smoking?.currentlySmoking || false,
          daily_cigarettes: data.smoking?.dailyCigarettes || null,
          ever_smoked: data.smoking?.everSmoked || false,
          smoking_years: data.smoking?.smokingYears || null,
          quit_years_ago: data.smoking?.quitYearsAgo || null
        },
        physical_activity: data.physicalActivity || { description: '', frequency: '', duration: '' },
        emergency_contact: {
          name: data.emergencyContactName || '',
          phone: data.emergencyContactPhone || ''
        },
        liability_declaration_accepted: data.liabilityDeclarationAccepted || false,
        submitted_at: new Date().toISOString()
      };

      // Map SignupData to RegisterData format with medical history
      const registerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        signature: "placeholder", // We'll set this after completion
        signedAt: new Date().toISOString(),
        documentType: 'terms_and_conditions',
        documentVersion: '1.0',
        medicalHistory: medicalHistoryData
      };

      // Register user with basic data and medical history together
      await authService.register(registerData);
      
      toast.success("Επιτυχής εγγραφή! Το ιατρικό ιστορικό σας αποθηκεύτηκε.");
      
      // Redirect to success page
      navigate("/signup-success");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Σφάλμα κατά την εγγραφή");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold mb-2">Εγγραφή στο Sweat93</h1>
          <p className="text-muted-foreground">
            Δημιουργήστε τον λογαριασμό σας και ξεκινήστε το ταξίδι του fitness
          </p>
        </div>

        <SignupSteps 
          onComplete={handleSignupComplete}
          loading={loading}
        />
        
        <Card className="mt-8">
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Έχετε ήδη λογαριασμό;{" "}
              <Link to="/" className="text-primary font-medium hover:underline">
                Σύνδεση
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
