import { apiService } from '../../services/apiService';

export interface ReferralTier {
  id: number;
  referrals_required: number;
  name: string;
  description: string;
  reward_type: 'points' | 'discount' | 'free_session' | 'product' | 'other';
  reward_value: string;
  is_active: boolean;
  duration_type?: string;
  duration_days?: number;
  sort_order?: number;
  achieved_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const referralTiersApi = {
  getTiers: () => apiService.get('/api/v1/admin/referral-reward-tiers'),
  
  createTier: (data: Omit<ReferralTier, 'id' | 'created_at' | 'updated_at'>) => 
    apiService.post('/api/v1/admin/referral-reward-tiers', data),
  
  updateTier: (id: number, data: Partial<ReferralTier>) => 
    apiService.put(`/api/v1/admin/referral-reward-tiers/${id}`, data),
  
  deleteTier: (id: number) => 
    apiService.delete(`/api/v1/admin/referral-reward-tiers/${id}`),
  
  toggleStatus: (id: number) => 
    apiService.post(`/api/v1/admin/referral-reward-tiers/${id}/toggle-status`)
}; 