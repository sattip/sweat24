import * as API from '@/config/api';

export interface AgeVerificationRequest {
  birth_date: string;
}

export interface AgeVerificationResponse {
  is_minor: boolean;
  age: number;
  server_date: string;
}

class AgeVerificationService {
  /**
   * Ελέγχει αν ο χρήστης είναι ανήλικος βάσει της ημερομηνίας γέννησης
   * Ο έλεγχος γίνεται στο backend για λόγους ασφάλειας και νομικής εγκυρότητας
   */
  async checkAge(birthDate: string): Promise<AgeVerificationResponse> {
    try {
      const response = await API.apiRequest(API.API_ENDPOINTS.auth.checkAge, {
        method: 'POST',
        body: JSON.stringify({
          birth_date: birthDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Αποτυχία ελέγχου ηλικίας');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking age:', error);
      throw error;
    }
  }
}

export const ageVerificationService = new AgeVerificationService();