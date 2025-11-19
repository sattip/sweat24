import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Users, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { classService } from "@/services/apiService";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingWizard } from "@/components/BookingWizard";
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
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);
  
  useEffect(() => {
    fetchClasses();
  }, []);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getAll();
      console.log('Classes API Response:', response);
      console.log('Is array:', Array.isArray(response));

      if (!Array.isArray(response)) {
        console.error('Response is not an array:', response);
        toast.error("Σφάλμα: Μη έγκυρη απόκριση από τον διακομιστή");
        return;
      }

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
      console.error('Error fetching classes:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error("Σφάλμα κατά τη φόρτωση μαθημάτων");
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
        {/* Header with New Booking Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
          <h2 className="text-2xl font-bold">Το Ημερολόγιό σου</h2>
          <Button onClick={() => setBookingWizardOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Νέα Κράτηση
          </Button>
        </div>

        {/* Personal Booking Calendar */}
        <div className="mb-8">
          <BookingCalendar />
        </div>
      </main>

      {/* Booking Wizard */}
      <BookingWizard
        isOpen={bookingWizardOpen}
        onClose={() => setBookingWizardOpen(false)}
      />
    </div>
  );
};

export default ClassSchedulePage;
