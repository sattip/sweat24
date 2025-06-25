
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const AppointmentConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center my-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Η Αίτηση Υποβλήθηκε!</CardTitle>
            <CardDescription className="text-base mt-2">
              Η αίτησή σας για ραντεβού υποβλήθηκε με επιτυχία.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Θα επικοινωνήσουμε μαζί σας σύντομα για να επιβεβαιώσουμε τις λεπτομέρειες του ραντεβού σας.
              Θα λάβετε ειδοποίηση μόλις επιβεβαιωθεί το ραντεβού σας.
            </p>
            <p className="text-muted-foreground text-sm">
              Παρακαλούμε σημειώστε ότι η κράτησή σας θα εμφανιστεί στις "Κρατήσεις μου" μετά την επιβεβαίωση.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link to="/dashboard" className="w-full">
              <Button variant="default" className="w-full">
                Επιστροφή στην Αρχική
              </Button>
            </Link>
            <Link to="/bookings" className="w-full">
              <Button variant="outline" className="w-full">
                Προβολή Κρατήσεων
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AppointmentConfirmationPage;
