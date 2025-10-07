import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CrashSafeNotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [initializationStatus, setInitializationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'loading'>('unknown');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInitialize = async () => {
    setInitializationStatus('loading');
    setErrorMessage('');
    
    try {
      // Dynamic import to avoid loading issues
      const { enhancedNotificationService } = await import('../../services/enhancedNotificationService');
      
      console.log('🔔 Starting manual notification initialization...');
      const success = await enhancedNotificationService.initialize();
      
      if (success) {
        setInitializationStatus('success');
        // Check permissions after successful initialization
        const permissions = await enhancedNotificationService.getNotificationPermissions();
        setPermissionStatus(permissions.canReceive ? 'granted' : 'denied');
      } else {
        setInitializationStatus('error');
        setErrorMessage('Η αρχικοποίηση απέτυχε. Δοκιμάστε ξανά.');
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      setInitializationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Άγνωστο σφάλμα αρχικοποίησης');
    }
  };

  const handleRequestPermissions = async () => {
    setPermissionStatus('loading');
    setErrorMessage('');
    
    try {
      const { enhancedNotificationService } = await import('../../services/enhancedNotificationService');
      
      console.log('🔐 Requesting notification permissions...');
      const granted = await enhancedNotificationService.requestPermissions();
      
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (!granted) {
        setErrorMessage('Οι άδειες ειδοποιήσεων απορρίφθηκαν. Μπορείτε να τις ενεργοποιήσετε από τις ρυθμίσεις της συσκευής.');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setPermissionStatus('denied');
      setErrorMessage(error instanceof Error ? error.message : 'Αποτυχία αιτήματος αδειών');
    }
  };

  const handleSendTest = async () => {
    setTestStatus('loading');
    setErrorMessage('');
    
    try {
      const { enhancedNotificationService } = await import('../../services/enhancedNotificationService');
      
      console.log('📤 Sending test notification...');
      const success = await enhancedNotificationService.sendTestNotification(
        'Δοκιμαστική Ειδοποίηση',
        'Συγχαρητήρια! Οι ειδοποιήσεις λειτουργούν σωστά! 🎉'
      );
      
      setTestStatus(success ? 'success' : 'error');
      
      if (!success) {
        setErrorMessage('Η αποστολή της δοκιμαστικής ειδοποίησης απέτυχε.');
      }
    } catch (error) {
      console.error('Test notification failed:', error);
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Αποτυχία δοκιμαστικής ειδοποίησης');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'granted': return '✅';
      case 'denied': return '❌';
      default: return '⏳';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'loading': return 'Επεξεργασία...';
      case 'success': return 'Επιτυχία';
      case 'error': return 'Σφάλμα';
      case 'granted': return 'Ενεργοποιημένες';
      case 'denied': return 'Απενεργοποιημένες';
      case 'unknown': return 'Άγνωστη κατάσταση';
      default: return 'Αναμονή';
    }
  };

  const isInitialized = initializationStatus === 'success';
  const hasPermissions = permissionStatus === 'granted';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          🔔 Ρυθμίσεις Ειδοποιήσεων
        </h1>
        {user && (
          <p className="text-sm text-gray-600 mt-1">
            Χρήστης: {user.name}
          </p>
        )}
      </div>

      {/* Error Display */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-2">⚠️</span>
              <div>
                <h3 className="text-red-800 font-medium">Σφάλμα</h3>
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Initialization Status */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getStatusIcon(initializationStatus)}</div>
            <h3 className="font-medium text-gray-800">Αρχικοποίηση</h3>
            <p className="text-sm text-gray-600">{getStatusText(initializationStatus)}</p>
          </div>
        </div>

        {/* Permission Status */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getStatusIcon(permissionStatus)}</div>
            <h3 className="font-medium text-gray-800">Άδειες</h3>
            <p className="text-sm text-gray-600">{getStatusText(permissionStatus)}</p>
          </div>
        </div>

        {/* Test Status */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getStatusIcon(testStatus)}</div>
            <h3 className="font-medium text-gray-800">Δοκιμή</h3>
            <p className="text-sm text-gray-600">{getStatusText(testStatus)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Step 1: Initialize */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">1. Αρχικοποίηση Υπηρεσίας</h3>
              <p className="text-gray-600 text-sm">Ξεκινήστε την υπηρεσία ειδοποιήσεων</p>
            </div>
            <button
              onClick={handleInitialize}
              disabled={initializationStatus === 'loading'}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isInitialized
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              }`}
            >
              {initializationStatus === 'loading' ? '🔄 Αρχικοποίηση...' : 
               isInitialized ? '✅ Ολοκληρώθηκε' : '🚀 Αρχικοποίηση'}
            </button>
          </div>
        </div>

        {/* Step 2: Request Permissions (only if initialized) */}
        {isInitialized && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">2. Άδειες Ειδοποιήσεων</h3>
                <p className="text-gray-600 text-sm">Δώστε άδεια για λήψη ειδοποιήσεων</p>
              </div>
              <button
                onClick={handleRequestPermissions}
                disabled={permissionStatus === 'loading' || hasPermissions}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  hasPermissions
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50'
                }`}
              >
                {permissionStatus === 'loading' ? '🔄 Αίτημα...' : 
                 hasPermissions ? '✅ Ενεργοποιημένες' : '🔐 Αίτημα Αδειών'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Test Notification (only if has permissions) */}
        {isInitialized && hasPermissions && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">3. Δοκιμαστική Ειδοποίηση</h3>
                <p className="text-gray-600 text-sm">Στείλτε μια δοκιμαστική ειδοποίηση</p>
              </div>
              <button
                onClick={handleSendTest}
                disabled={testStatus === 'loading'}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {testStatus === 'loading' ? '📤 Αποστολή...' : '📤 Δοκιμή'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {isInitialized && hasPermissions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-green-800 font-semibold text-lg mb-2">Ειδοποιήσεις Ενεργοποιημένες!</h3>
            <p className="text-green-700">
              Οι ειδοποιήσεις είναι πλέον ενεργές. Θα λαμβάνετε αυτόματα:
            </p>
            <ul className="text-green-700 text-sm mt-3 space-y-1">
              <li>📦 Ειδοποιήσεις λήξης πακέτου (1 εβδομάδα και 2 μέρες πριν)</li>
              <li>📅 Υπενθυμίσεις ραντεβού (1 ώρα πριν)</li>
              <li>🎁 Ειδικές προσφορές και ανακοινώσεις</li>
            </ul>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-blue-800 font-medium mb-2">💡 Οδηγίες</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Ακολουθήστε τα βήματα με τη σειρά για να ενεργοποιήσετε τις ειδοποιήσεις</li>
          <li>• Αν αποτύχει κάποιο βήμα, δοκιμάστε ξανά μετά από λίγα δευτερόλεπτα</li>
          <li>• Μπορείτε να απενεργοποιήσετε τις ειδοποιήσεις από τις ρυθμίσεις της συσκευής</li>
          <li>• Οι ειδοποιήσεις προγραμματίζονται αυτόματα όταν αγοράζετε πακέτα ή κλείνετε ραντεβού</li>
        </ul>
      </div>
    </div>
  );
};

export default CrashSafeNotificationSettings;
