
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      toast.error("Παρακαλώ συμπληρώστε όλα τα πεδία");
      return;
    }
    
    // Simulate login success (we'll implement actual authentication later)
    toast.success("Επιτυχής είσοδος!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <Card className="w-full shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Καλώς ήρθατε στο Sweat24</CardTitle>
            <CardDescription className="text-center">Συνδεθείτε για να αποκτήσετε πρόσβαση στο ταξίδι του fitness σας</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
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
                <div className="flex justify-between">
                  <Label htmlFor="password">Κωδικός Πρόσβασης</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Ξεχάσατε τον κωδικό;
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
                    </span>
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Είσοδος
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Δεν έχετε λογαριασμό;{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Εγγραφή
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
