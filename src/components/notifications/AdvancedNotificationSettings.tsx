import React, { useEffect, useState } from 'react';
import { useEnhancedNotifications } from '../../hooks/useEnhancedNotifications';
import { useAuth } from '../../contexts/AuthContext';

const AdvancedNotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [notificationState, notificationActions] = useEnhancedNotifications();
  const [isInitializing, setIsInitializing] = useState(false);
  const [testMessage, setTestMessage] = useState({ title: '', body: '' });

  const {
    isInitialized,
    permissions,
    scheduledNotifications,
    isLoading,
    error,
    status
  } = notificationState;

  const {
    initialize,
    requestPermissions,
    sendTestNotification,
    cancelNotification,
    refreshNotifications,
    clearError
  } = notificationActions;

  // Auto-initialize when component mounts
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      setIsInitializing(true);
      initialize().finally(() => {
        setIsInitializing(false);
      });
    }
  }, [isInitialized, initialize, isInitializing]);

  // Auto-refresh notifications when user changes
  useEffect(() => {
    if (user && isInitialized) {
      refreshNotifications();
    }
  }, [user, isInitialized, refreshNotifications]);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initialize();
    } finally {
      setIsInitializing(false);
    }
  };

  const handleRequestPermissions = async () => {
    await requestPermissions();
  };

  const handleSendTest = async () => {
    const title = testMessage.title || 'Test Notification';
    const body = testMessage.body || 'This is a test notification from Sweat93!';
    await sendTestNotification(title, body);
  };

  const handleCancelNotification = async (notificationId: string) => {
    if (confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή την ειδοποίηση;')) {
      await cancelNotification(notificationId);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionStatusIcon = () => {
    switch (permissions.currentStatus) {
      case 'granted': return '✅';
      case 'denied': return '❌';
      case 'prompt': return '⏳';
      default: return '❓';
    }
  };

  const getPermissionStatusText = () => {
    switch (permissions.currentStatus) {
      case 'granted': return 'Ενεργοποιημένες';
      case 'denied': return 'Απενεργοποιημένες';
      case 'prompt': return 'Αναμονή απάντησης';
      default: return 'Άγνωστη κατάσταση';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    if (type.includes('package')) return '📦';
    if (type.includes('appointment')) return '📅';
    return '🔔';
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'package_expiry_week': return 'Λήξη Πακέτου (1 εβδομάδα)';
      case 'package_expiry_2days': return 'Λήξη Πακέτου (2 μέρες)';
      case 'appointment_reminder': return 'Υπενθύμιση Ραντεβού';
      default: return 'Γενική Ειδοποίηση';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          🔔 Ρυθμίσεις Ειδοποιήσεων
        </h1>
        {user && (
          <p className="text-sm text-gray-600 mt-1">
            Διαχείριση ειδοποιήσεων για: {user.name}
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-2">⚠️</span>
              <div>
                <h3 className="text-red-800 font-medium">Σφάλμα</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Service Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Κατάσταση Υπηρεσίας</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Αρχικοποίηση:</span>
              <span className={`font-medium ${isInitialized ? 'text-green-600' : 'text-red-600'}`}>
                {isInitialized ? '✅ Ενεργή' : '❌ Ανενεργή'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Άδειες:</span>
              <span className="font-medium">
                {getPermissionStatusIcon()} {getPermissionStatusText()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Πλατφόρμα:</span>
              <span className="font-medium text-blue-600">
                {status?.platform || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Token:</span>
              <span className={`font-medium ${status?.hasToken ? 'text-green-600' : 'text-orange-600'}`}>
                {status?.hasToken ? '✅ Υπάρχει' : '⚠️ Δεν υπάρχει'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Προσπάθειες:</span>
              <span className="font-medium text-gray-600">
                {status?.attempts || 0}/{status?.maxAttempts || 3}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Λειτουργία:</span>
              <span className={`font-medium ${isLoading ? 'text-blue-600' : 'text-gray-600'}`}>
                {isLoading ? '🔄 Επεξεργασία...' : '💤 Αναμονή'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Ενέργειες</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Initialize */}
          <button
            onClick={handleInitialize}
            disabled={isInitializing || isLoading}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              isInitialized 
                ? 'border-green-200 bg-green-50 text-green-800' 
                : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
            } ${(isInitializing || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {isInitialized ? '✅ Υπηρεσία Ενεργή' : '🔄 Αρχικοποίηση'}
                </h3>
                <p className="text-sm opacity-75">
                  {isInitialized ? 'Η υπηρεσία λειτουργεί κανονικά' : 'Ξεκινήστε την υπηρεσία ειδοποιήσεων'}
                </p>
              </div>
              {(isInitializing || isLoading) && (
                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
              )}
            </div>
          </button>

          {/* Request Permissions */}
          <button
            onClick={handleRequestPermissions}
            disabled={!permissions.canRequest || isLoading}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              permissions.canReceive
                ? 'border-green-200 bg-green-50 text-green-800'
                : permissions.canRequest
                ? 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100'
                : 'border-red-200 bg-red-50 text-red-800'
            } ${(!permissions.canRequest || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div>
              <h3 className="font-medium">
                {permissions.canReceive ? '✅ Άδειες Ενεργές' : '🔐 Άδειες Ειδοποιήσεων'}
              </h3>
              <p className="text-sm opacity-75">
                {permissions.canReceive 
                  ? 'Οι ειδοποιήσεις είναι ενεργοποιημένες' 
                  : permissions.canRequest
                  ? 'Ζητήστε άδεια για ειδοποιήσεις'
                  : 'Οι άδειες έχουν απορριφθεί'
                }
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Test Notifications */}
      {isInitialized && permissions.canReceive && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Δοκιμή Ειδοποιήσεων</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Τίτλος
                </label>
                <input
                  type="text"
                  value={testMessage.title}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Test Notification"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Μήνυμα
                </label>
                <input
                  type="text"
                  value={testMessage.body}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="This is a test notification!"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleSendTest}
              disabled={isLoading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '📤 Αποστολή...' : '📤 Αποστολή Δοκιμαστικής Ειδοποίησης'}
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Notifications */}
      {isInitialized && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Προγραμματισμένες Ειδοποιήσεις</h2>
            <button
              onClick={refreshNotifications}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              🔄 Ανανέωση
            </button>
          </div>
          
          {scheduledNotifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Δεν υπάρχουν προγραμματισμένες ειδοποιήσεις</h3>
              <p className="text-gray-600">
                Οι ειδοποιήσεις θα εμφανιστούν εδώ όταν προγραμματιστούν αυτόματα από το σύστημα.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledNotifications.map((notification) => (
                <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{getNotificationTypeIcon(notification.type)}</span>
                        <h3 className="font-medium text-gray-800">{notification.title}</h3>
                        {notification.isActive === false && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Ακυρωμένη
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{notification.body}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📅 {formatDate(notification.scheduledFor)}</span>
                        <span>🏷️ {getNotificationTypeText(notification.type)}</span>
                        {notification.relatedId && (
                          <span>🔗 ID: {notification.relatedId}</span>
                        )}
                      </div>
                    </div>
                    
                    {notification.isActive !== false && (
                      <button
                        onClick={() => handleCancelNotification(notification.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 ml-4"
                        title="Ακύρωση ειδοποίησης"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {!isInitialized && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
          <h3 className="text-blue-800 font-medium mb-2">💡 Βοήθεια</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Πατήστε "Αρχικοποίηση" για να ξεκινήσετε την υπηρεσία</li>
            <li>• Δώστε άδεια για ειδοποιήσεις όταν σας ζητηθεί</li>
            <li>• Δοκιμάστε τις ειδοποιήσεις με το κουμπί δοκιμής</li>
            <li>• Οι ειδοποιήσεις προγραμματίζονται αυτόματα για πακέτα και ραντεβού</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdvancedNotificationSettings;
