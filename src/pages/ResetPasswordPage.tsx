import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { buildApiUrl } from "@/config/api";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !passwordConfirmation) {
      toast.error("Παρακαλώ συμπληρώστε όλα τα πεδία");
      return;
    }

    if (password.length < 8) {
      toast.error("Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Οι κωδικοί δεν ταιριάζουν");
      return;
    }

    if (!token || !email) {
      toast.error("Μη έγκυρος σύνδεσμος επαναφοράς");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Κάτι πήγε στραβά");
      }

      setIsReset(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Κάτι πήγε στραβά. Δοκιμάστε ξανά."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <Card className="w-full shadow-lg border-t-4 border-t-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Μη έγκυρος σύνδεσμος</CardTitle>
              <CardDescription>
                Ο σύνδεσμος επαναφοράς κωδικού δεν είναι έγκυρος ή έχει λήξει.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link to="/forgot-password">
                <Button variant="outline">Αίτημα νέου συνδέσμου</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <Card className="w-full shadow-lg border-t-4 border-t-primary">
          {isReset ? (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Ο κωδικός άλλαξε!</CardTitle>
                <CardDescription>
                  Ο κωδικός σας ενημερώθηκε επιτυχώς. Μπορείτε τώρα να συνδεθείτε με τον νέο κωδικό σας.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button onClick={() => navigate("/login")} className="w-full">
                  Σύνδεση
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Νέος Κωδικός
                </CardTitle>
                <CardDescription className="text-center">
                  Εισάγετε τον νέο κωδικό πρόσβασης για τον λογαριασμό σας.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Νέος Κωδικός</Label>
                    <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
                      <Lock className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    <Label htmlFor="passwordConfirmation">Επιβεβαίωση Κωδικού</Label>
                    <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
                      <Lock className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
                      <Input
                        id="passwordConfirmation"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="!border-0 !bg-transparent !shadow-none focus:!border-0"
                        style={{ border: 'none', background: 'transparent', boxShadow: 'none', outline: 'none' }}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Αποθήκευση..." : "Αλλαγή Κωδικού"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
