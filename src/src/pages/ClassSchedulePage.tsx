import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, Users, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { classService } from "@/services/apiService";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/BookingCalendar";
import { format, startOfWeek, addDays } from "date-fns";
import { el } from "date-fns/locale";

// Constants
const DAYS_OF_WEEK = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];
const CLASS_TYPES = ["Όλα", "group", "personal", "Yoga", "HIIT", "Strength"];

// Get dates starting from today
const getWeekDates = () => {
  const today = new Date();
  
  return DAYS_OF_WEEK.map((day, index) => {
    const date = addDays(today, index);
    return {
      day: format(date, 'EEEE', { locale: el }),
      originalDay: day,
      date: format(date, 'dd/MM'),
      fullDate: format(date, 'yyyy-MM-dd')
    };
  });
};

// Helper function to get day of week in Greek
const getDayOfWeek = (date: string) => {
  const dayIndex = new Date(date).getDay();
  return DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1];
};

// Helper function to format time range
const formatTimeRange = (time: string, duration: number) => {
  // Handle time that comes as "HH:MM" string
  const [hours, minutes] = time.split(':').map(Number);
  
  // Calculate end time
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  
  // Format times with leading zeros
  const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  
  return `${startTime} - ${endTime}`;
};

const ClassSchedulePage = () => {
  const navigate = useNavigate();
  const weekDates = getWeekDates();
  const [activeDay, setActiveDay] = useState(weekDates[0]?.fullDate || "");
  const [activeFilter, setActiveFilter] = useState("Όλα");
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchClasses();
  }, []);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getAll();
      const formattedClasses = response.map((cls: any) => ({
        ...cls,
        day: getDayOfWeek(cls.date),
        originalTime: cls.time, // Keep original time for sorting
        time: formatTimeRange(cls.time, cls.duration),
        spotsAvailable: cls.max_participants - cls.current_participants,
        totalSpots: cls.max_participants
      })) || [];
      setClasses(formattedClasses);
      
      // Auto-select first day with classes if current day has no classes
      if (formattedClasses.length > 0) {
        const today = weekDates[0]?.fullDate;
        const todayHasClasses = formattedClasses.some(cls => cls.date === today && cls.status !== 'cancelled');
        
        if (!todayHasClasses) {
          // Find first day in the week that has classes
          const firstDayWithClasses = weekDates.find(day => 
            formattedClasses.some(cls => cls.date === day.fullDate && cls.status !== 'cancelled')
          );
          
          if (firstDayWithClasses) {
            setActiveDay(firstDayWithClasses.fullDate);
          }
        }
      }
    } catch (error) {
      toast.error("Σφάλμα κατά τη φόρτωση μαθημάτων");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredClasses = classes.filter(cls => {
    // Basic filters
    if (cls.date !== activeDay || cls.status === 'cancelled') return false;
    if (activeFilter !== "Όλα" && cls.type !== activeFilter) return false;
    
    // Time-based filtering: hide classes that have already started (for today only)
    const today = new Date().toISOString().split('T')[0];
    if (cls.date === today) {
      const now = new Date();
      const [hours, minutes] = cls.originalTime.split(':').map(Number);
      const classTime = new Date();
      classTime.setHours(hours, minutes, 0, 0);
      
      // Hide if class has already started
      if (now > classTime) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by original time (convert HH:MM to minutes for comparison)
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    return timeToMinutes(a.originalTime) - timeToMinutes(b.originalTime);
  });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const handleClassClick = (classId: number) => {
    navigate(`/class/${classId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        {/* Personal Booking Calendar */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Το Ημερολόγιό σου</h2>
          <BookingCalendar />
        </div>
        
        <div className="flex items-center justify-between mb-4 mt-12">
          <h1 className="text-2xl font-bold">Διαθέσιμα Μαθήματα</h1>
        </div>
        
        {/* Day Tabs */}
        <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full mb-6">
          <TabsList className="w-full flex overflow-x-auto mb-2 no-scrollbar">
            {weekDates.map(({ day, date, fullDate }) => (
              <TabsTrigger 
                key={fullDate} 
                value={fullDate}
                className="flex-1 min-w-[100px] flex flex-col py-2"
              >
                <span className="text-sm font-medium">{day}</span>
                <span className="text-xs text-muted-foreground">{date}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Filters */}
          <div className="flex overflow-x-auto gap-2 py-2 mb-4 no-scrollbar">
            {CLASS_TYPES.map((type) => (
              <button 
                key={type}
                className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap ${
                  activeFilter === type 
                    ? "bg-primary text-white" 
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => setActiveFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Content for each day */}
          {weekDates.map(({ fullDate }) => (
            <TabsContent key={fullDate} value={fullDate} className="space-y-4">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <Card 
                    key={cls.id}
                    className="hover:border-primary cursor-pointer transition-all"
                    onClick={() => handleClassClick(cls.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{cls.name}</h3>
                          <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{cls.time}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <Users className="mr-1 h-4 w-4" />
                            <span>{cls.current_participants || 0}/{cls.max_participants || 0} θέσεις</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mt-2 text-xs text-muted-foreground">
                            {cls.type}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Δεν υπάρχουν διαθέσιμα μαθήματα για αυτή την ημέρα με το επιλεγμένο φίλτρο.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default ClassSchedulePage;
