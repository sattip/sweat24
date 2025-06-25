
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  Dumbbell 
} from "lucide-react";
import RateWorkoutDialog from "@/components/workouts/RateWorkoutDialog";

// Define workout type (same as in WorkoutHistoryPage)
interface Workout {
  id: number;
  name: string;
  date: string;
  time: string;
  instructor: string;
  type: string;
  duration: string;
}

// Mock data for workouts (same as in WorkoutHistoryPage)
const mockWorkoutHistory: Workout[] = [
  {
    id: 101,
    name: "Power Yoga",
    date: "May 22, 2025",
    time: "07:30 - 08:30",
    instructor: "Emma Wilson",
    type: "Yoga",
    duration: "60 minutes",
  },
  {
    id: 102,
    name: "HIIT Blast",
    date: "May 20, 2025",
    time: "12:00 - 12:45",
    instructor: "Mike Johnson",
    type: "HIIT",
    duration: "45 minutes",
  },
  {
    id: 103,
    name: "Spin Class",
    date: "May 18, 2025",
    time: "18:00 - 19:00",
    instructor: "Sarah Davis",
    type: "Cycling",
    duration: "60 minutes",
  },
  {
    id: 104,
    name: "Strength Training",
    date: "May 15, 2025",
    time: "08:00 - 09:00",
    instructor: "Chris Taylor",
    type: "Strength",
    duration: "60 minutes",
  },
  {
    id: 105,
    name: "Personal Training",
    date: "May 10, 2025",
    time: "14:00 - 15:00",
    instructor: "James Miller",
    type: "Personal",
    duration: "60 minutes",
  },
  {
    id: 106,
    name: "Boxing",
    date: "May 5, 2025",
    time: "19:00 - 20:00",
    instructor: "Alex Johnson",
    type: "Combat",
    duration: "60 minutes",
  },
  {
    id: 107,
    name: "Pilates",
    date: "April 28, 2025",
    time: "10:00 - 11:00",
    instructor: "Lisa Chen",
    type: "Pilates",
    duration: "60 minutes",
  },
];

const WorkoutDetailsPage = () => {
  const navigate = useNavigate();
  const { workoutId } = useParams();
  const [ratingDialogOpen, setRatingDialogOpen] = React.useState(false);
  
  // Find workout by ID
  const workout = mockWorkoutHistory.find(w => w.id === Number(workoutId));
  
  // Handle if workout not found
  if (!workout) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-6 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Workout not found</h1>
          <Button onClick={() => navigate("/history")}>
            Return to Workout History
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/history")}
          className="mb-4 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workout History
        </Button>
        
        {/* Workout Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{workout.name}</h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1">
              {workout.type}
            </span>
          </div>
        </div>
        
        {/* Workout Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="text-primary h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-muted-foreground">{workout.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="text-primary h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">{workout.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Dumbbell className="text-primary h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">{workout.duration}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 flex items-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{workout.instructor}</p>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Workout Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Workout Summary</h2>
          <p className="text-muted-foreground">
            You completed this {workout.type.toLowerCase()} workout on {workout.date}. 
            The session lasted {workout.duration} and was instructed by {workout.instructor}.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="flex-1" 
            variant="default"
            onClick={() => setRatingDialogOpen(true)}
          >
            Rate This Workout
          </Button>
          <Button 
            className="flex-1" 
            variant="outline"
            onClick={() => navigate("/schedule")}
          >
            Book Similar Workout
          </Button>
        </div>
      </main>
      
      {/* Rating Dialog */}
      <RateWorkoutDialog 
        open={ratingDialogOpen} 
        onOpenChange={setRatingDialogOpen}
        workout={workout}
      />
    </div>
  );
};

export default WorkoutDetailsPage;
