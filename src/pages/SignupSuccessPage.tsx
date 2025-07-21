import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Mail, User, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Logo from "@/components/Logo";

const SignupSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Επιτυχής Εγγραφή!
            </CardTitle>
            <CardDescription className="text-lg">
              Καλώς ήρθατε στο Sweat24
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Pending Status Alert */}
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                <strong>Ο λογαριασμός σας βρίσκεται σε αναμονή έγκρισης.</strong>
                <br />
                Θα λάβετε email επιβεβαίωσης μόλις εγκριθεί από τη γραμματεία του γυμναστηρίου.
              </AlertDescription>
            </Alert>

            {/* What Happens Next */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Τι θα συμβεί στη συνέχεια:
              </h3>
              
              <div className="space-y-3 ml-7">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Έλεγχος Στοιχείων</p>
                    <p className="text-sm text-muted-foreground">
                      Η γραμματεία θα ελέγξει τα στοιχεία σας και το ιατρικό ιστορικό
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Email Επιβεβαίωσης</p>
                    <p className="text-sm text-muted-foreground">
                      Θα λάβετε email με οδηγίες ενεργοποίησης του λογαριασμού σας
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Αποδοχή Όρων</p>
                    <p className="text-sm text-muted-foreground">
                      Κατά την πρώτη σύνδεση, θα πρέπει να αποδεχτείτε τους όρους χρήσης
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Επιλογή Πακέτου</p>
                    <p className="text-sm text-muted-foreground">
                      Θα μπορείτε να επιλέξετε το κατάλληλο πακέτο συνδρομής
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Έχετε απορίες;</strong>
                <br />
                Επικοινωνήστε μαζί μας στο{" "}
                <a href="mailto:info@sweat24.gr" className="text-primary hover:underline">
                  info@sweat24.gr
                </a>{" "}
                ή καλέστε στο{" "}
                <a href="tel:+302101234567" className="text-primary hover:underline">
                  210 123 4567
                </a>
              </AlertDescription>
            </Alert>

            {/* Time Estimate */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                <strong>Εκτιμώμενος χρόνος έγκρισης:</strong>
                <br />
                1-2 εργάσιμες ημέρες
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link to="/">
                Επιστροφή στην Αρχική
              </Link>
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Θα ενημερωθείτε με email μόλις ενεργοποιηθεί ο λογαριασμός σας
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignupSuccessPage; 