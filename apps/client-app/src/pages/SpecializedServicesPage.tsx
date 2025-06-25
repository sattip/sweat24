
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

// Service type for specialized services
type SpecializedService = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
};

const SpecializedServicesPage = () => {
  // Mock data for specialized services
  const services: SpecializedService[] = [
    {
      id: "personal-training",
      name: "Personal Training",
      description: "One-on-one training sessions with a certified personal trainer tailored to your specific fitness goals.",
      icon: <User className="h-10 w-10 text-primary" />
    },
    {
      id: "ems-training",
      name: "EMS Training",
      description: "Electrical Muscle Stimulation training that activates more muscle fibers in less time.",
      icon: <Dumbbell className="h-10 w-10 text-primary" />
    },
    {
      id: "pilates-reformer",
      name: "Pilates Reformer",
      description: "Specialized Pilates sessions using the reformer machine for improved core strength and flexibility.",
      icon: <Dumbbell className="h-10 w-10 text-primary" />
    },
    {
      id: "cardio-personal",
      name: "Cardio Personal",
      description: "Focused cardio training sessions designed to improve your cardiovascular health and endurance.",
      icon: <Dumbbell className="h-10 w-10 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Specialized Services</h1>
          <p className="text-muted-foreground mt-2">
            Select a service to request a personalized appointment
          </p>
        </div>
        
        <div className="grid gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {service.icon}
                  </div>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2 border-t">
                <Link to={`/services/request/${service.id}`} className="w-full">
                  <Button variant="outline" className="w-full flex justify-between items-center">
                    Request Appointment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SpecializedServicesPage;
