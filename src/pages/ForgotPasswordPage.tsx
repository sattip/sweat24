import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { buildApiUrl } from "@/config/api";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Παρακαλώ εισάγετε το email σας");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Κάτι πήγε στραβά");
      }

      setIsSubmitted(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Κάτι πήγε στραβά. Δοκιμάστε ξανά."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <Card className="w-full shadow-lg border-t-4 border-t-primary">
          {isSubmitted ? (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Ελέγξτε το email σας</CardTitle>
                <CardDescription>
                  Αν υπάρχει λογαριασμός με το email <strong>{email}</strong>, θα λάβετε ένα email με οδηγίες για την επαναφορά του κωδικού σας.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col space-y-4">
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Επιστροφή στη Σύνδεση
                  </Button>
                </Link>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Ξεχάσατε τον κωδικό;
                </CardTitle>
                <CardDescription className="text-center">
                  Εισάγετε το email σας και θα σας στείλουμε οδηγίες για την επαναφορά του κωδικού σας.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
                      <Mail className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="το@email.σας"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="!border-0 !bg-transparent !shadow-none focus:!border-0"
                        style={{ border: 'none', background: 'transparent', boxShadow: 'none', outline: 'none' }}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Αποστολή..." : "Αποστολή Email"}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Link to="/login" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Επιστροφή στη Σύνδεση
                </Link>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
