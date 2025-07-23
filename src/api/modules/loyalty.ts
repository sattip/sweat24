import { apiRequest } from '../../config/api';

export interface LoyaltyReward {
  id: number;
  name: string;
  description: string;
  points_cost: number; // Αλλάζω από points_required σε points_cost
  type: string; // Νέο πεδίο που περιμένει η βάση
  is_active: boolean;
  duration_type?: string;
  duration_days?: number;
  redemptions_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LoyaltyRedemption {
  id: number;
  user_id: number;
  loyalty_reward_id: number;
  points_used: number;
  status: 'pending' | 'completed' | 'cancelled';
  redeemed_at: string;
  user?: {
    name: string;
    email: string;
  };
  loyaltyReward?: LoyaltyReward;
}

export const loyaltyApi = {
  // Loyalty Rewards CRUD - ΧΡΗΣΙΜΟΠΟΙΩ ΤΑ ΣΩΣΤΑ ENDPOINTS ΠΟΥ ΥΠΑΡΧΟΥΝ!
  getRewards: async (): Promise<LoyaltyReward[]> => {
    return apiRequest('/api/v1/admin/loyalty-rewards');
  },

  createReward: async (data: Partial<LoyaltyReward>): Promise<LoyaltyReward> => {
    return apiRequest('/api/v1/admin/loyalty-rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReward: async (id: number, data: Partial<LoyaltyReward>): Promise<LoyaltyReward> => {
    return apiRequest(`/api/v1/admin/loyalty-rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteReward: async (id: number): Promise<void> => {
    return apiRequest(`/api/v1/admin/loyalty-rewards/${id}`, {
      method: 'DELETE',
    });
  },

  // Loyalty Redemptions History - ΘΑ ΧΡΗΣΙΜΟΠΟΙΗΣΩ ΤΑ STATISTICS ENDPOINTS
  getRedemptions: async (): Promise<LoyaltyRedemption[]> => {
    return apiRequest('/api/v1/admin/statistics/loyalty-redemptions');
  },
}; 