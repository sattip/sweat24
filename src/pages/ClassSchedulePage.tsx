
import React, { useState } from "react";
import Header from "@/components/Header";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for the class schedule
const DAYS_OF_WEEK = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];
const CLASS_TYPES = ["Όλα", "Καρδιο", "Δύναμη", "Yoga", "HIIT", "Ποδηλασία"];

const mockClasses = [
  {
    id: 1,
    name: "Power Yoga",
    time: "07:30 - 08:30",
    instructor: "Emma Wilson",
    spotsAvailable: 8,
    totalSpots: 20,
    type: "Yoga",
    day: "Δευτέρα"
  },
  {
    id: 2,
    name: "HIIT Blast",
    time: "12:00 - 12:45",
    instructor: "Mike Johnson",
    spotsAvailable: 3,
    totalSpots: 15,
    type: "HIIT",
    day: "Δευτέρα"
  },
  {
    id: 3,
    name: "Spin Class",
    time: "18:00 - 19:00",
    instructor: "Sarah Davis",
    spotsAvailable: 0,
    totalSpots: 12,
    type: "Ποδηλασία",
    day: "Δευτέρα"
  },
  {
    id: 4,
    name: "Προπόνηση Δύναμης",
    time: "08:00 - 09:00",
    instructor: "Chris Taylor",
    spotsAvailable: 6,
    totalSpots: 15,
    type: "Δύναμη",
    day: "Τρίτη"
  },
  {
    id: 5,
    name: "Zumba",
    time: "17:30 - 18:30",
    instructor: "Sophia Martinez",
    spotsAvailable: 10,
    totalSpots: 25,
    type: "Καρδιο",
    day: "Τετάρτη"
  },
  {
    id: 6,
    name: "Ενδυνάμωση Κορμού",
    time: "19:00 - 19:45",
    instructor: "James Wilson",
    spotsAvailable: 8,
    totalSpots: 20,
    type: "Δύναμη",
    day: "Πέμπτη"
  },
  {
    id: 7,
    name: "Πυγμαχία",
    time: "20:00 - 21:00",
    instructor: "Alex Rodriguez",
    spotsAvailable: 2,
    totalSpots: 15,
    type: "Καρδιο",
    day: "Παρασκευή"
  }
];

const ClassSchedulePage = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("Δευτέρα");
  const [activeFilter, setActiveFilter] = useState("Όλα");
  
  const filteredClasses = mockClasses.filter(cls => 
    cls.day === activeDay && 
    (activeFilter === "Όλα" || cls.type === activeFilter)
  );

  const handleClassClick = (classId: number) => {
    navigate(`/class/${classId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Πρόγραμμα Μαθημάτων</h1>
        </div>
        
        {/* Day Tabs */}
        <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full mb-6">
          <TabsList className="w-full flex overflow-x-auto mb-2 no-scrollbar">
            {DAYS_OF_WEEK.map((day) => (
              <TabsTrigger 
                key={day} 
                value={day}
                className="flex-1 min-w-[100px]"
              >
                {day}
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
          {DAYS_OF_WEEK.map((day) => (
            <TabsContent key={day} value={day} className="space-y-4">
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
                            <User className="mr-1 h-4 w-4" />
                            <span>{cls.instructor}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            cls.spotsAvailable === 0 
                              ? "bg-destructive/10 text-destructive" 
                              : cls.spotsAvailable <= 5 
                                ? "bg-orange-100 text-orange-800" 
                                : "bg-green-100 text-green-800"
                          }`}>
                            {cls.spotsAvailable === 0 
                              ? "Γεμάτο" 
                              : `${cls.spotsAvailable} θέσεις διαθέσιμες`}
                          </span>
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
