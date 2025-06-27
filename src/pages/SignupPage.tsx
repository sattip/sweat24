
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

const SignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [referralName, setReferralName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Παρακαλώ συμπληρώστε όλα τα πεδία");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Οι κωδικοί πρόσβασης δεν ταιριάζουν");
      return;
    }
    
    if (!acceptTerms) {
      toast.error("Παρακαλώ αποδεχτείτε τους όρους χρήσης");
      return;
    }
    
    try {
      await register({
        name: `${firstName} ${lastName}`,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      
      navigate("/dashboard");
    } catch (error) {
      // Error handling is done in the register function
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <Card className="w-full shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Εγγραφή στο Sweat24</CardTitle>
            <CardDescription className="text-center">Δημιουργήστε τον λογαριασμό σας για να ξεκινήσετε</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Όνομα</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Το όνομά σας"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Επώνυμο</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Το επώνυμό σας"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="το@email.σας"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Κωδικός Πρόσβασης</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Επιβεβαίωση Κωδικού</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referralSource">Πώς μάθατε για εμάς;</Label>
                <Select value={referralSource} onValueChange={setReferralSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε μία επιλογή" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friend">Από φίλο/γνωστό</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="search">Google</SelectItem>
                    <SelectItem value="ad">Διαφήμιση</SelectItem>
                    <SelectItem value="other">Άλλο</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {referralSource === "friend" && (
                <div className="space-y-2">
                  <Label htmlFor="referralName">Όνομα φίλου (προαιρετικό)</Label>
                  <Input
                    id="referralName"
                    type="text"
                    placeholder="Όνομα του φίλου που σας παρέπεμψε"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm">
                  Αποδέχομαι τους{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    όρους χρήσης
                  </Link>{" "}
                  και την{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    πολιτική απορρήτου
                  </Link>
                </Label>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Εγγραφή...
                  </>
                ) : (
                  "Εγγραφή"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
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
