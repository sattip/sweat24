
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
import { User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";

const SignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [referralName, setReferralName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!firstName || !lastName || !email || !password || !confirmPassword || !referralSource) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!agreedToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }
    
    // Simulate signup success (we'll implement actual registration later)
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  // Show referral name field only if selected source is "Referred by friend"
  const showReferralNameField = referralSource === "friend";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <Card className="w-full shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">Join FitSync Pro to start your fitness journey</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                <Label htmlFor="referralSource">How did you hear about us?</Label>
                <Select value={referralSource} onValueChange={setReferralSource} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friend">Referred by friend</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="search">Search Engine</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {showReferralNameField && (
                <div className="space-y-2">
                  <Label htmlFor="referralName">Friend's Name</Label>
                  <Input
                    id="referralName"
                    placeholder="Jane Smith"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms} 
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary underline hover:text-primary/80">
                    terms & conditions
                  </Link>
                </label>
              </div>
              
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
