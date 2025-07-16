
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/config/api";

// Mock trainer data
const trainers = [
  { id: "1", name: "John Smith", specialty: "Strength & Conditioning" },
  { id: "2", name: "Sarah Johnson", specialty: "Pilates & Flexibility" },
  { id: "3", name: "Mike Thompson", specialty: "EMS & Cardio" },
];

// Service data mapping
const serviceInfo = {
  "personal-training": {
    name: "Personal Training",
    description: "One-on-one training sessions with a certified personal trainer."
  },
  "ems-training": {
    name: "EMS Training",
    description: "Electrical Muscle Stimulation training for efficient workouts."
  },
  "pilates-reformer": {
    name: "Pilates Reformer",
    description: "Specialized Pilates sessions using the reformer machine."
  },
  "cardio-personal": {
    name: "Cardio Personal",
    description: "Focused cardio training sessions for improved endurance."
  }
};

type TimeSlot = {
  date: Date | undefined;
  time: string;
};

const AppointmentRequestPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  
  const service = serviceId && serviceInfo[serviceId as keyof typeof serviceInfo] 
    ? serviceInfo[serviceId as keyof typeof serviceInfo]
    : { name: "Service", description: "Service description" };

  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { date: undefined, time: "" },
    { date: undefined, time: "" },
    { date: undefined, time: "" }
  ]);
  const [notes, setNotes] = useState<string>("");

  // Update a specific time slot
  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setTimeSlots(updatedSlots);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one time slot is selected
    const hasTimeSlot = timeSlots.some(slot => slot.date && slot.time);
    
    if (!hasTimeSlot) {
      toast({
        title: "Please select at least one preferred time slot",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Get service ID from backend by slug
      const servicesResponse = await apiRequest('/specialized-services');
      const services = await servicesResponse.json();
      const matchedService = services.find(s => s.slug === serviceId);
      
      if (!matchedService) {
        toast({
          title: "Service not found",
          variant: "destructive"
        });
        return;
      }

      // Prepare appointment request data
      const appointmentData = {
        specialized_service_id: matchedService.id,
        instructor_id: selectedTrainer || null,
        preferred_time_slots: timeSlots.filter(slot => slot.date && slot.time).map(slot => ({
          date: slot.date?.toISOString().split('T')[0],
          time: slot.time
        })),
        notes: notes
      };

      const response = await apiRequest('/appointment-requests', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        toast({
          title: "Appointment request submitted successfully!",
          description: "We will contact you soon to confirm your appointment."
        });
        navigate("/services/confirmation");
      } else {
        throw new Error('Failed to submit appointment request');
      }
    } catch (error) {
      console.error('Error submitting appointment request:', error);
      toast({
        title: "Error submitting request",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Request Appointment</h1>
          <p className="text-muted-foreground mt-2">{service.name} - {service.description}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trainer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Preferred Trainer (Optional)
              </CardTitle>
              <CardDescription>
                Choose a trainer or leave unselected for any available trainer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {trainers.map((trainer) => (
                  <div 
                    key={trainer.id} 
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-colors",
                      selectedTrainer === trainer.id ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                    )}
                    onClick={() => setSelectedTrainer(trainer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{trainer.name}</h3>
                        <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Time Slot Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Preferred Time Slots
              </CardTitle>
              <CardDescription>
                Please select up to 3 preferred time slots for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Date (Option {index + 1})</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !slot.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {slot.date ? format(slot.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={slot.date}
                            onSelect={(date) => updateTimeSlot(index, "date", date)}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Preferred Time</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={slot.time}
                          onChange={(e) => updateTimeSlot(index, "time", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Any specific requests or information for your trainer (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="E.g., I'm focusing on weight loss, I have a lower back injury, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
          
          {/* Submit Button */}
          <Button type="submit" className="w-full">Submit Request</Button>
        </form>
      </main>
    </div>
  );
};

export default AppointmentRequestPage;
