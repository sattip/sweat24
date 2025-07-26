import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { 
  Calendar, 
  Clock, 
  User, 
  Calendar as CalendarIcon, 
  Dumbbell,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RateWorkoutDialog from "@/components/workouts/RateWorkoutDialog";
import { bookingService } from "@/services/apiService";
import { toast } from "sonner";

// Define types for workout data
interface Workout {
  id: number;
  class_name: string;
  date: string;
  time: string;
  instructor: string;
  type: string;
  attended: boolean | number;
}


// Define the type for grouped workouts
interface GroupedWorkouts {
  [monthYear: string]: Workout[];
}

// Group workouts by month  
const groupWorkoutsByMonth = (workouts: Workout[]): GroupedWorkouts => {
  const grouped: GroupedWorkouts = {};
  
  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const monthYear = date.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' });
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(workout);
  });
  
  return grouped;
};

const WorkoutHistoryPage = () => {
  const [filter, setFilter] = useState("all");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      setLoading(true);
      console.log('Fetching workout history...');
      const data = await bookingService.getUserPastBookings();
      console.log('Received data:', data);
      const workoutsArray = Array.isArray(data) ? data : [];
      console.log('Data length:', workoutsArray.length);
      setWorkouts(workoutsArray);
    } catch (error) {
      console.error('Error fetching workout history:', error);
      toast.error('Σφάλμα κατά τη φόρτωση του ιστορικού προπονήσεων');
    } finally {
      setLoading(false);
    }
  };
  
  const hasWorkouts = workouts.length > 0;
  
  const filteredWorkouts = workouts.filter(workout => {
    if (filter === "all") return true;
    if (filter === "yoga") return workout.type.toLowerCase().includes("yoga");
    if (filter === "hiit") return workout.type.toLowerCase().includes("hiit");
    if (filter === "strength") return workout.type.toLowerCase().includes("strength");
    return true;
  });
  
  const groupedWorkouts = groupWorkoutsByMonth(filteredWorkouts);
  const totalWorkouts = filteredWorkouts.length;
  const totalMinutes = filteredWorkouts.length * 60; // Assume 60 minutes per workout
  
  const handleOpenRatingDialog = (workout: Workout) => {
    setSelectedWorkout(workout);
    setRatingDialogOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Workout History</h1>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workouts</SelectItem>
              <SelectItem value="yoga">Yoga</SelectItem>
              <SelectItem value="hiit">HIIT</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="empty">Show Empty State</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-lg">Φόρτωση ιστορικού προπονήσεων...</div>
          </div>
        ) : hasWorkouts ? (
          <>
            {/* Stats Summary */}
            <Card className="mb-6">
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
                    <Dumbbell className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">{totalWorkouts}</p>
                    <p className="text-sm text-muted-foreground">Total Workouts</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">{totalMinutes}</p>
                    <p className="text-sm text-muted-foreground">Total Minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Workout List */}
            <div className="space-y-6">
              {Object.entries(groupedWorkouts).map(([monthYear, workouts]) => (
                <div key={monthYear}>
                  <h2 className="text-lg font-semibold mb-3 text-muted-foreground">{monthYear}</h2>
                  <div className="space-y-3">
                    {workouts.map((workout) => (
                      <Card key={workout.id} className="transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="bg-muted text-xs font-medium rounded-full px-2 py-1 mr-2">
                                  {workout.type}
                                </span>
                                <h3 className="font-medium text-base">{workout.class_name}</h3>
                                {(workout.attended === true || workout.attended === 1) ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600 ml-2" />
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-y-1">
                                <div className="flex items-center mr-4">
                                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                                  {new Date(workout.date).toLocaleDateString('el-GR')}
                                </div>
                                <div className="flex items-center mr-4">
                                  <Clock className="h-4 w-4 mr-1 text-primary" />
                                  {workout.time}
                                </div>
                                <div className="flex items-center mr-4">
                                  <User className="h-4 w-4 mr-1 text-primary" />
                                  {workout.instructor}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                (workout.attended === true || workout.attended === 1) ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(workout.attended === true || workout.attended === 1) ? 'Παρουσία' : 'Απουσία'}
                              </span>
                              {(workout.attended === true || workout.attended === 1) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleOpenRatingDialog(workout)}
                                >
                                  Αξιολόγηση
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/40 rounded-full p-6 mb-4">
              <Dumbbell className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Δεν υπάρχει ιστορικό προπονήσεων</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Το ιστορικό προπονήσεών σου είναι άδειο. Ώρα να ξεκινήσεις!
            </p>
            <Link to="/classes">
              <Button>Κλείσε ένα Μάθημα</Button>
            </Link>
          </div>
        )}
      </main>
      
      {/* Rating Dialog */}
      <RateWorkoutDialog 
        open={ratingDialogOpen} 
        onOpenChange={setRatingDialogOpen} 
        workout={selectedWorkout ? { id: selectedWorkout.id, name: selectedWorkout.class_name, date: selectedWorkout.date } : null}
      />
    </div>
  );
};

export default WorkoutHistoryPage;
