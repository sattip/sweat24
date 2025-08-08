
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import * as API from "@/config/api";

// Service type for specialized services
type SpecializedService = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
};

const SpecializedServicesPage = () => {
  const [services, setServices] = useState<SpecializedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await API.apiRequest('/specialized-services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setServices(data);
        } else if (data.data && Array.isArray(data.data)) {
          // Handle paginated response
          setServices(data.data);
        } else {
          console.error('Unexpected response format:', data);
          setServices([]);
        }
      } catch (error) {
        console.error('Error fetching specialized services:', error);
        setServices([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const renderIcon = (icon: string) => {
    // If it's an emoji, render it directly
    if (icon && icon.length <= 4) {
      return <span className="text-4xl">{icon}</span>;
    }
    // Otherwise render a default icon
    return <Dumbbell className="h-10 w-10 text-primary" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Personal & EMS</h1>
          <p className="text-muted-foreground mt-2">
            Επιλέξτε μια υπηρεσία για να ζητήσετε εξατομικευμένο ραντεβού
          </p>
        </div>
        
        <div className="grid gap-6">
          {services.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-muted-foreground">
                  Δεν υπάρχουν διαθέσιμες υπηρεσίες αυτή τη στιγμή
                </CardTitle>
              </CardHeader>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="hover:border-primary transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {renderIcon(service.icon)}
                    </div>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 border-t">
                  <Link to={`/services/request/${service.slug}`} className="w-full">
                    <Button variant="outline" className="w-full flex justify-between items-center">
                      Κλείσιμο Ραντεβού
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default SpecializedServicesPage;
