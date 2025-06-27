import { apiService } from './api';

export interface GymClass {
  id: number;
  name: string;
  description?: string;
  instructor_id: number;
  instructor_name?: string;
  capacity: number;
  duration: number; // in minutes
  price: number;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  current_bookings?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  class_id: number;
  class_name: string;
  instructor_name?: string;
  booking_date: string;
  booking_time: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  checked_in: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingRequest {
  class_id: number;
  notes?: string;
}

export interface ClassFilters {
  date?: string;
  instructor_id?: number;
  status?: string;
}

class ClassesService {
  async getAllClasses(filters?: ClassFilters): Promise<GymClass[]> {
    const params: Record<string, string> = {};
    
    if (filters?.date) {
      params.date = filters.date;
    }
    if (filters?.instructor_id) {
      params.instructor_id = filters.instructor_id.toString();
    }
    if (filters?.status) {
      params.status = filters.status;
    }

    return apiService.get<GymClass[]>('/classes', params);
  }

  async getClassById(id: number): Promise<GymClass> {
    return apiService.get<GymClass>(`/classes/${id}`);
  }

  async getUpcomingClasses(): Promise<GymClass[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAllClasses({ date: today, status: 'scheduled' });
  }

  async getUserBookings(): Promise<Booking[]> {
    return apiService.get<Booking[]>('/bookings');
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    return apiService.post<Booking>('/bookings', bookingData);
  }

  async cancelBooking(bookingId: number): Promise<void> {
    return apiService.put(`/bookings/${bookingId}`, { status: 'cancelled' });
  }

  async checkInToClass(bookingId: number): Promise<Booking> {
    return apiService.post<Booking>(`/bookings/${bookingId}/check-in`);
  }

  async getBookingHistory(): Promise<Booking[]> {
    return apiService.get<Booking[]>('/bookings?status=completed');
  }
}

export const classesService = new ClassesService();
export default classesService;