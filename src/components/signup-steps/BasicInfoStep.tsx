import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, Phone, User, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SignupData } from "../SignupSteps";
import { ageVerificationService } from "@/services/ageVerificationService";

interface BasicInfoStepProps {
  data: SignupData;
  updateData: (updates: Partial<SignupData>) => void;
  onNext: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Production ready - χρησιμοποιεί πραγματικό API για έλεγχο ηλικίας
  const USE_MOCK_AGE_CHECK = false;

  const handleNext = async () => {
    // Validation
    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.confirmPassword) {
      toast.error("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Οι κωδικοί πρόσβασης δεν ταιριάζουν");
      return;
    }

    if (data.password.length < 8) {
      toast.error("Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες");
      return;
    }

    // Check age via backend API for security and legal validity (only if birthdate is provided)
    setLoading(true);
    try {
      if (!data.birthDate) {
        // Skip age verification if no birthdate provided
        updateData({
          isMinor: false,
          serverVerifiedAge: null
        });
        onNext();
        setLoading(false);
        return;
      }

      if (USE_MOCK_AGE_CHECK) {
        // ΠΡΟΣΩΡΙΝΗ ΛΟΓΙΚΗ ΓΙΑ TESTING
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Mock age calculation
        const birthDate = new Date(data.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // Mock response
        const mockResponse = {
          is_minor: age < 18,
          age: age,
          server_date: today.toISOString().split('T')[0]
        };
        
        console.log("🔧 MOCK AGE CHECK:", mockResponse);
        
        updateData({ 
          isMinor: mockResponse.is_minor,
          serverVerifiedAge: mockResponse.age 
        });
      } else {
        // ΚΑΝΟΝΙΚΗ ΛΕΙΤΟΥΡΓΙΑ ΜΕ BACKEND
        const ageVerification = await ageVerificationService.checkAge(data.birthDate);
        
        updateData({ 
          isMinor: ageVerification.is_minor,
          serverVerifiedAge: ageVerification.age 
        });
      }

      onNext();
    } catch (error) {
      console.error('Age verification failed:', error);
      toast.error("Αποτυχία ελέγχου ηλικίας. Παρακαλώ δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Όνομα *</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Το όνομά σας"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Επώνυμο *</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Το επώνυμό σας"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
          <Mail className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            id="email"
            type="email"
            placeholder="το@email.σας"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="!border-0 !bg-transparent !shadow-none focus:!border-0"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', outline: 'none' }}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Τηλέφωνο</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
          <Phone className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            id="phone"
            type="tel"
            placeholder="6901234567"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="!border-0 !bg-transparent !shadow-none focus:!border-0"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', outline: 'none' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Ημερομηνία Γέννησης</Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            onChange={(e) => updateData({ birthDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            min="1920-01-01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Φύλο</Label>
          <Select value={data.gender} onValueChange={(value) => updateData({ gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Επιλέξτε φύλο" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Άνδρας</SelectItem>
              <SelectItem value="female">Γυναίκα</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Κωδικός Πρόσβασης *</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
          <Lock className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => updateData({ password: e.target.value })}
            className="!border-0 !bg-transparent !shadow-none focus:!border-0"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', outline: 'none' }}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mr-1 h-8 w-8 p-0 shrink-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Επιβεβαίωση Κωδικού *</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
          <Lock className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={data.confirmPassword}
            onChange={(e) => updateData({ confirmPassword: e.target.value })}
            className="!border-0 !bg-transparent !shadow-none focus:!border-0"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', outline: 'none' }}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mr-1 h-8 w-8 p-0 shrink-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>


      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Έλεγχος ηλικίας...
            </>
          ) : (
            'Συνέχεια'
          )}
        </Button>
      </div>
    </div>
  );
}; 