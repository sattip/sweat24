
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { 
  Calendar, 
  Clock, 
  User, 
  Calendar as CalendarIcon, 
  Dumbbell 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for workout history
const mockWorkoutHistory = [
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

// Group workouts by month
const groupWorkoutsByMonth = (workouts) => {
  const grouped = {};
  
  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(workout);
  });
  
  return grouped;
};

const WorkoutHistoryPage = () => {
  const [filter, setFilter] = useState("all");
  
  // For demo purposes, we'll show the empty state if filter is set to "empty"
  const hasWorkouts = filter !== "empty" && mockWorkoutHistory.length > 0;
  
  const filteredWorkouts = mockWorkoutHistory.filter(workout => {
    if (filter === "all") return true;
    if (filter === "yoga") return workout.type === "Yoga";
    if (filter === "hiit") return workout.type === "HIIT";
    if (filter === "strength") return workout.type === "Strength";
    return true;
  });
  
  const groupedWorkouts = groupWorkoutsByMonth(filteredWorkouts);
  const totalWorkouts = filteredWorkouts.length;
  const totalMinutes = filteredWorkouts.reduce((acc, curr) => {
    const minutes = parseInt(curr.duration.split(" ")[0]);
    return acc + minutes;
  }, 0);
  
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
        
        {hasWorkouts ? (
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
                      <Link to={`/workout/${workout.id}`} key={workout.id} className="block">
                        <Card className="hover:border-primary transition-colors">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <span className="bg-muted text-xs font-medium rounded-full px-2 py-1 mr-2">
                                    {workout.type}
                                  </span>
                                  <h3 className="font-medium text-base">{workout.name}</h3>
                                </div>
                                
                                <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-y-1">
                                  <div className="flex items-center mr-4">
                                    <Calendar className="h-4 w-4 mr-1 text-primary" />
                                    {workout.date}
                                  </div>
                                  <div className="flex items-center mr-4">
                                    <Clock className="h-4 w-4 mr-1 text-primary" />
                                    {workout.time}
                                  </div>
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-1 text-primary" />
                                    {workout.instructor}
                                  </div>
                                </div>
                              </div>
                              
                              <Button size="sm" variant="ghost">
                                Rate
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
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
            <h2 className="text-xl font-semibold mb-2">No workout history yet</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Your workout history is empty. Time to hit the gym and start logging those workouts!
            </p>
            <Link to="/schedule">
              <Button>Book a Class</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkoutHistoryPage;
