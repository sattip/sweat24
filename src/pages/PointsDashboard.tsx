import React, { useState, useEffect } from 'react';
import { Gift, History, TrendingUp, Award, RefreshCw } from 'lucide-react';
import { usePoints } from '../contexts/PointsContext';
import { PointsCard } from '../components/points/PointsCard';
import { PointsHistoryItem } from '../components/points/PointsHistoryItem';
import { LoadingState } from '../components/points/LoadingSpinner';
import Header from '../components/Header';

const PointsDashboard: React.FC = () => {
  const { state, actions } = usePoints();
  const [refreshing, setRefreshing] = useState(false);
  const [recentHistory, setRecentHistory] = useState(state.history.slice(0, 5));

  useEffect(() => {
    setRecentHistory(state.history.slice(0, 5));
  }, [state.history]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await actions.refreshAllData();
    setRefreshing(false);
  };

  const navigateToRewards = () => {
    window.location.href = '/points/rewards';
  };

  const navigateToHistory = () => {
    window.location.href = '/points/history';
  };

  if (state.loading && state.balance === 0 && state.history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <LoadingState message="Φόρτωση πόντων..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Οι Πόντοι μου</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Points Balance Card */}
        <PointsCard 
          points={state.balance}
          trend={state.stats.this_month_earned > 0 ? 'up' : 'stable'}
          trendValue={state.stats.this_month_earned}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Συνολικά Κερδισμένοι</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {state.stats.total_earned.toLocaleString('el-GR')}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Εξαργυρωμένοι</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {state.stats.total_spent.toLocaleString('el-GR')}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Γρήγορες Ενέργειες</h2>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={navigateToRewards}
              className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Δες Ανταμοιβές</p>
                  <p className="text-sm text-gray-600">Εξαργύρωσε τους πόντους σου</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-600 font-medium">
                  {state.rewards.length} διαθέσιμες
                </p>
              </div>
            </button>

            <button
              onClick={navigateToHistory}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Ιστορικό Πόντων</p>
                  <p className="text-sm text-gray-600">Δες όλες τις συναλλαγές</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {recentHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Πρόσφατη Δραστηριότητα</h2>
                <button
                  onClick={navigateToHistory}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Δες όλα
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {recentHistory.map((item) => (
                <PointsHistoryItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-700 text-sm">{state.error}</p>
              <button
                onClick={actions.clearError}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Απόκρυψη
              </button>
            </div>
          </div>
        )}

        {/* Empty State για νέους χρήστες */}
        {state.balance === 0 && state.stats.total_earned === 0 && !state.loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Καλώς ήρθες στο σύστημα πόντων!
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Κέρδισε πόντους με κάθε αγορά και εξαργύρωσέ τους για υπέροχες ανταμοιβές.
            </p>
            <button
              onClick={navigateToRewards}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Δες τις Ανταμοιβές
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsDashboard;
