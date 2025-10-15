import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Filter, Download } from 'lucide-react';
import { usePoints } from '../contexts/PointsContext';
import { PointsHistoryItem } from '../components/points/PointsHistoryItem';
import { LoadingState } from '../components/points/LoadingSpinner';
import { PointsHistoryItem as HistoryItemType } from '../api/modules/pointsApi';

const PointsHistory: React.FC = () => {
  const { state, actions } = usePoints();
  const [filter, setFilter] = useState<'all' | 'earned' | 'spent'>('all');
  const [filteredHistory, setFilteredHistory] = useState<HistoryItemType[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const filterOptions = [
    { value: 'all' as const, label: 'Όλα', count: state.history.length },
    { value: 'earned' as const, label: 'Κερδισμένοι', count: state.history.filter(h => h.type === 'earned').length },
    { value: 'spent' as const, label: 'Χρησιμοποιημένοι', count: state.history.filter(h => h.type === 'spent').length },
  ];

  const dateFilterOptions = [
    { value: 'all' as const, label: 'Όλες οι περίοδοι' },
    { value: 'week' as const, label: 'Τελευταία εβδομάδα' },
    { value: 'month' as const, label: 'Τελευταίος μήνας' },
    { value: 'year' as const, label: 'Τελευταίος χρόνος' },
  ];

  useEffect(() => {
    let filtered = [...state.history];

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.created_at) >= filterDate);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredHistory(filtered);
  }, [state.history, filter, dateFilter]);

  const navigateBack = () => {
    window.location.href = '/points';
  };

  const exportHistory = () => {
    // Export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Ημερομηνία,Τύπος,Πόντοι,Περιγραφή,Υπόλοιπο\n"
      + filteredHistory.map(item => 
          `${new Date(item.created_at).toLocaleDateString('el-GR')},${item.type === 'earned' ? 'Κερδισμένοι' : 'Χρησιμοποιημένοι'},${item.amount},${item.description},${item.balance_after}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `points_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalPoints = (type?: 'earned' | 'spent') => {
    if (!type) return filteredHistory.reduce((sum, item) => sum + item.amount, 0);
    return filteredHistory
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  if (state.loading && state.history.length === 0) {
    return <LoadingState message="Φόρτωση ιστορικού..." />;
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
              <h1 className="text-xl font-bold text-gray-900">Ιστορικό Πόντων</h1>
              <p className="text-sm text-gray-600">
                {filteredHistory.length} συναλλαγές
              </p>
            </div>
            <button
              onClick={exportHistory}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Εξαγωγή ιστορικού"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Summary Cards */}
        {filter === 'all' && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">
                  +{getTotalPoints('earned').toLocaleString('el-GR')}
                </p>
                <p className="text-sm text-green-600">Κερδισμένοι</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-700">
                  -{getTotalPoints('spent').toLocaleString('el-GR')}
                </p>
                <p className="text-sm text-red-600">Χρησιμοποιημένοι</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Type Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Τύπος συναλλαγής</h3>
            <div className="flex space-x-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${filter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{option.label}</span>
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-xs
                    ${filter === option.value
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

          {/* Date Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Περίοδος</h3>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              {dateFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.map((item, index) => {
              // Group by date
              const currentDate = new Date(item.created_at).toDateString();
              const prevDate = index > 0 ? new Date(filteredHistory[index - 1].created_at).toDateString() : null;
              const showDateHeader = currentDate !== prevDate;

              return (
                <div key={item.id}>
                  {showDateHeader && (
                    <div className="flex items-center space-x-2 py-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {new Date(item.created_at).toLocaleDateString('el-GR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  <PointsHistoryItem item={item} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Δεν βρέθηκαν συναλλαγές
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {filter !== 'all' || dateFilter !== 'all'
                ? 'Δεν υπάρχουν συναλλαγές για τα επιλεγμένα φίλτρα'
                : 'Δεν έχεις κάνει καμία συναλλαγή ακόμα'
              }
            </p>
            {(filter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setFilter('all');
                  setDateFilter('all');
                }}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Καθάρισε φίλτρα
              </button>
            )}
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

export default PointsHistory;
