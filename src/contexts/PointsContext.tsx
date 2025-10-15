import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pointsApi, UserPoints, PointsHistoryItem, Reward, RedemptionResult } from '../api/modules/pointsApi';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';
import { useCart } from '../hooks/use-cart';
import { pointsNotificationService } from '../services/pointsNotificationService';
import { requiresCart, getRedemptionMessage, rewardToCartItem } from '../utils/rewardUtils';

interface PointsState {
  balance: number;
  history: PointsHistoryItem[];
  rewards: Reward[];
  stats: {
    current_balance: number;
    total_earned: number;
    total_spent: number;
    lifetime_rank?: string;
    total_redemptions: number;
    active_redemptions: number;
    available_rewards_count: number;
  };
  loading: boolean;
  error: string | null;
}

interface PointsContextType {
  state: PointsState;
  actions: {
    fetchUserPoints: () => Promise<void>;
    fetchPointsHistory: (filter?: 'earned' | 'spent') => Promise<void>;
    fetchRewards: () => Promise<void>;
    fetchStats: () => Promise<void>;
    redeemReward: (rewardId: number) => Promise<RedemptionResult | null>;
    refreshAllData: () => Promise<void>;
    clearError: () => void;
  };
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider: React.FC<PointsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem: addToCart } = useCart();
  
  const [state, setState] = useState<PointsState>({
    balance: 0,
    history: [],
    rewards: [],
    stats: {
      current_balance: 0,
      total_earned: 0,
      total_spent: 0,
      lifetime_rank: undefined,
      total_redemptions: 0,
      active_redemptions: 0,
      available_rewards_count: 0,
    },
    loading: false,
    error: null,
  });

  // Λήψη πόντων χρήστη
  const fetchUserPoints = async () => {
    if (!user?.id) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const userPoints = await pointsApi.getUserPoints(user.id);
      console.log('✅ User points fetched:', userPoints);
      setState(prev => ({ 
        ...prev, 
        balance: userPoints.points_balance,
        loading: false 
      }));
    } catch (error) {
      console.error('❌ Error fetching user points:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Αδυναμία φόρτωσης πόντων',
        loading: false 
      }));
    }
  };

  // Λήψη ιστορικού πόντων
  const fetchPointsHistory = async (filter?: 'earned' | 'spent') => {
    if (!user?.id) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const history = await pointsApi.getPointsHistory(user.id, filter);
      console.log('✅ Points history fetched:', history.length, 'items');
      setState(prev => ({ 
        ...prev, 
        history,
        loading: false 
      }));
    } catch (error) {
      console.error('❌ Error fetching points history:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Αδυναμία φόρτωσης ιστορικού',
        loading: false 
      }));
    }
  };

  // Λήψη ανταμοιβών
  const fetchRewards = async () => {
    if (!user?.id) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🎁 Fetching rewards for user:', user.id, 'with balance:', state.balance);
      
      // First try to get ALL rewards to show in catalog
      let allRewards = [];
      try {
        allRewards = await pointsApi.getAllRewards();
        console.log('✅ All rewards fetched:', allRewards.length, 'total rewards');
        console.log('📋 All rewards data:', allRewards);
      } catch (error) {
        console.error('❌ Error fetching all rewards, falling back to affordable only:', error);
        // Fallback to affordable only if all rewards endpoint fails
        allRewards = await pointsApi.getAffordableRewards(state.balance, user.id);
        console.log('✅ Affordable rewards fetched (fallback):', allRewards.length, 'rewards');
      }
      
      setState(prev => ({ 
        ...prev, 
        rewards: allRewards,
        loading: false 
      }));
    } catch (error) {
      console.error('❌ Error fetching rewards:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Αδυναμία φόρτωσης ανταμοιβών',
        loading: false 
      }));
    }
  };

  // Λήψη στατιστικών
  const fetchStats = async () => {
    if (!user?.id) return;
    
    try {
      console.log('📊 Fetching stats for user:', user.id);
      const stats = await pointsApi.getPointsStats(user.id);
      console.log('✅ Stats calculated:', stats);
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      // If stats fail, we can still show the app with default values
      setState(prev => ({ 
        ...prev, 
        stats: {
          current_balance: 0,
          total_earned: 0,
          total_spent: 0,
          lifetime_rank: undefined,
          total_redemptions: 0,
          active_redemptions: 0,
          available_rewards_count: 0,
        }
      }));
    }
  };

  // Εξαργύρωση ανταμοιβής
  const redeemReward = async (rewardId: number): Promise<RedemptionResult | null> => {
    if (!user?.id) return null;
    
    // Βρες την ανταμοιβή
    const reward = state.rewards.find(r => r.id === rewardId);
    if (!reward) {
      toast({
        title: "Σφάλμα",
        description: "Η ανταμοιβή δεν βρέθηκε",
        variant: "destructive"
      });
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Ελέγχουμε αν χρειάζεται καλάθι
      if (requiresCart(reward)) {
        // Προσθήκη στο καλάθι χωρίς API call
        const cartItem = rewardToCartItem(reward);
        addToCart(cartItem);
        
        setState(prev => ({
          ...prev,
          loading: false
        }));

        toast({
          title: "Προστέθηκε στο Καλάθι! 🛒",
          description: `${reward.name} προστέθηκε στο καλάθι σας. Ολοκληρώστε την παραγγελία για να εξαργυρώσετε τους πόντους.`,
          variant: "default"
        });

        return {
          redemption_id: -1, // Temporary ID
          reward_code: 'CART_PENDING',
          points_spent: reward.points_cost,
          reward_name: reward.name,
          instructions: getRedemptionMessage(reward),
          expires_at: '',
          status: 'active' as const,
          message: 'Προστέθηκε στο καλάθι'
        };
      } else {
        // Instant redemption (API call)
        const result = await pointsApi.redeemReward(rewardId, user.id);
        
        setState(prev => ({
          ...prev,
          loading: false
        }));

        // Εμφάνιση μηνύματος επιτυχίας
        toast({
          title: "Επιτυχία! 🎉",
          description: result.message,
          variant: "default"
        });

        // Ανανέωση δεδομένων
        await Promise.all([
          fetchPointsHistory(),
          fetchRewards(),
          fetchStats()
        ]);

        return result;
      }
    } catch (error: any) {
      console.error('❌ Error redeeming reward:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Αδυναμία εξαργύρωσης ανταμοιβής';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        loading: false 
      }));

      toast({
        title: "Σφάλμα",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  };

  // Ανανέωση όλων των δεδομένων
  const refreshAllData = async () => {
    console.log('🔄 Refreshing all points data...');
    
    // First fetch user points to get current balance
    await fetchUserPoints();
    
    // Then fetch other data that might depend on balance
    await Promise.all([
      fetchPointsHistory(),
      fetchRewards(),
      fetchStats()
    ]);
  };

  // Καθαρισμός σφάλματος
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Αρχική φόρτωση δεδομένων όταν ο χρήστης συνδεθεί
  useEffect(() => {
    if (user?.id) {
      console.log('🚀 Initializing points system for user:', user.id);
      refreshAllData();
      // Αρχικοποίηση notification service
      pointsNotificationService.initialize(toast, null);
    }
  }, [user?.id, toast]);

  const contextValue: PointsContextType = {
    state,
    actions: {
      fetchUserPoints,
      fetchPointsHistory,
      fetchRewards,
      fetchStats,
      redeemReward,
      refreshAllData,
      clearError,
    },
  };

  return (
    <PointsContext.Provider value={contextValue}>
      {children}
    </PointsContext.Provider>
  );
};