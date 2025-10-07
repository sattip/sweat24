import * as API from '@/config/api';

export interface ReferralUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ReferralSearchResponse {
  user: ReferralUser | null;
}

export interface ReferralAnalytics {
  total_referrals: number;
  total_points: number;
  referred_users: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    created_at: string;
  }>;
}

export interface ReferralValidationResponse {
  is_valid: boolean;
  message: string;
  referrer_id?: number;
  referrer_name?: string;
  referrer_phone?: string;
}

class ReferralService {
  /**
   * Αναζήτηση χρήστη με βάση το τηλέφωνο για referral
   */
  async searchByPhone(phone: string): Promise<ReferralSearchResponse> {
    try {
      if (!phone || phone.length < 10) {
        return { user: null };
      }

      const response = await API.apiRequest(`/users/search-by-phone?phone=${encodeURIComponent(phone)}`);
      
      if (!response.ok) {
        console.error('Failed to search user by phone:', response.status);
        return { user: null };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching user by phone:', error);
      return { user: null };
    }
  }

  /**
   * Validation referral με βάση όνομα ή τηλέφωνο
   * Χρησιμοποιείται στο signup για να βρει τον referrer
   */
  async validateReferral(input: string): Promise<ReferralValidationResponse> {
    try {
      if (!input || input.trim().length < 3) {
        return {
          is_valid: false,
          message: 'Παρακαλώ εισάγετε τουλάχιστον 3 χαρακτήρες'
        };
      }

      // Αν μοιάζει με τηλέφωνο, ψάχνουμε με phone search
      if (this.isValidPhone(input)) {
        const result = await this.searchByPhone(input);
        if (result.user) {
          return {
            is_valid: true,
            message: `Βρέθηκε: ${result.user.name}`,
            referrer_id: result.user.id,
            referrer_name: result.user.name,
            referrer_phone: result.user.phone
          };
        } else {
          return {
            is_valid: false,
            message: 'Δεν βρέθηκε χρήστης με αυτό το τηλέφωνο'
          };
        }
      }

      // Αν δεν είναι τηλέφωνο, ψάχνουμε με όνομα (TODO: implement name search)
      // Για τώρα επιστρέφουμε false για μη-τηλέφωνα
      return {
        is_valid: false,
        message: 'Παρακαλώ εισάγετε το κινητό τηλέφωνο του φίλου που σας σύστησε (π.χ. 6912345678)'
      };

    } catch (error) {
      console.error('Error validating referral:', error);
      return {
        is_valid: false,
        message: 'Σφάλμα κατά την επικύρωση'
      };
    }
  }

  /**
   * Λήψη analytics referrals για χρήστη
   */
  async getUserReferrals(userId: number): Promise<ReferralAnalytics> {
    try {
      const response = await API.apiRequest(`/users/${userId}/referrals`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch referral analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching referral analytics:', error);
      throw error;
    }
  }

  /**
   * Καθαρισμός τηλεφώνου (αφαίρεση κενών, παύλων κλπ)
   */
  normalizePhone(phone: string): string {
    return phone.replace(/[\s\-\(\)]/g, '');
  }

  /**
   * Validation τηλεφώνου
   */
  isValidPhone(phone: string): boolean {
    const normalized = this.normalizePhone(phone);
    // Ελληνικά κινητά: 69xxxxxxxx (10 ψηφία)
    return /^69\d{8}$/.test(normalized);
  }

  /**
   * Format τηλεφώνου για εμφάνιση
   */
  formatPhone(phone: string): string {
    const normalized = this.normalizePhone(phone);
    if (normalized.length === 10) {
      return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`;
    }
    return phone;
  }
}

export const referralService = new ReferralService();