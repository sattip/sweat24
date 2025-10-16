import { API_URL } from '@/config/api';

const API_BASE_URL = API_URL;

export interface BodyMeasurement {
  id: number;
  date: string; // YYYY-MM-DD format
  weight?: string;
  height?: string;
  waist?: string;
  hips?: string;
  chest?: string;
  arm?: string;
  thigh?: string;
  bodyFat?: string;
  notes?: string;
  bmi?: string; // Calculated by backend
}

export interface MeasurementComparison {
  latest: BodyMeasurement | null;
  previous: BodyMeasurement | null;
}

export interface CreateMeasurementRequest {
  date: string; // Required - YYYY-MM-DD
  weight?: string;
  height?: string;
  waist?: string;
  hips?: string;
  chest?: string;
  arm?: string;
  thigh?: string;
  bodyFat?: string;
  notes?: string;
}

export interface ValidationError {
  message: string;
  errors: {
    [field: string]: string[];
  };
}

class BodyMeasurementService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async getMeasurements(): Promise<BodyMeasurement[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/measurements`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch measurements');
      }

      const data = await response.json();
      return data; // Backend returns array directly, sorted descending
    } catch (error) {
      console.error('Error fetching measurements:', error);
      throw error;
    }
  }

  async getMeasurement(id: number): Promise<BodyMeasurement> {
    try {
      const response = await fetch(`${API_BASE_URL}/measurements/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Measurement not found');
        }
        throw new Error('Failed to fetch measurement');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching measurement:', error);
      throw error;
    }
  }

  async createMeasurement(measurement: CreateMeasurementRequest): Promise<BodyMeasurement> {
    try {
      const response = await fetch(`${API_BASE_URL}/measurements`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(measurement),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors
        if (response.status === 422) {
          const error = new Error(errorData.message) as Error & { validationErrors?: any };
          error.validationErrors = errorData.errors;
          throw error;
        }
        
        throw new Error(errorData.message || 'Failed to create measurement');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating measurement:', error);
      throw error;
    }
  }

  async updateMeasurement(id: number, measurement: CreateMeasurementRequest): Promise<BodyMeasurement> {
    try {
      const response = await fetch(`${API_BASE_URL}/measurements/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(measurement),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors
        if (response.status === 422) {
          const error = new Error(errorData.message) as Error & { validationErrors?: any };
          error.validationErrors = errorData.errors;
          throw error;
        }
        
        if (response.status === 404) {
          throw new Error(errorData.message || 'Measurement not found');
        }
        
        throw new Error(errorData.message || 'Failed to update measurement');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating measurement:', error);
      throw error;
    }
  }

  async deleteMeasurement(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/measurements/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 404) {
          throw new Error(errorData.message || 'Measurement not found');
        }
        
        throw new Error(errorData.message || 'Failed to delete measurement');
      }

      // Backend returns success message, but we don't need it
      await response.json();
    } catch (error) {
      console.error('Error deleting measurement:', error);
      throw error;
    }
  }

  async getLatestMeasurement(): Promise<BodyMeasurement | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/measurements/latest`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No measurements found
        }
        throw new Error('Failed to fetch latest measurement');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching latest measurement:', error);
      throw error;
    }
  }

  async getComparison(): Promise<MeasurementComparison> {
    try {
      const response = await fetch(`${API_BASE_URL}/measurements/comparison`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch measurements comparison');
      }

      const data = await response.json();
      return data; // { latest: {...}, previous: {...} }
    } catch (error) {
      console.error('Error fetching measurements comparison:', error);
      throw error;
    }
  }

  // Validation helpers
  validateMeasurement(measurement: CreateMeasurementRequest): string[] {
    const errors: string[] = [];
    
    // Required field
    if (!measurement.date) {
      errors.push('Η ημερομηνία είναι υποχρεωτική');
    }
    
    // Optional field validations
    if (measurement.weight) {
      const weight = parseFloat(measurement.weight);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        errors.push('Το βάρος πρέπει να είναι μεταξύ 30-300 kg');
      }
    }
    
    if (measurement.height) {
      const height = parseFloat(measurement.height);
      if (isNaN(height) || height < 100 || height > 250) {
        errors.push('Το ύψος πρέπει να είναι μεταξύ 100-250 cm');
      }
    }
    
    if (measurement.waist) {
      const waist = parseFloat(measurement.waist);
      if (isNaN(waist) || waist < 50 || waist > 200) {
        errors.push('Η μέση πρέπει να είναι μεταξύ 50-200 cm');
      }
    }
    
    if (measurement.hips) {
      const hips = parseFloat(measurement.hips);
      if (isNaN(hips) || hips < 60 || hips > 200) {
        errors.push('Οι γοφοί πρέπει να είναι μεταξύ 60-200 cm');
      }
    }
    
    if (measurement.chest) {
      const chest = parseFloat(measurement.chest);
      if (isNaN(chest) || chest < 60 || chest > 200) {
        errors.push('Το στήθος πρέπει να είναι μεταξύ 60-200 cm');
      }
    }
    
    if (measurement.arm) {
      const arm = parseFloat(measurement.arm);
      if (isNaN(arm) || arm < 20 || arm > 60) {
        errors.push('Το μπράτσο πρέπει να είναι μεταξύ 20-60 cm');
      }
    }
    
    if (measurement.thigh) {
      const thigh = parseFloat(measurement.thigh);
      if (isNaN(thigh) || thigh < 30 || thigh > 100) {
        errors.push('Ο μηρός πρέπει να είναι μεταξύ 30-100 cm');
      }
    }
    
    if (measurement.bodyFat) {
      const bodyFat = parseFloat(measurement.bodyFat);
      if (isNaN(bodyFat) || bodyFat < 3 || bodyFat > 50) {
        errors.push('Το ποσοστό λίπους πρέπει να είναι μεταξύ 3-50%');
      }
    }
    
    if (measurement.notes && measurement.notes.length > 500) {
      errors.push('Οι σημειώσεις δεν πρέπει να ξεπερνούν τους 500 χαρακτήρες');
    }
    
    return errors;
  }

  // Helper to format date for API (YYYY-MM-DD)
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper to parse API date (YYYY-MM-DD) to Date object
  parseDateFromAPI(dateString: string): Date {
    if (!dateString) {
      // Empty date string, use current date
      return new Date();
    }
    
    // Try parsing the date string
    try {
      // If it's already a valid date format
      const date = new Date(dateString + 'T00:00:00');
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Invalid date, use current date
        return new Date();
      }
      
      return date;
    } catch (error) {
      // Error parsing date, use current date
      return new Date();
    }
  }
}

export const bodyMeasurementService = new BodyMeasurementService();