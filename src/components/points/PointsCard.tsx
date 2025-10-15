import React from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

interface PointsCardProps {
  points: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  className?: string;
}

export const PointsCard: React.FC<PointsCardProps> = ({ 
  points, 
  trend, 
  trendValue,
  className = ""
}) => {
  const formatPoints = (points: number) => {
    return points.toLocaleString('el-GR');
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Star className="w-8 h-8 text-yellow-400 fill-current" />
          <span className="text-purple-100 font-medium">Οι Πόντοι μου</span>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center space-x-1 ${getTrendColor(trend)}`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">+{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-4xl font-bold">
          {formatPoints(points)}
        </div>
        <p className="text-purple-100 text-sm">
          πόντοι διαθέσιμοι
        </p>
        {trend && trendValue && (
          <p className="text-purple-200 text-xs">
            +{trendValue} αυτό το μήνα
          </p>
        )}
      </div>
    </div>
  );
};
