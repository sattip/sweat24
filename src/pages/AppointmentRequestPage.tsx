
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { toast } from "sonner";
import { buildApiUrl } from "@/config/api";

// No mock data - will fetch from API

// Time slots array for dropdown
const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00", "23:30"
];

interface DateTimePreference {
  id: string;
  date: Date | undefined;
  timeFrom: string;
  timeTo: string;
}

interface ServiceData {
  id: number;
  name: string;
  description: string;
  slug: string;
}

// Generate unique ID compatible with all browsers
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const AppointmentRequestPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  
  const [service, setService] = useState<ServiceData | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [dateTimePreferences, setDateTimePreferences] = useState<DateTimePreference[]>([
    { id: generateId(), date: undefined, timeFrom: "", timeTo: "" }
  ]);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Client details state
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  
  // Calendar popover state for each preference
  const [calendarOpen, setCalendarOpen] = useState<{ [key: string]: boolean }>({});

  // Fetch service data from API and populate user data
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) {
        setServiceLoading(false);
        return;
      }

      try {
        setServiceLoading(true);
        
        // Fetch all specialized services
        const response = await fetch(buildApiUrl('/specialized-services'), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const services = await response.json();
        const servicesArray = Array.isArray(services) ? services : (services.data || []);
        
        // Find the matching service by slug
        const matchedService = servicesArray.find((s: ServiceData) => s.slug === serviceId);
        
        if (matchedService) {
          setService(matchedService);
        } else {
          toast.error("Η υπηρεσία δεν βρέθηκε");
          navigate('/services');
        }
      } catch (error) {
        console.error('Error fetching service data:', error);
        toast.error("Σφάλμα κατά τη φόρτωση των δεδομένων υπηρεσίας");
        navigate('/services');
      } finally {
        setServiceLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId, navigate]);


  // Auto-populate user data for logged in users
  useEffect(() => {
    const userStr = localStorage.getItem('sweat93_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setClientName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim());
        setClientEmail(user.email || '');
        setClientPhone(user.phone || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Add new date preference
  const addDatePreference = () => {
    if (dateTimePreferences.length < 5) {
      setDateTimePreferences(prev => [
        ...prev,
        { id: generateId(), date: undefined, timeFrom: "", timeTo: "" }
      ]);
    }
  };

  // Remove date preference
  const removeDatePreference = (id: string) => {
    if (dateTimePreferences.length > 1) {
      setDateTimePreferences(prev => prev.filter(item => item.id !== id));
    }
  };

  // Update date for a preference
  const updateDate = (id: string, date: Date | undefined) => {
    setDateTimePreferences(prev => 
      prev.map(item => 
        item.id === id ? { ...item, date } : item
      )
    );
  };

  // Update time from for a preference
  const updateTimeFrom = (id: string, timeFrom: string) => {
    setDateTimePreferences(prev => 
      prev.map(item => 
        item.id === id ? { ...item, timeFrom } : item
      )
    );
  };

  // Update time to for a preference
  const updateTimeTo = (id: string, timeTo: string) => {
    setDateTimePreferences(prev => 
      prev.map(item => 
        item.id === id ? { ...item, timeTo } : item
      )
    );
  };

  // Validate time range
  const isValidTimeRange = (timeFrom: string, timeTo: string) => {
    if (!timeFrom || !timeTo) return false;
    return timeFrom < timeTo;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) {
      toast.error("Δεν έχουν φορτωθεί τα δεδομένα υπηρεσίας");
      return;
    }
    
    // Validate client details
    if (!clientName.trim()) {
      toast.error("Παρακαλώ εισάγετε το ονοματεπώνυμό σας");
      return;
    }
    
    if (!clientEmail.trim()) {
      toast.error("Παρακαλώ εισάγετε το email σας");
      return;
    }
    
    if (!clientPhone.trim()) {
      toast.error("Παρακαλώ εισάγετε το τηλέφωνό σας");
      return;
    }

    // Validate at least one date with valid time range is selected
    const validPreferences = dateTimePreferences.filter(pref => 
      pref.date && pref.timeFrom && pref.timeTo && isValidTimeRange(pref.timeFrom, pref.timeTo)
    );
    
    if (validPreferences.length === 0) {
      toast.error("Παρακαλώ επιλέξτε τουλάχιστον μια ημερομηνία με έγκυρο διάστημα ωρών");
      return;
    }
    
    // Check for invalid time ranges
    const invalidRanges = dateTimePreferences.filter(pref => 
      pref.date && pref.timeFrom && pref.timeTo && !isValidTimeRange(pref.timeFrom, pref.timeTo)
    );
    
    if (invalidRanges.length > 0) {
      toast.error("Η ώρα 'Από' πρέπει να είναι πριν από την ώρα 'Έως'");
      return;
    }
    
    setLoading(true);
    
    try {
      // Get user data
      const userStr = localStorage.getItem('sweat93_user');
      const token = localStorage.getItem('auth_token');
      
      if (!userStr || !token) {
        toast.error("Πρέπει να συνδεθείτε για να υποβάλετε αίτημα");
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userStr);

      // Prepare booking request data according to API specification
      const bookingRequestData = {
        service_type: service.slug, // Use the slug from database
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        preferred_time_slots: validPreferences.map(pref => {
          // Format date in local timezone to avoid timezone issues
          const localDate = pref.date;
          const year = localDate?.getFullYear();
          const month = String((localDate?.getMonth() || 0) + 1).padStart(2, '0');
          const day = String(localDate?.getDate()).padStart(2, '0');
          
          return {
            date: `${year}-${month}-${day}`,
            start_time: pref.timeFrom,
            end_time: pref.timeTo
          };
        }),
        notes: notes
      };

      console.log('🔍 Booking request data being sent:', bookingRequestData);

      // Submit booking request
      const response = await fetch(buildApiUrl('/booking-requests'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bookingRequestData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          "Το αίτημά σας υποβλήθηκε επιτυχώς! Θα επικοινωνήσουμε μαζί σας σύντομα για επιβεβαίωση.",
          { duration: 6000 }
        );
        
        // Navigate to profile with booking requests tab
        navigate("/profile?tab=booking-requests");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Αποτυχία υποβολής αιτήματος');
      }
    } catch (error: any) {
      console.error('Error submitting booking request:', error);
      toast.error(error.message || "Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while fetching service data
  if (serviceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  // Show error if service not found
  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Υπηρεσία δεν βρέθηκε</h1>
            <p className="text-muted-foreground mb-6">Η υπηρεσία που ζητήσατε δεν είναι διαθέσιμη.</p>
            <Button onClick={() => navigate('/services')}>
              Επιστροφή στις Υπηρεσίες
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Αίτημα Ραντεβού</h1>
          <p className="text-muted-foreground mt-2">{service.name} - {service.description}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Στοιχεία Επικοινωνίας
              </CardTitle>
              <CardDescription>
                Τα στοιχεία σας για την επιβεβαίωση του ραντεβού
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Ονοματεπώνυμο *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Εισάγετε το ονοματεπώνυμό σας"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Τηλέφωνο *</Label>
                  <Input
                    id="clientPhone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Εισάγετε το τηλέφωνό σας"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Εισάγετε το email σας"
                  required
                />
              </div>
            </CardContent>
          </Card>

          
          {/* Date and Time Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Προτιμήσεις Ημερομηνιών & Ωρών
              </CardTitle>
              <CardDescription>
                Επιλέξτε έως 5 ημερομηνίες με τα προτιμώμενα διαστήματα ωρών σας
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dateTimePreferences.map((preference, index) => (
                  <div key={preference.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Επιλογή {index + 1}</h4>
                      {dateTimePreferences.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDatePreference(preference.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label>Ημερομηνία</Label>
                      <Popover
                        open={calendarOpen[preference.id] || false}
                        onOpenChange={(open) => setCalendarOpen(prev => ({ ...prev, [preference.id]: open }))}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !preference.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {preference.date ? format(preference.date, "PPP") : <span>Επιλέξτε ημερομηνία</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={preference.date}
                            onSelect={(date) => {
                              updateDate(preference.id, date);
                              setCalendarOpen(prev => ({ ...prev, [preference.id]: false }));
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Time Range Selection */}
                    <div className="space-y-2">
                      <Label>Διάστημα Ωρών</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Από</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Select onValueChange={(value) => updateTimeFrom(preference.id, value)} value={preference.timeFrom}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Επιλέξτε ώρα" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map(slot => (
                                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Έως</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Select onValueChange={(value) => updateTimeTo(preference.id, value)} value={preference.timeTo}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Επιλέξτε ώρα" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map(slot => (
                                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Show time range validation */}
                      {preference.timeFrom && preference.timeTo && (
                        <div className="mt-2">
                          {isValidTimeRange(preference.timeFrom, preference.timeTo) ? (
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              ✓ Διάστημα: {preference.timeFrom} - {preference.timeTo}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                              ✗ Μη έγκυρο διάστημα
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add Date Button */}
                {dateTimePreferences.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDatePreference}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Προσθήκη Ημερομηνίας
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Επιπλέον Σημειώσεις</CardTitle>
              <CardDescription>
                Οποιοδήποτε ειδικό αίτημα ή πρόσθετες πληροφορίες (προαιρετικό)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="π.χ., Εστιάζω στην απώλεια βάρους, έχω πρόβλημα στη μέση, κλπ."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
          
          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Υποβολή Αιτήματος
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AppointmentRequestPage;
