
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const OrderConfirmationPage = () => {
  const orderNumber = `SW24-${Math.floor(100000 + Math.random() * 900000)}`;
  
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
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Thank you for your order. We have received your request and are processing it now.
            </p>
            <div className="bg-muted p-4 rounded-md mb-4">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="font-medium">{orderNumber}</p>
            </div>
            <p className="text-muted-foreground text-sm">
              We will notify you when your order is ready for pickup at the gym.
              You can view your order status in the "My Orders" section.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link to="/dashboard" className="w-full">
              <Button variant="default" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
            <Link to="/store" className="w-full">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default OrderConfirmationPage;
