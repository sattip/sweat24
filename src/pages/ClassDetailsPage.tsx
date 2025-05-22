
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, BarChart } from "lucide-react";

// Mock data for class details
const mockClasses = [
  {
    id: 1,
    name: "Power Yoga",
    day: "Monday",
    date: "May 24, 2025",
    time: "07:30 - 08:30",
    instructor: "Emma Wilson",
    instructorImage: "/placeholder.svg",
    duration: "60 minutes",
    description: "Power Yoga is a dynamic, flowing style that synchronizes movement with breath. This energizing class builds strength, flexibility, and endurance while reducing stress and improving focus. Suitable for beginners and advanced practitioners alike.",
    location: "Studio 2",
    difficulty: "Intermediate",
    spotsAvailable: 8,
    totalSpots: 20,
    type: "Yoga"
  },
  {
    id: 2,
    name: "HIIT Blast",
    day: "Monday",
    date: "May 24, 2025",
    time: "12:00 - 12:45",
    instructor: "Mike Johnson",
    instructorImage: "/placeholder.svg",
    duration: "45 minutes",
    description: "High-Intensity Interval Training that alternates between intense bursts of activity and fixed periods of less-intense activity or rest. This workout will push your limits and help maximize calorie burn while improving cardiovascular fitness.",
    location: "Main Floor",
    difficulty: "Advanced",
    spotsAvailable: 3,
    totalSpots: 15,
    type: "HIIT"
  },
  {
    id: 3,
    name: "Spin Class",
    day: "Monday",
    date: "May 24, 2025",
    time: "18:00 - 19:00",
    instructor: "Sarah Davis",
    instructorImage: "/placeholder.svg",
    duration: "60 minutes",
    description: "An indoor cycling workout that simulates terrain and situations similar to riding a bike outdoors. Adjust resistance and speed to flat roads, hills, and interval training for a challenging cardio workout.",
    location: "Cycle Studio",
    difficulty: "All Levels",
    spotsAvailable: 0,
    totalSpots: 12,
    type: "Cycling"
  },
  {
    id: 4,
    name: "Strength Training",
    day: "Tuesday",
    date: "May 25, 2025",
    time: "08:00 - 09:00",
    instructor: "Chris Taylor",
    instructorImage: "/placeholder.svg",
    duration: "60 minutes",
    description: "Build muscle and improve strength with this comprehensive workout using free weights, resistance bands, and bodyweight exercises. This class focuses on proper form and technique to maximize results and prevent injury.",
    location: "Weight Room",
    difficulty: "Intermediate",
    spotsAvailable: 6,
    totalSpots: 15,
    type: "Strength"
  }
];

const ClassDetailsPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const classDetails = mockClasses.find(c => c.id === Number(classId));
  
  if (!classDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-6 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Class not found</h1>
          <Button onClick={() => navigate("/schedule")}>
            Return to Schedule
          </Button>
        </div>
      </div>
    );
  }
  
  const isFull = classDetails.spotsAvailable === 0;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/schedule")}
          className="mb-4"
        >
          &larr; Back to Schedule
        </Button>
        
        {/* Class Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{classDetails.name}</h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1">
              {classDetails.type}
            </span>
            <span className="bg-muted rounded-full px-3 py-1">
              {classDetails.difficulty}
            </span>
          </div>
        </div>
        
        {/* Class Details Card */}
        <Card className="mb-6">
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="text-primary h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">{classDetails.day}</p>
                  <p className="text-sm text-muted-foreground">{classDetails.date}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="text-primary h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">{classDetails.time}</p>
                  <p className="text-sm text-muted-foreground">{classDetails.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="text-primary h-5 w-5 mr-3" />
                <p className="font-medium">{classDetails.location}</p>
              </div>
              
              <div className="flex items-center">
                <BarChart className="text-primary h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Availability</p>
                  <p className="text-sm text-muted-foreground">
                    {isFull 
                      ? "Class is full" 
                      : `${classDetails.spotsAvailable} of ${classDetails.totalSpots} spots available`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Instructor Info */}
            <div className="bg-muted/50 rounded-lg p-4 flex items-center">
              <div className="w-16 h-16 rounded-full bg-muted overflow-hidden mr-4">
                <img 
                  src={classDetails.instructorImage} 
                  alt={classDetails.instructor} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{classDetails.instructor}</p>
                <p className="text-sm text-muted-foreground">Class Instructor</p>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Class Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">About this class</h2>
          <p className="text-muted-foreground">{classDetails.description}</p>
        </div>
        
        {/* Action Button */}
        <div className="mt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <Button 
            className="w-full" 
            size="lg"
            variant={isFull ? "outline" : "default"}
          >
            {isFull ? "Join Waitlist" : "Book Class"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ClassDetailsPage;
