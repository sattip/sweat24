import React from 'react';
import { 
  Star, 
  CreditCard, 
  Dumbbell, 
  Package, 
  Percent, 
  Crown, 
  Gift,
  ShoppingCart
} from 'lucide-react';
import { Reward } from '../../api/modules/pointsApi';
import { getRedemptionButtonText, requiresCart, getRedemptionMessage } from '../../utils/rewardUtils';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: () => void;
  loading?: boolean;
}

export const RewardCard: React.FC<RewardCardProps> = ({ 
  reward, 
  userPoints, 
  onRedeem,
  loading = false 
}) => {
  const isAffordable = userPoints >= reward.points_cost;
  const pointsNeeded = reward.points_cost - userPoints;

  const getRewardIcon = (type: string) => {
    const iconProps = { size: 24, className: "text-purple-600" };
    
    switch (type) {
      case 'gift_card': return <CreditCard {...iconProps} />;
      case 'free_session': return <Dumbbell {...iconProps} />;
      case 'product': return <Package {...iconProps} />;
      case 'discount': return <Percent {...iconProps} />;
      case 'premium': return <Crown {...iconProps} />;
      default: return <Gift {...iconProps} />;
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'gift_card': return 'Δωροκάρτα';
      case 'free_session': return 'Δωρεάν Προπόνηση';
      case 'product': return 'Προϊόν';
      case 'discount': return 'Έκπτωση';
      case 'premium': return 'Premium';
      default: return 'Ανταμοιβή';
    }
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 transition-all duration-200 hover:shadow-lg
      ${isAffordable ? 'border-purple-200 hover:border-purple-300' : 'border-gray-200 opacity-75'}
    `}>
      {/* Header με Icon και Points Badge */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getRewardIcon(reward.reward_type)}
            <span className="text-sm text-gray-600 font-medium">
              {getRewardTypeLabel(reward.reward_type)}
            </span>
          </div>
          <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
            <span className="text-purple-700 font-bold text-sm">
              {reward.points_cost.toLocaleString('el-GR')}
            </span>
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
          </div>
        </div>
        
        <h3 className="font-bold text-lg text-gray-900 mb-1">
          {reward.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {reward.description}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Αξία:</span>
            <span className="font-semibold text-green-600">{reward.reward_value}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRedeem}
          disabled={!isAffordable || loading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
            ${isAffordable 
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Εξαργύρωση...</span>
            </>
          ) : isAffordable ? (
            <>
              {requiresCart(reward) && <ShoppingCart className="w-4 h-4" />}
              <span>{getRedemptionButtonText(reward)}</span>
            </>
          ) : (
            <span>{`Χρειάζεστε ${pointsNeeded.toLocaleString('el-GR')} πόντους`}</span>
          )}
        </button>

        {/* Hint Message για διαθέσιμες ανταμοιβές */}
        {isAffordable && (
          <p className="mt-2 text-xs text-gray-500 text-center">
            {getRedemptionMessage(reward)}
          </p>
        )}

        {/* Progress Bar για μη διαθέσιμες ανταμοιβές */}
        {!isAffordable && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Πρόοδος</span>
              <span>{Math.round((userPoints / reward.points_cost) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((userPoints / reward.points_cost) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
