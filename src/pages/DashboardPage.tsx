import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Dumbbell, ShoppingCart, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

// Mock function to check if it's the user's birthday week
const isBirthdayWeek = (dateOfBirth: string): boolean => {
  // For demo purposes, we'll just return true to show the birthday card
  // In a real app, this would compare the current date with the user's birthday
  return true;
};

const DashboardPage = () => {
  // Mock data for the dashboard
  const userData = {
    name: "John",
    activePackage: {
      name: "Premium Membership",
      expiresAt: "2023-12-31",
      remainingDays: 45,
    },
    dateOfBirth: "1990-05-15", // Example date of birth
  };
  
  // Check if it's the user's birthday week
  const birthdayWeek = isBirthdayWeek(userData.dateOfBirth);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Welcome back, {userData.name}!
          </h1>
        </div>
        
        <div className="grid gap-6">
          {/* Birthday Reward Card - Only shown during birthday week */}
          {birthdayWeek && (
            <Card className="border-l-4 border-l-secondary bg-gradient-to-r from-secondary/10 to-background shadow-md animate-fade-in">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">🎉 Happy Birthday Week!</CardTitle>
                  <Gift className="h-8 w-8 text-secondary" />
                </div>
                <CardDescription>We have a special gift just for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="font-medium text-lg">Enjoy a <span className="text-secondary font-bold">FREE</span> personal training session</p>
                  <p className="text-sm text-muted-foreground">
                    Valid until: {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString()}
                  </p>
                  <div className="bg-secondary/10 text-secondary font-medium rounded-full px-4 py-2 inline-block mt-2">
                    Booking Code: <span className="font-bold">BDAYPT2023</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Link to="/services/request/personal-training">
                  <Button>
                    Redeem Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
          
          {/* Active Package Status */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Active Membership</CardTitle>
              <CardDescription>Your current membership status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between md:items-center space-y-3 md:space-y-0">
                <div>
                  <h3 className="font-medium text-lg">{userData.activePackage.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Expires on {new Date(userData.activePackage.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary font-medium rounded-full px-4 py-1 text-center">
                  {userData.activePackage.remainingDays} days remaining
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button variant="outline" size="sm">
                Renew Membership
              </Button>
            </CardFooter>
          </Card>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Book a Class</CardTitle>
                <CardDescription>View schedule and book your next workout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <p className="text-sm">Check out our class schedule and reserve your spot</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/schedule" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2">
                    View Schedule
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Specialized Services</CardTitle>
                <CardDescription>Request personal training and premium services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <Dumbbell className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Book personal training, EMS sessions and more</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/services" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    View Services
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Store</CardTitle>
                <CardDescription>Browse supplements, apparel, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-primary/70" />
                    <p className="text-sm">Shop for supplements, workout apparel, and accessories</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/store" className="w-full">
                  <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                    Visit Store
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
