import { apiService } from './api';

export interface Service {
  name: string;
  description: string;
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  services: Service[];
  // Additional fields from Laravel backend
  email?: string;
  phone?: string;
  experience_years?: number;
  hourly_rate?: number;
  commission_rate?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TrainerFilters {
  specialty?: string;
  experience_min?: number;
  available?: boolean;
}

class TrainersService {
  async getAllTrainers(filters?: TrainerFilters): Promise<Trainer[]> {
    const params: Record<string, string> = {};
    
    if (filters?.specialty) {
      params.specialty = filters.specialty;
    }
    if (filters?.experience_min) {
      params.experience_min = filters.experience_min.toString();
    }
    if (filters?.available !== undefined) {
      params.available = filters.available.toString();
    }

    return apiService.get<Trainer[]>('/instructors', params);
  }

  async getTrainerById(id: string): Promise<Trainer> {
    return apiService.get<Trainer>(`/instructors/${id}`);
  }

  async getTrainerServices(trainerId: string): Promise<Service[]> {
    const trainer = await this.getTrainerById(trainerId);
    return trainer.services || [];
  }

  async bookTrainerService(trainerId: string, serviceData: {
    service_name: string;
    preferred_date: string;
    preferred_time: string;
    notes?: string;
  }): Promise<any> {
    return apiService.post('/bookings', {
      instructor_id: trainerId,
      class_name: serviceData.service_name,
      booking_date: serviceData.preferred_date,
      booking_time: serviceData.preferred_time,
      notes: serviceData.notes,
      status: 'confirmed'
    });
  }
}

export const trainersService = new TrainersService();
export default trainersService;