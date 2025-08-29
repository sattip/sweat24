import * as API from '@/config/api';
import { SignupData } from '@/components/SignupSteps';

export interface MedicalHistoryPayload {
  medical_conditions: { [key: string]: { has_condition: boolean; year_of_onset?: string | null; details?: string | null } };
  current_health_problems: { has_problems: boolean; details?: string };
  prescribed_medications: Array<{ medication: string; reason: string }>;
  smoking: { 
    currently_smoking: boolean; 
    daily_cigarettes?: string | null; 
    ever_smoked?: boolean; 
    smoking_years?: string | null; 
    quit_years_ago?: string | null; 
  };
  physical_activity: { description: string; frequency: string; duration: string };
  emergency_contact: { name: string; phone: string };
  ems_interest: boolean;
  ems_contraindications?: { [key: string]: { has_condition: boolean; year_of_onset?: string | null } };
  ems_liability_accepted?: boolean; // now required for all users per backend contract

  submitted_at: string;
}

export interface MedicalHistoryResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    submitted_at: string;
    has_ems_contraindications: boolean;
    active_conditions_count: number;
  };
}

class MedicalHistoryService {
  /**
   * Μετατρέπει τα δεδομένα από το SignupData interface στο format που περιμένει το API
   */
  private transformSignupDataToPayload(signupData: Partial<SignupData>): MedicalHistoryPayload {
    // Μετατροπή medical conditions από camelCase σε snake_case
    const transformedConditions: { [key: string]: { has_condition: boolean; year_of_onset?: string | null; details?: string | null } } = {};
    if (signupData.medicalConditions) {
      Object.entries(signupData.medicalConditions).forEach(([condition, data]) => {
        transformedConditions[condition] = {
          has_condition: data.hasCondition,
          year_of_onset: data.yearOfOnset || null,
          details: data.details || null
        };
      });
    }

    // Μετατροπή EMS contraindications από camelCase σε snake_case
    const transformedEmsContraindications: { [key: string]: { has_condition: boolean; year_of_onset?: string | null } } = {};
    if (signupData.emsInterest && signupData.emsContraindications) {
      Object.entries(signupData.emsContraindications).forEach(([condition, data]) => {
        transformedEmsContraindications[condition] = {
          has_condition: data.hasCondition,
          year_of_onset: data.yearOfOnset || null
        };
      });
    }

    return {
      medical_conditions: transformedConditions,
      current_health_problems: {
        has_problems: signupData.currentHealthProblems?.hasProblems || false,
        details: signupData.currentHealthProblems?.details || ''
      },
      prescribed_medications: signupData.prescribedMedications || [],
      smoking: {
        currently_smoking: signupData.smoking?.currentlySmoking || false,
        daily_cigarettes: signupData.smoking?.dailyCigarettes || null,
        ever_smoked: signupData.smoking?.everSmoked || false,
        smoking_years: signupData.smoking?.smokingYears || null,
        quit_years_ago: signupData.smoking?.quitYearsAgo || null
      },
      physical_activity: signupData.physicalActivity || { description: '', frequency: '', duration: '' },
      emergency_contact: {
        name: signupData.emergencyContactName || '',
        phone: signupData.emergencyContactPhone || ''
      },
      ems_interest: signupData.emsInterest || false,
      ems_contraindications: signupData.emsInterest ? transformedEmsContraindications : undefined,
      ems_liability_accepted: signupData.emsLiabilityAccepted || false,

      submitted_at: new Date().toISOString()
    };
  }

  /**
   * Υποβάλλει το ιατρικό ιστορικό στο backend
   */
  async submitMedicalHistory(signupData: Partial<SignupData>): Promise<MedicalHistoryResponse> {
    try {
      const payload = this.transformSignupDataToPayload(signupData);
      
      const response = await API.apiRequest(API.API_ENDPOINTS.medicalHistory.submit, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Αποτυχία υποβολής ιατρικού ιστορικού');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting medical history:', error);
      throw error;
    }
  }

  /**
   * Ανακτά το ιατρικό ιστορικό του χρήστη
   */
  async getMedicalHistory(): Promise<any> {
    try {
      const response = await API.apiRequest(API.API_ENDPOINTS.medicalHistory.get, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Αποτυχία ανάκτησης ιατρικού ιστορικού');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching medical history:', error);
      throw error;
    }
  }
}

export default new MedicalHistoryService(); 