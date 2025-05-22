
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const DashboardPage = () => {
  // Mock data for the dashboard
  const userData = {
    name: "John",
    activePackage: {
      name: "Premium Membership",
      expiresAt: "2023-12-31",
      remainingDays: 45,
    },
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            Welcome back, {userData.name}!
          </h1>
        </div>
        
        <div className="grid gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                <Button className="w-full" variant="default">
                  View Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">My Profile</CardTitle>
                <CardDescription>View and update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                  <div className="text-center p-4">
                    <p className="text-sm">Update your details, track progress, and manage preferences</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button className="w-full" variant="outline">
                  View Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
