
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { SignupSteps, SignupData } from "@/components/SignupSteps";
import { authService } from "@/services/authService";
import medicalHistoryService from "@/services/medicalHistoryService";

const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupComplete = async (data: SignupData) => {
    setLoading(true);
    
    try {
      // Map SignupData to RegisterData format
      const registerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        signature: "placeholder", // We'll set this after completion
        signedAt: new Date().toISOString(),
        documentType: 'terms_and_conditions',
        documentVersion: '1.0'
      };

      // Register user with basic data first
      await authService.register(registerData);
      
      toast.success("Επιτυχής εγγραφή!");
      
      // Υποβολή ιατρικού ιστορικού στο backend
      try {
        const medicalHistoryResponse = await medicalHistoryService.submitMedicalHistory(data);
        
        if (medicalHistoryResponse.success) {
          toast.success("Το ιατρικό ιστορικό σας αποθηκεύτηκε επιτυχώς!");
          console.log("Medical history saved:", medicalHistoryResponse.data);
        }
      } catch (medicalError) {
        console.error("Error saving medical history:", medicalError);
        // Δεν εμφανίζουμε error toast εδώ γιατί η εγγραφή έχει ήδη γίνει επιτυχώς
        // Απλά καταγράφουμε το σφάλμα στο console
      }
      
      // Redirect to success page instead of dashboard
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
