import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for class details
const mockClasses = [
  {
    id: 1,
    name: "Power Yoga",
    day: "Δευτέρα",
    date: "24 Μαΐου 2025",
    time: "07:30 - 08:30",
    instructor: "Emma Wilson",
    instructorImage: "/placeholder.svg",
    duration: "60 λεπτά",
    description: "Το Power Yoga είναι ένα δυναμικό, ρευστό στυλ που συγχρονίζει την κίνηση με την αναπνοή. Αυτή η ενεργητική τάξη χτίζει δύναμη, ευελιξία και αντοχή ενώ μειώνει το στρες και βελτιώνει τη συγκέντρωση. Κατάλληλο για αρχάριους και προχωρημένους ασκούμενους.",
    location: "Στούντιο 2",
    difficulty: "Μεσαίο",
    spotsAvailable: 8,
    totalSpots: 20,
    type: "Yoga"
  },
  {
    id: 2,
    name: "HIIT Blast",
    day: "Δευτέρα",
    date: "24 Μαΐου 2025",
    time: "12:00 - 12:45",
    instructor: "Mike Johnson",
    instructorImage: "/placeholder.svg",
    duration: "45 λεπτά",
    description: "Προπόνηση Υψηλής Έντασης με Διαστήματα που εναλλάσσεται μεταξύ έντονων περιόδων δραστηριότητας και σταθερών περιόδων λιγότερο έντονης δραστηριότητας ή ανάπαυσης. Αυτή η προπόνηση θα σας ωθήσει στα όριά σας και θα σας βοηθήσει να μεγιστοποιήσετε την καύση θερμίδων βελτιώνοντας παράλληλα την καρδιαγγειακή φυσική κατάσταση.",
    location: "Κυρίως Όροφος",
    difficulty: "Προχωρημένο",
    spotsAvailable: 3,
    totalSpots: 15,
    type: "HIIT"
  },
  {
    id: 3,
    name: "Spin Class",
    day: "Δευτέρα",
    date: "24 Μαΐου 2025",
    time: "18:00 - 19:00",
    instructor: "Sarah Davis",
    instructorImage: "/placeholder.svg",
    duration: "60 λεπτά",
    description: "Προπόνηση εσωτερικής ποδηλασίας που προσομοιώνει έδαφος και καταστάσεις παρόμοιες με την ποδηλασία σε εξωτερικό χώρο. Προσαρμόστε την αντίσταση και την ταχύτητα σε επίπεδους δρόμους, λόφους και προπόνηση διαστημάτων για μια προκλητική καρδιαγγειακή προπόνηση.",
    location: "Στούντιο Ποδηλασίας",
    difficulty: "Όλα τα Επίπεδα",
    spotsAvailable: 0,
    totalSpots: 12,
    type: "Ποδηλασία"
  },
  {
    id: 4,
    name: "Προπόνηση Δύναμης",
    day: "Τρίτη",
    date: "25 Μαΐου 2025",
    time: "08:00 - 09:00",
    instructor: "Chris Taylor",
    instructorImage: "/placeholder.svg",
    duration: "60 λεπτά",
    description: "Χτίστε μυϊκή μάζα και βελτιώστε τη δύναμη με αυτή την ολοκληρωμένη προπόνηση χρησιμοποιώντας ελεύθερα βάρη, ελαστικές ζώνες και ασκήσεις σωματικού βάρους. Αυτή η τάξη εστιάζει στη σωστή φόρμα και τεχνική για να μεγιστοποιήσει τα αποτελέσματα και να αποτρέψει τραυματισμούς.",
    location: "Αίθουσα Βαρών",
    difficulty: "Μεσαίο",
    spotsAvailable: 6,
    totalSpots: 15,
    type: "Δύναμη"
  }
];

const ClassDetailsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { classId } = useParams();
  const classDetails = mockClasses.find(c => c.id === Number(classId));
  
  const handleBooking = () => {
    // Show success toast
    toast({
      title: "Κράτηση Επιτυχής!",
      description: `Η θέση σας στο μάθημα "${classDetails?.name}" επιβεβαιώθηκε.`,
      duration: 3000,
    });
    
    // Navigate to bookings page after a brief delay
    setTimeout(() => {
      navigate("/bookings");
    }, 1500);
  };
  
  if (!classDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-6 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Το μάθημα δεν βρέθηκε</h1>
          <Button onClick={() => navigate("/schedule")}>
            Επιστροφή στο Πρόγραμμα
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
          &larr; Πίσω στο Πρόγραμμα
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
          <CardContent className="p-5">
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
            </div>
          </CardContent>
        </Card>
        
        {/* Class Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Σχετικά με αυτό το μάθημα</h2>
          <p className="text-muted-foreground">{classDetails.description}</p>
        </div>
        
        {/* Action Button */}
        <div className="mt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <Button 
            className="w-full" 
            size="lg"
            variant={isFull ? "outline" : "default"}
            onClick={handleBooking}
          >
            {isFull ? "Εγγραφή σε Λίστα Αναμονής" : "Κράτηση Θέσης"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ClassDetailsPage;
