import { apiRequest } from '../../config/api';

export interface ReferralCode {
  id: number;
  code: string;
  user_id: number;
  referred_users_count: number;
  points_earned: number;
  user?: {
    name: string;
    email: string;
  };
}

export interface ReferralReward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  is_active: boolean;
  redemptions_count?: number;
}

export interface Referral {
  id: number;
  referral_code_id: number;
  referred_user_id: number;
  points_awarded: number;
  status: string;
  created_at: string;
  referralCode?: ReferralCode;
  referredUser?: {
    name: string;
    email: string;
  };
}

export const referralApi = {
  // Referral codes
  getCodes: async (): Promise<ReferralCode[]> => {
    return apiRequest('/admin/referral-codes');
  },

  createCode: async (data: Partial<ReferralCode>): Promise<ReferralCode> => {
    return apiRequest('/admin/referral-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCode: async (id: number, data: Partial<ReferralCode>): Promise<ReferralCode> => {
    return apiRequest(`/admin/referral-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCode: async (id: number): Promise<void> => {
    return apiRequest(`/admin/referral-codes/${id}`, {
      method: 'DELETE',
    });
  },

  // Rewards
  getRewards: async (): Promise<ReferralReward[]> => {
    return apiRequest('/admin/referral-rewards');
  },

  createReward: async (data: Partial<ReferralReward>): Promise<ReferralReward> => {
    return apiRequest('/admin/referral-rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReward: async (id: number, data: Partial<ReferralReward>): Promise<ReferralReward> => {
    return apiRequest(`/admin/referral-rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteReward: async (id: number): Promise<void> => {
    return apiRequest(`/admin/referral-rewards/${id}`, {
      method: 'DELETE',
    });
  },

  // Referrals history
  getReferrals: async (): Promise<Referral[]> => {
    return apiRequest('/admin/referrals');
  },
};