
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";

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
      const response = await fetch("https://api.sweat93.gr/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Αποτυχία αποστολής email");
      }

      setIsSubmitted(true);
      toast.success("Ελέγξτε το email σας για οδηγίες επαναφοράς κωδικού");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Σφάλμα κατά την αποστολή. Δοκιμάστε ξανά.");
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
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Επαναφορά Κωδικού</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted
                ? "Αν υπάρχει λογαριασμός με αυτό το email, θα λάβετε οδηγίες επαναφοράς."
                : "Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς κωδικού"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Αποστολή..." : "Αποστολή Συνδέσμου"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  Αποστολή ξανά
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <Link to="/" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Επιστροφή στη σύνδεση
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
