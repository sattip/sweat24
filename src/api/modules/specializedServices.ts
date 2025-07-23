import { apiRequest } from '../../config/api';

export interface SpecializedService {
  id: number;
  name: string;
  slug: string;
  description: string;
  duration: string;
  price: string;
  icon: string;
  preferred_time_slots: string[];
}

export interface AppointmentRequest {
  id: number;
  client_name?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  email?: string;
  phone?: string;
  service_type?: 'ems' | 'personal';
  preferred_dates?: string[];
  preferred_times?: string[];
  preferred_time_slot?: string;
  preferred_time_slots?: string[] | string;
  message?: string;
  notes?: string;
  admin_notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  rejection_reason?: string;
  confirmed_date?: string;
  confirmed_time?: string;
  instructor_id?: number;
  created_at: string;
  updated_at?: string;
  service?: SpecializedService;
}

export interface ConfirmRequestData {
  confirmed_date: string;
  confirmed_time: string;
  instructor_id?: number;
  admin_notes?: string;
}

export interface RejectRequestData {
  rejection_reason: string;
  admin_notes?: string;
}

export interface CompleteRequestData {
  admin_notes?: string;
}

export interface BookingRequestFilters {
  status?: string;
  service_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export const specializedServicesApi = {
  getAll: async (): Promise<SpecializedService[]> => {
    return apiRequest('/admin/specialized-services');
  },

  create: async (data: Partial<SpecializedService>): Promise<SpecializedService> => {
    return apiRequest('/specialized-services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<SpecializedService>): Promise<SpecializedService> => {
    return apiRequest(`/specialized-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest(`/specialized-services/${id}`, {
      method: 'DELETE',
    });
  },
};

export const appointmentRequestsApi = {
  getAll: async (filters?: BookingRequestFilters): Promise<AppointmentRequest[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.service_type) queryParams.append('service_type', filters.service_type);
    if (filters?.date_from) queryParams.append('date_from', filters.date_from);
    if (filters?.date_to) queryParams.append('date_to', filters.date_to);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/api/v1/admin/booking-requests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: number): Promise<AppointmentRequest> => {
    return apiRequest(`/api/v1/admin/booking-requests/${id}`);
  },

  confirm: async (id: number, data: ConfirmRequestData): Promise<AppointmentRequest> => {
    return apiRequest(`/api/v1/admin/booking-requests/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  reject: async (id: number, data: RejectRequestData): Promise<AppointmentRequest> => {
    return apiRequest(`/api/v1/admin/booking-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  complete: async (id: number, data?: CompleteRequestData): Promise<AppointmentRequest> => {
    return apiRequest(`/api/v1/admin/booking-requests/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  updateStatus: async (id: number, status: string): Promise<AppointmentRequest> => {
    return apiRequest(`/appointment-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest(`/appointment-requests/${id}`, {
      method: 'DELETE',
    });
  },
};