import React from 'react';
import { PlusCircle, MinusCircle, Calendar } from 'lucide-react';
import { PointsHistoryItem as HistoryItemType } from '../../api/modules/pointsApi';

interface PointsHistoryItemProps {
  item: HistoryItemType;
}

export const PointsHistoryItem: React.FC<PointsHistoryItemProps> = ({ item }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('el-GR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSourceLabel = (source: string) => {
    const sourceLabels: Record<string, string> = {
      'purchase': 'Αγορά',
      'referral': 'Παραπομπή',
      'bonus': 'Μπόνους',
      'reward_redemption': 'Εξαργύρωση',
      'welcome_bonus': 'Μπόνους Καλωσορίσματος',
      'birthday_bonus': 'Μπόνους Γενεθλίων',
      'achievement': 'Επίτευγμα',
      'promotion': 'Προσφορά'
    };
    return sourceLabels[source] || source;
  };

  const isEarned = item.type === 'earned';

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
        ${isEarned ? 'bg-green-100' : 'bg-red-100'}
      `}>
        {isEarned ? (
          <PlusCircle className="w-5 h-5 text-green-600" />
        ) : (
          <MinusCircle className="w-5 h-5 text-red-600" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.description}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${isEarned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              `}>
                {getSourceLabel(item.source)}
              </span>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(item.created_at)}
              </div>
            </div>
          </div>
          
          {/* Amount and Balance */}
          <div className="text-right ml-4">
            <p className={`
              text-sm font-bold
              ${isEarned ? 'text-green-600' : 'text-red-600'}
            `}>
              {isEarned ? '+' : '-'}{item.amount.toLocaleString('el-GR')}
            </p>
            <p className="text-xs text-gray-500">
              Υπόλοιπο: {item.balance_after.toLocaleString('el-GR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
