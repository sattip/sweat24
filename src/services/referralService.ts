import { apiRequest, API_ENDPOINTS } from '@/config/api';

export interface ReferralValidationRequest {
  code_or_name: string;
}

export interface ReferralValidationResponse {
  is_valid: boolean;
  referrer_id?: number;
  referrer_name?: string;
  message: string;
}

export interface HowFoundUsRequest {
  how_found_us: string;
  referral_code_or_name?: string;
  referrer_id?: number;
  social_platform?: string;
}

export interface HowFoundUsResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    how_found_us: string;
    referrer_id?: number;
    social_platform?: string;
  };
}

class ReferralService {
  /**
   * Επικυρώνει έναν κωδικό ή όνομα referrer
   * Η επικύρωση γίνεται στο backend για λόγους ασφάλειας
   */
  async validateReferral(codeOrName: string): Promise<ReferralValidationResponse> {
    try {
      const response = await apiRequest(API_ENDPOINTS.referrals.validate, {
        method: 'POST',
        body: JSON.stringify({
          code_or_name: codeOrName.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Αποτυχία επικύρωσης referral');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating referral:', error);
      throw error;
    }
  }

  /**
   * Αποθηκεύει τα δεδομένα "Πώς μας βρήκατε;" στο backend
   */
  async saveHowFoundUs(howFoundUsData: HowFoundUsRequest): Promise<HowFoundUsResponse> {
    try {
      const response = await apiRequest(API_ENDPOINTS.user.howFoundUs, {
        method: 'POST',
        body: JSON.stringify(howFoundUsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Αποτυχία αποθήκευσης δεδομένων');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving how found us data:', error);
      throw error;
    }
  }
}

export const referralService = new ReferralService();