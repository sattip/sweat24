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
  CheckCircle,
  Coins
} from "lucide-react";
import { classService, bookingService, userService, loyaltyService, profileService } from "@/services/apiService";
import * as API from "@/config/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BookWithPointsDialog } from "@/components/BookWithPointsDialog";
import { JoinWaitlistDialog } from "@/components/JoinWaitlistDialog";
import { useAuth } from "@/contexts/AuthContext";

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
  id: number;
  name: string;
  value: string;
  description?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
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
  isAlreadyBooked?: boolean;
  className?: string;
  instructor?: string;
}

const STEPS = [
  { id: 1, title: "Επιλογή Γυμναστηρίου", description: "Διάλεξε το γυμναστήριο που θες να προπονηθείς" },
  { id: 2, title: "Κατηγορία Μαθήματος", description: "Επίλεξε το είδος του μαθήματος" },
  { id: 3, title: "Ημερομηνία & Ώρα", description: "Επίλεξε πότε θες να κάνεις το μάθημα" }
];

export const BookingWizard: React.FC<BookingWizardProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasActivePackage, setHasActivePackage] = useState<boolean | null>(null);

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // New state for date picker
  const [dateScrollIndex, setDateScrollIndex] = useState(0); // For date carousel navigation
  const [currentMonth, setCurrentMonth] = useState<string>(''); // Track current month YYYY-MM

  // Loyalty points state
  const [userPoints, setUserPoints] = useState(0);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [usePointsForBooking, setUsePointsForBooking] = useState(false);

  // Priority booking state
  const [hasPriorityBooking, setHasPriorityBooking] = useState(false);

  // Booking state
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Waitlist state
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const [waitlistClassInfo, setWaitlistClassInfo] = useState<{
    classId: number;
    className: string;
    classDate: string;
    classTime: string;
  } | null>(null);

  useEffect(() => {
    const checkActivePackage = async () => {
      try {
        const packages = await profileService.getActivePackages();
        const activePackage = Array.isArray(packages)
          ? packages.find((p: any) => {
              const status = p?.status?.toLowerCase();
              const isActive = status === 'active' || status === 'ενεργό' || p?.is_active === true;
              const notFrozen = p?.is_frozen === false || p?.is_frozen === undefined;
              return isActive && notFrozen;
            })
          : null;

        if (!activePackage) {
          toast.error("Δεν έχετε ενεργό πακέτο. Παρακαλώ επικοινωνήστε με τη γραμματεία για να ανανεώσετε την συνδρομή σας.");
          onClose();
          return;
        }

        setHasActivePackage(true);
      } catch (error) {
        console.error("Error checking active package:", error);
        toast.error("Σφάλμα κατά τον έλεγχο του πακέτου σας.");
        onClose();
      }
    };

    if (isOpen) {
      resetWizard();
      checkActivePackage();
      loadGyms();
      fetchUserPoints();
      fetchPriorityBookingStatus();
    }
  }, [isOpen]);

  // Fetch user loyalty points
  const fetchUserPoints = async () => {
    try {
      const data = await loyaltyService.getDashboard();
      setUserPoints(data.current_balance || 0);
    } catch (error) {
      console.error('Failed to fetch loyalty points:', error);
      // Don't show error toast - points are optional
      setUserPoints(0);
    }
  };

  // Fetch priority booking status
  const fetchPriorityBookingStatus = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setHasPriorityBooking(userData.has_priority_booking || false);
    } catch (error) {
      console.error('Failed to fetch priority booking status:', error);
      setHasPriorityBooking(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedGym(null);
    setSelectedCategory(null);
    setSelectedClass(null);
    setSelectedTimeSlot(null);
    setSelectedTimeSlots([]);
    setBulkBookingMode(false);
    setSelectedDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setSelectedDate(null);
    setDateScrollIndex(0);
    setCurrentMonth('');
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
             selectedDaysOfWeek.includes(dayOfWeek) &&
             !slot.isAlreadyBooked; // Exclude already-booked slots
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
    // Prevent selecting already-booked slots
    if (slot.isAlreadyBooked) {
      toast.warning('Έχετε ήδη κράτηση για αυτό το μάθημα');
      return;
    }

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
      // Get current user ID for filtering (from localStorage for performance)
      const userStr = localStorage.getItem('sweat93_user');
      let userId: number | null = null;

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user?.id;
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }

      // Fetch class types from the new API endpoint
      // Filter categories based on user's package type
      const endpoint = userId
        ? `/class-types?active_only=1&user_id=${userId}`
        : '/class-types?active_only=1';

      const response = await API.apiRequest(endpoint);

      if (!response.ok) {
        throw new Error('Failed to fetch class types');
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Sort by sort_order
        const sortedCategories = data.data.sort((a: ClassCategory, b: ClassCategory) =>
          a.sort_order - b.sort_order
        );

        setCategories(sortedCategories);

        if (sortedCategories.length === 0) {
          toast.info('Δεν βρέθηκαν διαθέσιμοι τύποι μαθημάτων');
        }
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Σφάλμα κατά τη φόρτωση κατηγοριών');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('type', selectedCategory.value);
      params.append('status', 'active');
      if (selectedGym) {
        params.append('store_id', selectedGym.id.toString());
      }

      // Try the new endpoint first
      let response = await API.apiRequest(`/fitness-classes?${params.toString()}`);
      let classesData: any[] = [];

      // If 403 or 404, fallback to old endpoint
      if (response.status === 403 || response.status === 404) {
        console.warn('fitness-classes endpoint not available, falling back to /classes');
        response = await API.apiRequest(API.API_ENDPOINTS.classes.list);

        if (!response.ok) {
          throw new Error('Failed to fetch classes from fallback endpoint');
        }

        // Old endpoint returns array directly
        const data = await response.json();
        classesData = Array.isArray(data) ? data : [];

        // Filter client-side for old endpoint
        classesData = classesData.filter((classItem: any) =>
          classItem.type === selectedCategory.value &&
          classItem.status === 'active' &&
          (!selectedGym || classItem.store_id === selectedGym.id)
        );
      } else if (!response.ok) {
        throw new Error('Failed to fetch classes');
      } else {
        // New endpoint returns {success, data} format
        const result = await response.json();
        classesData = result.success && result.data ? result.data : [];
      }

      // Group classes by name and instructor to avoid duplicates
      const uniqueClasses = new Map<string, ClassItem>();

      classesData.forEach((classItem: any) => {
        const classKey = `${classItem.name}-${classItem.instructor_name || classItem.instructor}`;

        if (!uniqueClasses.has(classKey)) {
          uniqueClasses.set(classKey, {
            id: classItem.id,
            name: classItem.name,
            category: selectedCategory.value,
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
    if (!selectedCategory) return;

    setLoading(true);
    try {
      // Build query parameters for filtered search
      const params = new URLSearchParams();
      params.append('type', selectedCategory.value);
      params.append('status', 'active');
      if (selectedGym) {
        params.append('store_id', selectedGym.id.toString());
      }

      // Fetch matching classes and user bookings in parallel
      const [classesResponse, userBookings] = await Promise.all([
        API.apiRequest(`/fitness-classes?${params.toString()}`),
        bookingService.getUserBookings()
      ]);

      let classesData: any[] = [];

      // If 403 or 404, fallback to old endpoint
      if (classesResponse.status === 403 || classesResponse.status === 404) {
        console.warn('fitness-classes endpoint not available, falling back to /classes');
        const fallbackResponse = await API.apiRequest(API.API_ENDPOINTS.classes.list);

        if (!fallbackResponse.ok) {
          throw new Error('Failed to fetch class schedule from fallback endpoint');
        }

        const data = await fallbackResponse.json();
        console.log('BookingWizard: Fallback /classes response:', data);
        // Handle wrapped response format { success: true, data: [...] }
        classesData = (data && data.data && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : []);
        console.log('BookingWizard: Extracted classesData:', classesData.length, 'classes');
      } else if (!classesResponse.ok) {
        throw new Error('Failed to fetch class schedule');
      } else {
        const result = await classesResponse.json();
        console.log('BookingWizard: /fitness-classes response:', result);
        classesData = result.success && result.data ? result.data : [];
        console.log('BookingWizard: Extracted classesData:', classesData.length, 'classes');
      }

      console.log('BookingWizard: Loading all classes for category:', selectedCategory.value);
      console.log('BookingWizard: First class from API for comparison:', classesData[0]);

      // Filter classes that match the selected category and are in the future
      const matchingClasses = classesData.filter((classItem: any) => {
        const typeMatch = classItem.type === selectedCategory.value;
        const statusMatch = classItem.status === 'active';

        // Compare dates without time - only check if class date is today or in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const classDate = new Date(classItem.date);
        classDate.setHours(0, 0, 0, 0);
        const dateMatch = classDate >= today;

        // If gym is selected, filter by gym too
        const gymMatch = !selectedGym || classItem.store_id === selectedGym.id;

        return typeMatch && statusMatch && dateMatch && gymMatch;
      });

      console.log('BookingWizard: Matching classes found:', matchingClasses.length);
      console.log('BookingWizard: First few matching classes:', matchingClasses.slice(0, 3));

      // Create a set of booked class IDs for quick lookup
      const bookedClassIds = new Set(
        userBookings
          .filter((booking: any) =>
            booking.status !== 'cancelled' &&
            booking.status !== 'rejected'
          )
          .map((booking: any) => booking.class_id?.toString())
      );

      // Convert classes to time slots and mark already-booked ones
      const formattedTimeSlots: TimeSlot[] = matchingClasses.map((classItem: any) => {
        const maxParticipants = classItem.max_participants || 0;
        const currentParticipants = classItem.current_participants || 0;
        const prioritySeats = classItem.priority_seats || 0;

        // DEBUG: Log class data to verify API response
        console.log('🔍 Priority Seating Debug:', {
          classId: classItem.id,
          className: classItem.name,
          date: classItem.date,
          time: classItem.time,
          max_participants: classItem.max_participants,
          current_participants: classItem.current_participants,
          priority_seats: classItem.priority_seats,
          hasPriorityBooking: hasPriorityBooking,
          rawClassData: classItem
        });

        // Calculate hours until class
        const classDateTime = new Date(`${classItem.date}T${classItem.time}`);
        const now = new Date();
        const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        // If less than 24h before class (but not in the past), all seats available to everyone
        const prioritySeatsOpenToAll = hoursUntilClass >= 0 && hoursUntilClass < 24;

        let availableSpots = 0;

        if (hasPriorityBooking) {
          // Priority users can book any available seat
          availableSpots = Math.max(0, maxParticipants - currentParticipants);
        } else {
          // Regular users
          if (prioritySeatsOpenToAll) {
            // Within 24h: all seats available
            availableSpots = Math.max(0, maxParticipants - currentParticipants);
          } else {
            // More than 24h: only non-priority seats available
            const regularSeats = maxParticipants - prioritySeats;
            availableSpots = Math.max(0, regularSeats - currentParticipants);
          }
        }

        // DEBUG: Log calculated available spots
        console.log('📊 Available Spots Calculation:', {
          classId: classItem.id,
          hoursUntilClass: hoursUntilClass.toFixed(2),
          prioritySeatsOpenToAll,
          calculatedAvailableSpots: availableSpots,
          formula: hasPriorityBooking
            ? `${maxParticipants} - ${currentParticipants} = ${availableSpots}`
            : prioritySeatsOpenToAll
              ? `${maxParticipants} - ${currentParticipants} = ${availableSpots} (24h rule)`
              : `(${maxParticipants} - ${prioritySeats}) - ${currentParticipants} = ${availableSpots}`
        });

        return {
          id: classItem.id.toString(),
          date: classItem.date,
          time: classItem.time,
          available_spots: availableSpots,
          isAlreadyBooked: bookedClassIds.has(classItem.id.toString()),
          className: classItem.name,
          instructor: classItem.instructor_name || classItem.trainer_name || classItem.instructor
        };
      });

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

    if (currentStep === 3 && !selectedTimeSlot && selectedTimeSlots.length === 0) {
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

  const handleBookWithPoints = async (pointsData: {
    payment_method: 'full_points' | 'partial' | 'cash_only';
    points_to_use?: number;
  }) => {
    if (!selectedCategory || !selectedGym || !selectedTimeSlot) return;

    try {
      setBookingInProgress(true);

      // Get user data
      const userStr = localStorage.getItem('sweat93_user');
      const token = localStorage.getItem('auth_token');

      if (!userStr || !token) {
        throw new Error('Δεν είστε συνδεδεμένος. Παρακαλώ κάντε login ξανά.');
      }

      const user = JSON.parse(userStr);

      // Fetch the complete class details to get all required fields
      let classesResponse = await API.apiRequest('/fitness-classes?status=active');
      let classesData: any[] = [];

      // If 403 or 404, fallback to old endpoint
      if (classesResponse.status === 403 || classesResponse.status === 404) {
        console.warn('fitness-classes endpoint not available, falling back to /classes');
        classesResponse = await API.apiRequest(API.API_ENDPOINTS.classes.list);

        if (!classesResponse.ok) {
          throw new Error('Failed to fetch class details from fallback endpoint');
        }

        const data = await classesResponse.json();
        classesData = Array.isArray(data) ? data : [];
      } else if (!classesResponse.ok) {
        throw new Error('Failed to fetch class details');
      } else {
        const result = await classesResponse.json();
        classesData = result.success && result.data ? result.data : [];
      }

      const selectedClassDetails = Array.isArray(classesData)
        ? classesData.find((classItem: any) => classItem.id.toString() === selectedTimeSlot.id)
        : null;

      if (!selectedClassDetails) {
        throw new Error('Δεν βρέθηκαν λεπτομέρειες μαθήματος');
      }

      // Prepare booking data
      const bookingData = {
        class_id: parseInt(selectedTimeSlot.id, 10),
        store_id: selectedGym.id,
        class_name: selectedClassDetails.name,
        instructor: selectedClassDetails.instructor_name || selectedClassDetails.trainer_name || selectedClassDetails.instructor,
        date: selectedTimeSlot.date,
        time: selectedTimeSlot.time,
        type: selectedCategory?.value || '',
        location: selectedGym.address,
        user_id: user.id,
        customer_name: user.name,
        customer_email: user.email,
        status: 'confirmed',
        payment_method: pointsData.payment_method,
        points_to_use: pointsData.points_to_use,
      };

      const result = await loyaltyService.bookWithPoints(bookingData);

      if (result.success) {
        const pointsUsed = result.data?.points_used || pointsData.points_to_use || 0;
        const remainingPoints = result.data?.remaining_points || (userPoints - pointsUsed);

        toast.success(result.message || 'Κράτηση επιτυχής! 🎉', {
          description: pointsUsed > 0
            ? `Χρησιμοποιήθηκαν ${pointsUsed} πόντοι. Υπόλοιπο: ${remainingPoints} πόντοι`
            : 'Η κράτηση ολοκληρώθηκε επιτυχώς',
        });

        // Update points balance
        setUserPoints(remainingPoints);

        setShowPointsDialog(false);
        onClose();
        navigate('/bookings');
      } else {
        throw new Error(result.message || 'Η κράτηση απέτυχε');
      }
    } catch (error: any) {
      console.error('Booking with points failed:', error);
      toast.error(error.message || 'Η κράτηση με πόντους απέτυχε');
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedCategory || !selectedGym) return;
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
      const userStr = localStorage.getItem('sweat93_user');
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
        const userDataResponse = await fetch(`${API.API_URL}/auth/me`, {
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
          localStorage.setItem('sweat93_user', JSON.stringify(user));
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
      let classesResponse = await API.apiRequest('/fitness-classes?status=active');
      let classesData: any[] = [];

      // If 403 or 404, fallback to old endpoint
      if (classesResponse.status === 403 || classesResponse.status === 404) {
        console.warn('fitness-classes endpoint not available, falling back to /classes');
        classesResponse = await API.apiRequest(API.API_ENDPOINTS.classes.list);

        if (!classesResponse.ok) {
          throw new Error('Failed to fetch class details from fallback endpoint');
        }

        const data = await classesResponse.json();
        classesData = Array.isArray(data) ? data : [];
      } else if (!classesResponse.ok) {
        throw new Error('Failed to fetch class details');
      } else {
        const result = await classesResponse.json();
        classesData = result.success && result.data ? result.data : [];
      }

      // Process all bookings
      let successCount = 0;
      let failCount = 0;
      let duplicateCount = 0;
      let lastErrorMessage = '';

      for (const slot of slotsToBook) {
        try {
          const selectedClassDetails = Array.isArray(classesData)
            ? classesData.find((classItem: any) => classItem.id.toString() === slot.id)
            : null;

          if (!selectedClassDetails) {
            console.warn(`Skipping slot ${slot.id} - class details not found`);
            failCount++;
            lastErrorMessage = 'Δεν βρέθηκαν λεπτομέρειες μαθήματος';
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
            notes: `Κράτηση μέσω wizard - ${selectedClassDetails.name} με ${selectedClassDetails.instructor_name || selectedClassDetails.trainer_name || selectedClassDetails.instructor}`
          };

          console.log('📤 Sending booking data:', { ...bookingData, class_details: selectedClassDetails });

          const response = await bookingService.create(bookingData);

          // Log the full response for debugging
          console.log('📋 Booking response for slot', slot.id, ':', response);
          console.log('📋 Booking data returned:', response.data);

          if (response.success) {
            successCount++;
            console.log('✅ Booking created successfully. Booking ID:', response.data?.id, 'Date:', response.data?.date, 'Time:', response.data?.time);
          } else {
            const errorMessage = response.message || '';
            if (errorMessage.toLowerCase().includes('duplicate') ||
                errorMessage.toLowerCase().includes('already') ||
                errorMessage.toLowerCase().includes('ήδη')) {
              duplicateCount++;
            } else {
              failCount++;
              lastErrorMessage = errorMessage;
              console.error('Booking failed for slot:', slot.id, errorMessage);
            }
          }
        } catch (slotError: any) {
          failCount++;
          lastErrorMessage = slotError.message || 'Σφάλμα κατά την κράτηση';
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
        // Use the actual error message from backend if available
        const errorMsg = lastErrorMessage || `Αποτυχία δημιουργίας κρατήσεων. Επιτυχείς: ${successCount}, Αποτυχίες: ${failCount}`;
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Booking failed:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        error
      });

      // Check if the error is due to class being full
      const errorMessage = error.message || 'Σφάλμα κατά την κράτηση';
      const isClassFull = errorMessage.toLowerCase().includes('πλήρ') ||
                         errorMessage.toLowerCase().includes('full') ||
                         errorMessage.toLowerCase().includes('δεν υπάρχουν διαθέσιμες θέσεις');

      if (isClassFull && selectedTimeSlot) {
        // Class is full - offer waitlist option
        // Get class details from the selected time slot
        const classDetails = classesData.find((c: any) => c.id.toString() === selectedTimeSlot.id);
        const className = classDetails?.name || 'Μάθημα';

        setWaitlistClassInfo({
          classId: parseInt(selectedTimeSlot.id, 10),
          className: className,
          classDate: selectedTimeSlot.date,
          classTime: selectedTimeSlot.time,
        });
        setShowWaitlistDialog(true);
        toast.warning('Το μάθημα είναι πλήρες', {
          description: 'Θέλετε να προστεθείτε στη λίστα αναμονής;',
        });
      } else {
        // Show general error message
        toast.error(`Κράτηση απέτυχε: ${errorMessage}`);
      }
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
                      <div className="flex items-start gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: category.color ? `${category.color}20` : '#f3f4f6'
                          }}
                        >
                          <Dumbbell
                            className="h-5 w-5"
                            style={{ color: category.color || '#6b7280' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{category.name}</h4>
                          {category.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                        {selectedCategory?.id === category.id && (
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
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
        const daysOfWeek = [
          { value: 1, label: 'Δευ', fullLabel: 'Δευτέρα' },
          { value: 2, label: 'Τρί', fullLabel: 'Τρίτη' },
          { value: 3, label: 'Τετ', fullLabel: 'Τετάρτη' },
          { value: 4, label: 'Πέμ', fullLabel: 'Πέμπτη' },
          { value: 5, label: 'Παρ', fullLabel: 'Παρασκευή' },
          { value: 6, label: 'Σάβ', fullLabel: 'Σάββατο' },
          { value: 0, label: 'Κυρ', fullLabel: 'Κυριακή' }
        ];

        // Helper function: Get Monday of a given date
        const getWeekStart = (date: Date): Date => {
          const d = new Date(date);
          const day = d.getDay();
          const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, else go to Monday
          d.setDate(d.getDate() + diff);
          d.setHours(0, 0, 0, 0);
          return d;
        };

        // Helper function: Get the dominant month in a week (month with most days)
        const getWeekDominantMonth = (weekDates: string[]): string => {
          const monthCounts: { [key: string]: number } = {};
          weekDates.forEach(date => {
            const month = date.substring(0, 7);
            monthCounts[month] = (monthCounts[month] || 0) + 1;
          });
          return Object.entries(monthCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
        };

        // Generate weeks (Mon-Sun) based on priority booking status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // Calculate max booking date based on priority
        const maxBookingDate = new Date(today);
        if (hasPriorityBooking) {
          // Priority users: 1 month ahead
          maxBookingDate.setMonth(maxBookingDate.getMonth() + 1);
        } else {
          // Regular users: 2 weeks ahead
          maxBookingDate.setDate(maxBookingDate.getDate() + 14);
        }
        const maxDateStr = maxBookingDate.toISOString().split('T')[0];

        // Get current week start (Monday of this week)
        const currentWeekStart = getWeekStart(today);

        // Generate all weeks starting from current week
        const allWeeks: string[][] = [];
        let weekStart = new Date(currentWeekStart);

        // Calculate number of weeks needed to reach maxBookingDate
        const weeksNeeded = Math.ceil((maxBookingDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 2;

        // Generate weeks up to max booking date
        for (let weekIdx = 0; weekIdx < weeksNeeded; weekIdx++) {
          const week: string[] = [];
          for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + dayIdx);
            const dateStr = date.toISOString().split('T')[0];
            // Only add dates up to maxDateStr
            if (dateStr <= maxDateStr) {
              week.push(dateStr);
            }
          }
          if (week.length > 0) {
            allWeeks.push(week);
          }
          weekStart.setDate(weekStart.getDate() + 7);
          // Stop if we've passed the max date
          if (weekStart > maxBookingDate) break;
        }

        // Initialize dateScrollIndex to current week (0) if not set
        const initializedScrollIndex = dateScrollIndex >= 0 ? dateScrollIndex : 0;

        // Get visible week
        const visibleDates = allWeeks[initializedScrollIndex] || allWeeks[0];

        // Calculate current month based on dominant month in visible week
        const calculatedMonth = getWeekDominantMonth(visibleDates);

        // Auto-update currentMonth if it differs from calculated
        if (currentMonth !== calculatedMonth) {
          setCurrentMonth(calculatedMonth);
        }

        // Initialize currentMonth if not set
        if (!currentMonth) {
          setCurrentMonth(calculatedMonth);
        }

        // Initialize selectedDate to today if not set
        if (!selectedDate) {
          setSelectedDate(todayStr);
        }

        // Filter time slots by selected date and exclude past times
        const filteredTimeSlots = selectedDate
          ? timeSlots.filter(slot => {
              if (slot.date !== selectedDate) return false;

              // Check if this time slot is in the past
              const slotDateTime = new Date(`${slot.date}T${slot.time}`);
              const now = new Date();

              // Only show future time slots
              return slotDateTime > now;
            })
          : [];

        // Navigation helpers
        const canScrollLeft = initializedScrollIndex > 0;
        const canScrollRight = initializedScrollIndex < allWeeks.length - 1;

        // Find which week index corresponds to the first week of current selected month
        const findFirstWeekOfMonth = (monthKey: string): number => {
          return allWeeks.findIndex(week => {
            const weekMonth = getWeekDominantMonth(week);
            return weekMonth === monthKey;
          });
        };

        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Επιλέξτε Ημερομηνία & Ώρα</h3>

            {/* Quick Select Buttons */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium">Επαναλαμβανόμενη Κράτηση</CardTitle>
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
              <>
                {/* Date Selection Carousel */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Επιλέξτε Ημερομηνία</Label>

                  {/* Month Header with Navigation */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // Get previous month key
                        const currentDate = new Date(currentMonth + '-01');
                        currentDate.setMonth(currentDate.getMonth() - 1);
                        const prevMonthKey = currentDate.toISOString().substring(0, 7);

                        // Check if previous month would go before today's month
                        const todayMonth = todayStr.substring(0, 7);
                        if (prevMonthKey < todayMonth) return;

                        // Find first week of previous month
                        const weekIndex = findFirstWeekOfMonth(prevMonthKey);
                        if (weekIndex >= 0) {
                          setDateScrollIndex(weekIndex);
                          // currentMonth will auto-update via the logic above
                        }
                      }}
                      disabled={initializedScrollIndex === 0 || currentMonth === todayStr.substring(0, 7)}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="text-lg font-semibold min-w-[150px] text-center">
                      {currentMonth && new Date(currentMonth + '-01').toLocaleDateString('el-GR', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // Get next month key
                        const currentDate = new Date(currentMonth + '-01');
                        currentDate.setMonth(currentDate.getMonth() + 1);
                        const nextMonthKey = currentDate.toISOString().substring(0, 7);

                        // Find first week of next month
                        const weekIndex = findFirstWeekOfMonth(nextMonthKey);
                        if (weekIndex >= 0 && weekIndex < allWeeks.length) {
                          setDateScrollIndex(weekIndex);
                          // currentMonth will auto-update via the logic above
                        }
                      }}
                      disabled={!canScrollRight}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Date Navigation and Buttons */}
                  <div className="flex items-center gap-[5px]">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDateScrollIndex(Math.max(0, initializedScrollIndex - 1))}
                      disabled={!canScrollLeft}
                      className="h-10 w-fit flex-shrink-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Date Buttons */}
                    <div className="grid grid-cols-7 gap-[5px] flex-1">
                      {visibleDates.map((date) => {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString('el-GR', { weekday: 'short' });
                        const dayNum = dateObj.getDate();
                        const isSelected = selectedDate === date;
                        const dateMonth = date.substring(0, 7); // YYYY-MM
                        const isCurrentMonth = dateMonth === currentMonth;
                        const isPastDate = date < todayStr;
                        const isBeyondLimit = date > maxDateStr;

                        // Calculate if this is a priority-only date (after 2 weeks but within 1 month)
                        const regularUserMaxDate = new Date(today);
                        regularUserMaxDate.setDate(regularUserMaxDate.getDate() + 14);
                        const regularMaxStr = regularUserMaxDate.toISOString().split('T')[0];
                        const isPriorityOnlyDate = hasPriorityBooking && date > regularMaxStr && date <= maxDateStr;

                        return (
                          <button
                            key={date}
                            onClick={() => !isPastDate && !isBeyondLimit && setSelectedDate(date)}
                            disabled={isPastDate || isBeyondLimit}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : isPastDate || isBeyondLimit
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isPriorityOnlyDate
                                ? 'border-purple-300 hover:border-purple-400 shadow-[0_0_8px_rgba(147,51,234,0.3)] hover:shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                                : 'border-border hover:border-primary/50'
                            } ${!isCurrentMonth && !isPastDate && !isBeyondLimit ? 'opacity-40' : ''}`}
                          >
                            <span className="text-xs font-medium">{dayName}</span>
                            <span className="text-2xl font-bold">{dayNum}</span>
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDateScrollIndex(initializedScrollIndex + 1)}
                      disabled={!canScrollRight}
                      className="h-10 w-fit flex-shrink-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Time Slots for Selected Date */}
                {selectedDate && !bulkBookingMode && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Διαθέσιμες Ώρες - {new Date(selectedDate).toLocaleDateString('el-GR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </Label>

                    {filteredTimeSlots.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Δεν υπάρχουν διαθέσιμες ώρες για αυτή την ημερομηνία
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                        {filteredTimeSlots.map((slot) => {
                          const isSelected = selectedTimeSlot?.id === slot.id;

                          return (
                            <button
                              key={slot.id}
                              onClick={() => {
                                if (!slot.isAlreadyBooked) {
                                  setSelectedTimeSlot(slot);
                                }
                              }}
                              disabled={slot.isAlreadyBooked}
                              className={`flex flex-col items-start justify-center p-3 rounded-lg border-2 transition-all ${
                                slot.isAlreadyBooked
                                  ? 'opacity-50 cursor-not-allowed border-muted bg-muted/30'
                                  : isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {slot.className && (
                                <div className="text-sm font-medium mb-1 w-full text-left">
                                  {slot.className}
                                </div>
                              )}
                              {slot.instructor && (
                                <div className="text-xs text-muted-foreground mb-2 w-full text-left">
                                  με {slot.instructor}
                                </div>
                              )}
                              <div className="flex items-center gap-2 w-full">
                                <Clock className="h-4 w-4" />
                                <span className={`font-semibold ${slot.isAlreadyBooked ? 'line-through' : ''}`}>
                                  {slot.time}
                                </span>
                              </div>
                              {slot.isAlreadyBooked ? (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  Κρατημένο
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {slot.available_spots} θέσεις
                                </span>
                              )}
                              {isSelected && !slot.isAlreadyBooked && (
                                <CheckCircle className="h-4 w-4 text-primary mt-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Loyalty Points Option */}
                    {selectedTimeSlot && !selectedTimeSlot.isAlreadyBooked && (
                      <Card className="bg-purple-50 border-purple-200 mt-4">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Coins className="h-5 w-5 text-purple-600" />
                              <Label className="text-base font-semibold text-purple-900">
                                Χρήση Πόντων Loyalty
                              </Label>
                            </div>
                            <Badge className="bg-purple-600 hover:bg-purple-700">
                              <Coins className="h-3 w-3 mr-1" />
                              {userPoints} διαθέσιμοι
                            </Badge>
                          </div>

                          {userPoints > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm text-purple-700">
                                Έχετε {userPoints} πόντους διαθέσιμους. Χρησιμοποιήστε τους για να εξοικονομήσετε χρήματα!
                              </p>
                              <Button
                                variant="outline"
                                onClick={() => setShowPointsDialog(true)}
                                className="w-full border-purple-300 hover:bg-purple-100"
                                disabled={bookingInProgress}
                              >
                                <Coins className="h-4 w-4 mr-2" />
                                Κράτηση με Πόντους
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Δεν έχετε διαθέσιμους πόντους αυτή τη στιγμή.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
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
        <div className="flex-1 overflow-y-auto px-2 pt-6">
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
        <div className="sticky bottom-0 flex justify-between px-2 py-4 border-t bg-white">
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

      {/* Book with Points Dialog */}
      <BookWithPointsDialog
        isOpen={showPointsDialog}
        onClose={() => setShowPointsDialog(false)}
        onConfirm={handleBookWithPoints}
        classInfo={{
          id: selectedTimeSlot ? parseInt(selectedTimeSlot.id) : 0,
          name: selectedTimeSlot?.className || '',
          price: 15, // Default price - should come from class data
        }}
        userPoints={userPoints}
      />

      {/* Join Waitlist Dialog */}
      {waitlistClassInfo && (
        <JoinWaitlistDialog
          open={showWaitlistDialog}
          onOpenChange={setShowWaitlistDialog}
          classId={waitlistClassInfo.classId}
          className={waitlistClassInfo.className}
          classDate={waitlistClassInfo.classDate}
          classTime={waitlistClassInfo.classTime}
          onJoined={() => {
            setShowWaitlistDialog(false);
            onClose();
          }}
        />
      )}
    </Dialog>
  );
};
