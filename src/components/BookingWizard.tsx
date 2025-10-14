import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Users,
  Dumbbell,
  Loader2,
  CheckCircle
} from "lucide-react";
import { classService, bookingService, userService } from "@/services/apiService";
import * as API from "@/config/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Gym {
  id: number;
  name: string;
  address: string;
}

interface ClassCategory {
  id: string;
  name: string;
  icon?: string;
}

interface ClassItem {
  id: number;
  name: string;
  category: string;
  instructor: string;
  duration: number;
  max_capacity: number;
  current_bookings: number;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available_spots: number;
}

const STEPS = [
  { id: 1, title: "Επιλογή Γυμναστηρίου", description: "Διάλεξε το γυμναστήριο που θες να προπονηθείς" },
  { id: 2, title: "Κατηγορία Μαθήματος", description: "Επίλεξε το είδος του μαθήματος" },
  { id: 3, title: "Επιλογή Μαθήματος", description: "Διάλεξε το συγκεκριμένο μάθημα" },
  { id: 4, title: "Ημερομηνία & Ώρα", description: "Επίλεξε πότε θες να κάνεις το μάθημα" }
];

export const BookingWizard: React.FC<BookingWizardProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Gym selection
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  // Step 2: Category selection
  const [categories, setCategories] = useState<ClassCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ClassCategory | null>(null);

  // Step 3: Class selection
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  // Step 4: Time slot selection
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [bulkBookingMode, setBulkBookingMode] = useState(false);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // 0=Sunday, 6=Saturday

  // Booking state
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetWizard();
      loadGyms();
    }
  }, [isOpen]);

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedGym(null);
    setSelectedCategory(null);
    setSelectedClass(null);
    setSelectedTimeSlot(null);
    setSelectedTimeSlots([]);
    setBulkBookingMode(false);
    setSelectedDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setClasses([]);
    setTimeSlots([]);
  };

  // Quick selection functions for bulk bookings with day filter
  const handleQuickSelect = (days: number) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    const slotsInRange = timeSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      const dayOfWeek = slotDate.getDay();
      return slotDate >= today &&
             slotDate <= endDate &&
             selectedDaysOfWeek.includes(dayOfWeek);
    });

    setSelectedTimeSlots(slotsInRange);
    setBulkBookingMode(true);
    toast.success(`Επιλέχθηκαν ${slotsInRange.length} διαθέσιμες ώρες`);
  };

  const toggleDayOfWeek = (day: number) => {
    setSelectedDaysOfWeek(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
  };

  const toggleTimeSlotSelection = (slot: TimeSlot) => {
    if (!bulkBookingMode) {
      // Single booking mode
      setSelectedTimeSlot(slot);
      setSelectedTimeSlots([]);
    } else {
      // Bulk booking mode
      const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
      if (isSelected) {
        setSelectedTimeSlots(selectedTimeSlots.filter(s => s.id !== slot.id));
      } else {
        setSelectedTimeSlots([...selectedTimeSlots, slot]);
      }
      setSelectedTimeSlot(null);
    }
  };

  const loadGyms = async () => {
    setLoading(true);
    try {
      const response = await API.apiRequest(API.API_ENDPOINTS.stores.list);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();

      // Handle both paginated and direct array responses
      const storesData = data.data || data;
      if (Array.isArray(storesData)) {
        const formattedGyms: Gym[] = storesData
          .filter((store: any) => store.is_active)
          .map((store: any) => ({
            id: store.id,
            name: store.name,
            address: store.address
          }));

        setGyms(formattedGyms);
      } else {
        throw new Error('Invalid stores data format');
      }
    } catch (error) {
      console.error('Failed to load gyms:', error);
      toast.error('Σφάλμα κατά τη φόρτωση γυμναστηρίων');
      // Fallback to empty array
      setGyms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Fetch both specialized services and class types
      const [servicesResponse, classesResponse] = await Promise.all([
        API.apiRequest('/specialized-services').catch(() => ({ ok: false })),
        API.apiRequest(API.API_ENDPOINTS.classes.list).catch(() => ({ ok: false }))
      ]);

      const categoriesMap = new Map<string, ClassCategory>();

      // Add specialized services
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        const servicesArray = servicesData.data || servicesData;

        if (Array.isArray(servicesArray)) {
          servicesArray
            .filter((service: any) => service.is_active)
            .forEach((service: any) => {
              categoriesMap.set(service.slug, {
                id: service.slug,
                name: service.name
              });
            });
        }
      }

      // Add class types from actual classes
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();

        if (Array.isArray(classesData)) {
          const uniqueTypes = new Set<string>();

          classesData.forEach((classItem: any) => {
            if (classItem.status === 'active') {
              // Create descriptive names based on type and service
              let categoryName = '';
              let categoryId = '';

              if (classItem.type === 'group' && classItem.service?.slug === 'semi-personal') {
                categoryName = 'Ομαδικό Semi Personal';
                categoryId = 'group-semi-personal';
              } else if (classItem.type === 'group' && classItem.service?.slug === 'personal-training') {
                categoryName = 'Ομαδικό Personal Training';
                categoryId = 'group-personal-training';
              } else if (classItem.type === 'personal') {
                categoryName = 'Προσωπική Προπόνηση';
                categoryId = 'personal-training';
              } else if (classItem.type === 'group') {
                categoryName = 'Ομαδικά Μαθήματα';
                categoryId = 'group-classes';
              }

              if (categoryName && !uniqueTypes.has(categoryId)) {
                uniqueTypes.add(categoryId);
                categoriesMap.set(categoryId, {
                  id: categoryId,
                  name: categoryName
                });
              }
            }
          });
        }
      }

      // Convert map to array and sort
      const formattedCategories = Array.from(categoriesMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // Ensure we have at least some basic categories as fallback
      if (formattedCategories.length === 0) {
        formattedCategories.push(
          { id: "group-classes", name: "Ομαδικά Μαθήματα" },
          { id: "personal-training", name: "Προσωπική Προπόνηση" },
          { id: "ems", name: "EMS" }
        );
      }

      setCategories(formattedCategories);

    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Σφάλμα κατά τη φόρτωση κατηγοριών');

      // Fallback to comprehensive list
      setCategories([
        { id: "group-classes", name: "Ομαδικά Μαθήματα" },
        { id: "group-semi-personal", name: "Ομαδικό Semi Personal" },
        { id: "group-personal-training", name: "Ομαδικό Personal Training" },
        { id: "personal-training", name: "Προσωπική Προπόνηση" },
        { id: "pilates", name: "Pilates" },
        { id: "pilates-group", name: "Pilates Ομαδικό" },
        { id: "yoga", name: "Yoga" },
        { id: "yoga-group", name: "Yoga Ομαδικό" },
        { id: "hiit", name: "HIIT & Cardio" },
        { id: "strength", name: "Strength Training" },
        { id: "ems", name: "EMS" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      // Fetch classes from API
      const response = await API.apiRequest(API.API_ENDPOINTS.classes.list);
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const classesData = await response.json();

      // Filter classes based on selected category
      let filteredClasses: any[] = [];

      if (Array.isArray(classesData)) {
        if (selectedCategory.id === 'group-classes') {
          // Generic group classes
          filteredClasses = classesData.filter((classItem: any) =>
            classItem.type === 'group' && classItem.status === 'active'
          );
        } else if (selectedCategory.id === 'group-semi-personal') {
          // Group semi personal classes
          filteredClasses = classesData.filter((classItem: any) =>
            classItem.type === 'group' &&
            classItem.service?.slug === 'semi-personal' &&
            classItem.status === 'active'
          );
        } else if (selectedCategory.id === 'group-personal-training') {
          // Group personal training classes
          filteredClasses = classesData.filter((classItem: any) =>
            classItem.type === 'group' &&
            classItem.service?.slug === 'personal-training' &&
            classItem.status === 'active'
          );
        } else if (selectedCategory.id === 'personal-training') {
          // Personal training classes
          filteredClasses = classesData.filter((classItem: any) =>
            classItem.type === 'personal' && classItem.status === 'active'
          );
        } else if (selectedCategory.id === 'ems') {
          // EMS classes
          filteredClasses = classesData.filter((classItem: any) =>
            classItem.service?.slug === 'ems' ||
            classItem.name.toLowerCase().includes('ems') &&
            classItem.status === 'active'
          );
        } else {
          // For other specialized services or fallback
          filteredClasses = classesData.filter((classItem: any) =>
            classItem.status === 'active'
          );
        }
      }

      // Group classes by name to avoid duplicates and get unique class types
      const uniqueClasses = new Map<string, ClassItem>();

      filteredClasses.forEach((classItem: any) => {
        const classKey = `${classItem.name}-${classItem.instructor_name || classItem.instructor}`;

        if (!uniqueClasses.has(classKey)) {
          uniqueClasses.set(classKey, {
            id: classItem.id,
            name: classItem.name,
            category: selectedCategory.id,
            instructor: classItem.instructor_name || classItem.trainer_name || classItem.instructor,
            duration: classItem.duration,
            max_capacity: classItem.max_participants,
            current_bookings: classItem.current_participants || 0
          });
        }
      });

      const formattedClasses = Array.from(uniqueClasses.values());
      setClasses(formattedClasses);

      // If no classes found, show a message
      if (formattedClasses.length === 0) {
        toast.info('Δεν βρέθηκαν διαθέσιμα μαθήματα για αυτή την κατηγορία');
      }

    } catch (error) {
      console.error('Failed to load classes:', error);
      toast.error('Σφάλμα κατά τη φόρτωση μαθημάτων');
      // Fallback to empty array
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      // Fetch all classes to find available time slots for the selected class type
      const response = await API.apiRequest(API.API_ENDPOINTS.classes.list);
      if (!response.ok) {
        throw new Error('Failed to fetch class schedule');
      }

      const classesData = await response.json();

      // Filter classes that match the selected class (by name and instructor)
      const matchingClasses = Array.isArray(classesData)
        ? classesData.filter((classItem: any) =>
            classItem.name === selectedClass.name &&
            (classItem.instructor_name === selectedClass.instructor ||
             classItem.trainer_name === selectedClass.instructor) &&
            classItem.status === 'active' &&
            new Date(classItem.date) >= new Date() // Only future classes
          )
        : [];

      // Convert classes to time slots
      const formattedTimeSlots: TimeSlot[] = matchingClasses.map((classItem: any) => ({
        id: classItem.id.toString(),
        date: classItem.date,
        time: classItem.time,
        available_spots: Math.max(0, classItem.max_participants - (classItem.current_participants || 0))
      }));

      // Sort by date and time
      formattedTimeSlots.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });

      setTimeSlots(formattedTimeSlots);

      if (formattedTimeSlots.length === 0) {
        toast.info('Δεν βρέθηκαν διαθέσιμες ώρες για αυτό το μάθημα');
      }

    } catch (error) {
      console.error('Failed to load time slots:', error);
      toast.error('Σφάλμα κατά τη φόρτωση ωρών');
      // Fallback to empty array
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && !selectedGym) {
      toast.error('Παρακαλώ επιλέξτε γυμναστήριο');
      return;
    }

    if (currentStep === 2 && !selectedCategory) {
      toast.error('Παρακαλώ επιλέξτε τύπο μαθήματος');
      return;
    }

    if (currentStep === 3 && !selectedClass) {
      toast.error('Παρακαλώ επιλέξτε μάθημα');
      return;
    }

    if (currentStep === 4 && !selectedTimeSlot && selectedTimeSlots.length === 0) {
      toast.error('Παρακαλώ επιλέξτε τουλάχιστον μία ημερομηνία και ώρα');
      return;
    }

    if (currentStep < STEPS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Load data for next step
      if (nextStep === 2) {
        loadCategories();
      } else if (nextStep === 3) {
        loadClasses();
      } else if (nextStep === 4) {
        loadTimeSlots();
      }
    } else {
      // Final step - make booking
      await handleBooking();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = async () => {
    if (!selectedClass || !selectedGym) return;
    if (!selectedTimeSlot && selectedTimeSlots.length === 0) return;

    setBookingInProgress(true);

    // Determine which slots to book
    const slotsToBook = bulkBookingMode && selectedTimeSlots.length > 0
      ? selectedTimeSlots
      : selectedTimeSlot
      ? [selectedTimeSlot]
      : [];

    if (slotsToBook.length === 0) {
      toast.error('Δεν επιλέχθηκαν ώρες για κράτηση');
      setBookingInProgress(false);
      return;
    }

    let user: any = null;
    let token: string = '';

    // Check authentication first
    try {
      const userStr = localStorage.getItem('sweat24_user');
      token = localStorage.getItem('auth_token') || '';

      console.log('🔐 Auth check:', {
        hasUser: !!userStr,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
      });

      if (!userStr || !token) {
        throw new Error('Δεν είστε συνδεδεμένος. Παρακαλώ κάντε login ξανά.');
      }

      try {
        user = JSON.parse(userStr);
      } catch (parseError) {
        console.error('Failed to parse user data:', parseError);
        throw new Error('Τα δεδομένα χρήστη είναι κατεστραμμένα. Παρακαλώ κάντε login ξανά.');
      }

      console.log('👤 User data:', {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        userType: typeof user
      });

      if (!user || typeof user !== 'object') {
        throw new Error('Μη έγκυρα στοιχεία χρήστη. Παρακαλώ κάντε login ξανά.');
      }

      if (!user.id) {
        throw new Error('Λείπει το ID χρήστη. Παρακαλώ κάντε login ξανά.');
      }

      if (!user.name || !user.email) {
        throw new Error('Λείπουν τα στοιχεία χρήστη (όνομα/email). Παρακαλώ κάντε login ξανά.');
      }

      // Get fresh user data from backend
      try {
        console.log('🔄 Fetching fresh user data from backend...');
        const userDataResponse = await fetch('https://api.sweat93.gr/api/v1/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!userDataResponse.ok) {
          if (userDataResponse.status === 401 || userDataResponse.status === 403) {
            throw new Error('Το session σας έχει λήξει. Παρακαλώ κάντε login ξανά.');
          }
          throw new Error('Αποτυχία ανάκτησης δεδομένων χρήστη.');
        }

        const userDataResult = await userDataResponse.json();
        if (userDataResult.success && userDataResult.user) {
          // Update user with fresh data
          user = userDataResult.user;

          // Update localStorage with fresh data
          localStorage.setItem('sweat24_user', JSON.stringify(user));
          localStorage.setItem('user', JSON.stringify(user));

          console.log('✅ Fresh user data loaded:', {
            id: user.id,
            name: user.name,
            email: user.email
          });
        } else {
          throw new Error('Μη έγκυρη απάντηση από το backend.');
        }

      } catch (userDataError) {
        console.error('Failed to get fresh user data:', userDataError);
        throw new Error('Αποτυχία φόρτωσης δεδομένων χρήστη. Παρακαλώ κάντε login ξανά.');
      }

    } catch (authError) {
      console.error('Authentication check failed:', authError);
      toast.error(authError instanceof Error ? authError.message : 'Σφάλμα authentication');
      setBookingInProgress(false);
      return;
    }

    try {
      // Fetch the complete class details to get all required fields
      const classesResponse = await API.apiRequest(API.API_ENDPOINTS.classes.list);
      if (!classesResponse.ok) {
        throw new Error('Failed to fetch class details');
      }

      const classesData = await classesResponse.json();

      // Process all bookings
      let successCount = 0;
      let failCount = 0;
      let duplicateCount = 0;

      for (const slot of slotsToBook) {
        try {
          const selectedClassDetails = Array.isArray(classesData)
            ? classesData.find((classItem: any) => classItem.id.toString() === slot.id)
            : null;

          if (!selectedClassDetails) {
            console.warn(`Skipping slot ${slot.id} - class details not found`);
            failCount++;
            continue;
          }

          // Prepare booking data with all required fields
          const bookingData = {
            class_id: parseInt(slot.id, 10),
            store_id: selectedGym.id,
            class_name: selectedClassDetails.name,
            instructor: selectedClassDetails.instructor_name || selectedClassDetails.trainer_name || selectedClassDetails.instructor,
            date: selectedClassDetails.date,
            time: selectedClassDetails.time,
            type: selectedClassDetails.type,
            location: selectedClassDetails.location || selectedGym.address || 'Main Studio',
            service_id: selectedClassDetails.service_id || selectedClassDetails.service?.id,
            user_id: user.id,
            customer_name: user.name,
            customer_email: user.email,
            status: 'confirmed',
            attended: 0,
            notes: `Κράτηση μέσω wizard - ${selectedClass.name} με ${selectedClass.instructor}`
          };

          const response = await bookingService.create(bookingData);

          if (response.success) {
            successCount++;
          } else {
            const errorMessage = response.message || '';
            if (errorMessage.toLowerCase().includes('duplicate') ||
                errorMessage.toLowerCase().includes('already') ||
                errorMessage.toLowerCase().includes('ήδη')) {
              duplicateCount++;
            } else {
              failCount++;
              console.error('Booking failed for slot:', slot.id, errorMessage);
            }
          }
        } catch (slotError: any) {
          failCount++;
          console.error('Error booking slot:', slot.id, slotError);
        }
      }

      // Show results
      console.log('📊 Booking results:', { successCount, failCount, duplicateCount, total: slotsToBook.length });

      if (successCount > 0) {
        if (slotsToBook.length === 1) {
          toast.success('Η κράτησή σας ολοκληρώθηκε επιτυχώς! 🎉');
        } else {
          toast.success(`${successCount} κρατήσεις ολοκληρώθηκαν επιτυχώς! 🎉`, {
            description: duplicateCount > 0 ? `${duplicateCount} ήταν ήδη κρατημένες` : undefined,
            duration: 5000,
          });
        }
        onClose();
        navigate('/bookings');
      } else if (duplicateCount > 0 && failCount === 0) {
        toast.warning('Όλες οι κρατήσεις είχαν ήδη γίνει.');
        onClose();
        navigate('/bookings');
      } else {
        throw new Error(`Αποτυχία δημιουργίας κρατήσεων. Επιτυχείς: ${successCount}, Αποτυχίες: ${failCount}`);
      }
    } catch (error: any) {
      console.error('Booking failed:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        error
      });

      // Show more detailed error message
      const errorMessage = error.message || 'Σφάλμα κατά την κράτηση';
      toast.error(`Κράτηση απέτυχε: ${errorMessage}`);
    } finally {
      setBookingInProgress(false);
    }
  };

  const getProgress = () => (currentStep / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Επιλέξτε Γυμναστήριο</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-3">
                {gyms.map((gym) => (
                  <Card
                    key={gym.id}
                    className={`cursor-pointer transition-all ${
                      selectedGym?.id === gym.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedGym(gym)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">{gym.name}</h4>
                          <p className="text-sm text-muted-foreground">{gym.address}</p>
                        </div>
                        {selectedGym?.id === gym.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Επιλέξτε Κατηγορία Μαθήματος</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className={`cursor-pointer transition-all ${
                      selectedCategory?.id === category.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <h4 className="font-medium">{category.name}</h4>
                        </div>
                        {selectedCategory?.id === category.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Επιλέξτε Μάθημα</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((classItem) => (
                  <Card
                    key={classItem.id}
                    className={`cursor-pointer transition-all ${
                      selectedClass?.id === classItem.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedClass(classItem)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{classItem.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              με {classItem.instructor}
                            </p>
                          </div>
                          {selectedClass?.id === classItem.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {classItem.duration}min
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {classItem.current_bookings}/{classItem.max_capacity}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        const daysOfWeek = [
          { value: 1, label: 'Δευ', fullLabel: 'Δευτέρα' },
          { value: 2, label: 'Τρί', fullLabel: 'Τρίτη' },
          { value: 3, label: 'Τετ', fullLabel: 'Τετάρτη' },
          { value: 4, label: 'Πέμ', fullLabel: 'Πέμπτη' },
          { value: 5, label: 'Παρ', fullLabel: 'Παρασκευή' },
          { value: 6, label: 'Σάβ', fullLabel: 'Σάββατο' },
          { value: 0, label: 'Κυρ', fullLabel: 'Κυριακή' }
        ];

        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Επιλέξτε Ημερομηνία & Ώρα</h3>

            {/* Quick Select Buttons */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium">Γρήγορες Επιλογές</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-3 px-3">
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(7)}
                    className="flex-1 h-7 text-xs px-2"
                  >
                    1 Εβδομάδα
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(15)}
                    className="flex-1 h-7 text-xs px-2"
                  >
                    15 Ημέρες
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(30)}
                    className="flex-1 h-7 text-xs px-2"
                  >
                    1 Μήνας
                  </Button>
                </div>

                {/* Days of Week Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Μέρες της εβδομάδας:</Label>
                  <div className="flex gap-1">
                    {daysOfWeek.map((day) => (
                      <Button
                        key={day.value}
                        variant={selectedDaysOfWeek.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDayOfWeek(day.value)}
                        className="flex-1 h-7 text-xs px-1 min-w-0"
                        title={day.fullLabel}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {bulkBookingMode && selectedTimeSlots.length > 0 && (
              <div className="flex items-center justify-center py-1.5 px-3 bg-secondary rounded-md">
                <span className="text-xs font-medium">Επιλέχθηκαν {selectedTimeSlots.length} ώρες</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {timeSlots.map((slot) => {
                  const isSelected = bulkBookingMode
                    ? selectedTimeSlots.some(s => s.id === slot.id)
                    : selectedTimeSlot?.id === slot.id;

                  return (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleTimeSlotSelection(slot)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">
                                {new Date(slot.date).toLocaleDateString('el-GR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {slot.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={slot.available_spots > 5 ? "default" : "secondary"}>
                              {slot.available_spots} θέσεις
                            </Badge>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col rounded-xl p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Κράτηση Μαθήματος
            </DialogTitle>
            <DialogDescription>
              Ακολουθήστε τα βήματα για να κλείσετε το μάθημά σας
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="space-y-2 mt-6">
            <div className="flex justify-between text-sm">
              <span>Βήμα {currentStep} από {STEPS.length}</span>
              <span>{Math.round(getProgress())}% ολοκληρώθηκε</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>

          {/* Step Indicator */}
          <div className="flex justify-between my-6">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                  step.id < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.id === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs text-center max-w-[80px] leading-tight">
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px] pb-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation Buttons - Sticky at bottom */}
        <div className="sticky bottom-0 flex justify-between px-6 py-4 border-t bg-white">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || bookingInProgress}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Πίσω
          </Button>

          <Button
            onClick={handleNext}
            disabled={loading || bookingInProgress}
            className="flex items-center gap-2"
          >
            {bookingInProgress && <Loader2 className="h-4 w-4 animate-spin" />}
            {currentStep === STEPS.length
              ? (bulkBookingMode && selectedTimeSlots.length > 1
                  ? `Κράτηση ${selectedTimeSlots.length} Μαθημάτων`
                  : 'Ολοκλήρωση Κράτησης')
              : 'Επόμενο'}
            {currentStep < STEPS.length && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
