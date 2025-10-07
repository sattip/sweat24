import { apiRequest } from '../../config/api';

export interface UserPoints {
  user_id: number;
  points_balance: number;
}

export interface PointsHistoryItem {
  id: number;
  amount: number;
  type: 'earned' | 'spent';
  source: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export interface Reward {
  id: number;
  name: string;
  description?: string;
  points_cost: number;
  reward_type: 'gift_card' | 'free_session' | 'product' | 'discount' | 'premium' | 'merchandise';
  reward_value: string;
  is_active: boolean;
  image_url?: string;
}

export interface RedemptionResult {
  redemption_id: number;
  reward_code: string;
  points_spent: number;
  reward_name: string;
  instructions: string;
  expires_at: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  message: string;
}

export interface UserRedemption {
  id: number;
  reward_code: string;
  reward_name: string;
  points_spent: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  instructions: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
  reward: {
    name: string;
    reward_type: string;
    reward_value: string;
  };
}

export interface PointsStats {
  current_balance: number;
  total_earned: number;
  total_spent: number;
  lifetime_rank?: string;
  total_redemptions: number;
  active_redemptions: number;
  available_rewards_count: number;
}

// API Functions
export const pointsApi = {
  // Λήψη πόντων χρήστη
  async getUserPoints(userId: number): Promise<UserPoints> {
    const response = await apiRequest(`/points/user?user_id=${userId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch user points');
    }
    
    return data.data;
  },

  // Λήψη ιστορικού πόντων
  async getPointsHistory(userId: number, filter?: 'earned' | 'spent'): Promise<PointsHistoryItem[]> {
    let url = `/points/history?user_id=${userId}&limit=100`;
    if (filter) {
      // Note: The backend doesn't seem to support type filtering via API,
      // so we'll filter on the frontend side
    }
    
    const response = await apiRequest(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch points history');
    }
    
    let history = data.data;
    
    // Filter on frontend if needed
    if (filter) {
      history = history.filter((item: PointsHistoryItem) => item.type === filter);
    }
    
    return history;
  },

  // Λήψη διαθέσιμων ανταμοιβών (affordable for user)
  async getAffordableRewards(userPoints: number, userId?: number): Promise<Reward[]> {
    // Use the affordable endpoint with user_id
    if (!userId) {
      throw new Error('User ID is required for affordable rewards');
    }
    
    const response = await apiRequest(`/points/rewards/affordable?user_id=${userId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch affordable rewards');
    }
    
    return data.data;
  },

  // Λήψη όλων των ανταμοιβών
  async getAllRewards(): Promise<Reward[]> {
    const response = await apiRequest('/points/rewards');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch all rewards');
    }
    
    return data.data;
  },

  // Εξαργύρωση ανταμοιβής
  async redeemReward(rewardId: number, userId: number): Promise<RedemptionResult> {
    const response = await apiRequest(`/points/rewards/${rewardId}/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      // Handle specific error cases
      if (data.error_code === 'INSUFFICIENT_POINTS') {
        throw new Error(`Δεν έχετε αρκετούς πόντους. Χρειάζεστε ${data.required_points} πόντους.`);
      } else if (data.error_code === 'REWARD_UNAVAILABLE') {
        throw new Error('Η ανταμοιβή δεν είναι διαθέσιμη αυτή τη στιγμή.');
      }
      throw new Error(data.message || 'Failed to redeem reward');
    }
    
    return {
      redemption_id: data.data.redemption_id,
      reward_code: data.data.reward_code,
      points_spent: data.data.points_spent,
      reward_name: data.data.reward_name,
      instructions: data.data.instructions,
      expires_at: data.data.expires_at,
      status: data.data.status,
      message: data.message
    };
  },

  // Λήψη στατιστικών χρήστη από το backend
  async getPointsStats(userId: number): Promise<PointsStats> {
    const response = await apiRequest(`/points/stats?user_id=${userId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch points stats');
    }
    
    return data.data;
  },

  // Λήψη redemptions χρήστη
  async getUserRedemptions(userId: number, status?: 'active' | 'used' | 'expired' | 'cancelled'): Promise<UserRedemption[]> {
    let url = `/points/redemptions?user_id=${userId}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await apiRequest(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch redemptions');
    }
    
    return data.data;
  }
};