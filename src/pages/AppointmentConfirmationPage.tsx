
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
            <CardTitle className="text-2xl">Request Submitted!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your appointment request has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We will contact you shortly to confirm your appointment details.
              You will receive a notification once your appointment is confirmed.
            </p>
            <p className="text-muted-foreground text-sm">
              Please note that your booking will appear in "My Bookings" after confirmation.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link to="/dashboard" className="w-full">
              <Button variant="default" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
            <Link to="/bookings" className="w-full">
              <Button variant="outline" className="w-full">
                View My Bookings
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AppointmentConfirmationPage;
