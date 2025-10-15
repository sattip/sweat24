import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, ArrowLeft } from 'lucide-react';
import { usePoints } from '../contexts/PointsContext';
import { RewardCard } from '../components/points/RewardCard';
import { LoadingState } from '../components/points/LoadingSpinner';
import { Reward } from '../api/modules/pointsApi';

const RewardsCatalog: React.FC = () => {
  const { state, actions } = usePoints();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [redeeming, setRedeeming] = useState<number | null>(null);

  const filterOptions = [
    { value: 'all', label: 'Όλες', count: state.rewards.length },
    { value: 'affordable', label: 'Διαθέσιμες', count: state.rewards.filter(r => r.points_cost <= state.balance).length },
    { value: 'gift_card', label: 'Δωροκάρτες', count: state.rewards.filter(r => r.reward_type === 'gift_card').length },
    { value: 'free_session', label: 'Προπονήσεις', count: state.rewards.filter(r => r.reward_type === 'free_session').length },
    { value: 'discount', label: 'Εκπτώσεις', count: state.rewards.filter(r => r.reward_type === 'discount').length },
  ];

  useEffect(() => {
    let filtered = [...state.rewards];

    // Filter by category
    if (selectedFilter === 'affordable') {
      filtered = filtered.filter(reward => reward.points_cost <= state.balance);
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter(reward => reward.reward_type === selectedFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(reward => 
        reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by affordability and points cost
    filtered.sort((a, b) => {
      const aAffordable = a.points_cost <= state.balance;
      const bAffordable = b.points_cost <= state.balance;
      
      if (aAffordable && !bAffordable) return -1;
      if (!aAffordable && bAffordable) return 1;
      
      return a.points_cost - b.points_cost;
    });

    setFilteredRewards(filtered);
  }, [state.rewards, state.balance, selectedFilter, searchTerm]);

  const handleRedeemReward = async (rewardId: number) => {
    setRedeeming(rewardId);
    try {
      await actions.redeemReward(rewardId);
    } finally {
      setRedeeming(null);
    }
  };

  const navigateBack = () => {
    window.location.href = '/points';
  };

  if (state.loading && state.rewards.length === 0) {
    return <LoadingState message="Φόρτωση ανταμοιβών..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={navigateBack}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Ανταμοιβές</h1>
              <div className="flex items-center space-x-1 text-sm text-purple-600">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>{state.balance.toLocaleString('el-GR')} πόντοι</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Αναζήτηση ανταμοιβών..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedFilter === option.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <span>{option.label}</span>
                <span className={`
                  px-1.5 py-0.5 rounded-full text-xs
                  ${selectedFilter === option.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Grid */}
        {filteredRewards.length > 0 ? (
          <div className="space-y-4">
            {filteredRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={state.balance}
                onRedeem={() => handleRedeemReward(reward.id)}
                loading={redeeming === reward.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Δεν βρέθηκαν ανταμοιβές
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {searchTerm
                ? `Δεν υπάρχουν ανταμοιβές για "${searchTerm}"`
                : selectedFilter === 'affordable'
                  ? 'Δεν έχεις αρκετούς πόντους για τις διαθέσιμες ανταμοιβές'
                  : 'Δεν υπάρχουν ανταμοιβές σε αυτή την κατηγορία'
              }
            </p>
            {(searchTerm || selectedFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Καθάρισε φίλτρα
              </button>
            )}
          </div>
        )}

        {/* Loading State για redeem */}
        {state.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center">
              <LoadingState message="Εξαργύρωση ανταμοιβής..." />
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-700 text-sm">{state.error}</p>
                <button
                  onClick={actions.clearError}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsCatalog;
