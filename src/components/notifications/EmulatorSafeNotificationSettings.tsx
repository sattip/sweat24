import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Simulated notification for emulator testing
const EmulatorSafeNotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'loading'>('unknown');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isEmulator, setIsEmulator] = useState(false);

  // Check if running in emulator
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidEmulator = userAgent.includes('emulator') || userAgent.includes('generic');
    const isIOSSimulator = userAgent.includes('simulator');
    
    setIsEmulator(isAndroidEmulator || isIOSSimulator || window.location.hostname === 'localhost');
  }, []);

  const handleInitialize = async () => {
    setInitStatus('loading');
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (isEmulator) {
      // Emulator: Always succeed with simulation
      console.log('🔔 [EMULATOR] Simulating notification initialization...');
      setInitStatus('success');
      setPermissionStatus('unknown'); // Ready for permission request
    } else {
      // Real device: Try actual initialization
      try {
        const { enhancedNotificationService } = await import('../../services/enhancedNotificationService');
        const success = await enhancedNotificationService.initialize();
        
        if (success) {
          setInitStatus('success');
          const permissions = await enhancedNotificationService.getNotificationPermissions();
          setPermissionStatus(permissions.canReceive ? 'granted' : 'unknown');
        } else {
          setInitStatus('error');
        }
      } catch (error) {
        console.error('Real device initialization failed:', error);
        setInitStatus('error');
      }
    }
  };

  const handleRequestPermissions = async () => {
    setPermissionStatus('loading');
    
    // Simulate permission request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (isEmulator) {
      // Emulator: Always grant permissions
      console.log('🔐 [EMULATOR] Simulating permission grant...');
      setPermissionStatus('granted');
    } else {
      // Real device: Try actual permission request
      try {
        const { enhancedNotificationService } = await import('../../services/enhancedNotificationService');
        const granted = await enhancedNotificationService.requestPermissions();
        setPermissionStatus(granted ? 'granted' : 'denied');
      } catch (error) {
        console.error('Real device permission request failed:', error);
        setPermissionStatus('denied');
      }
    }
  };

  const handleSendTest = async () => {
    setTestStatus('loading');
    
    // Simulate test notification delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isEmulator) {
      // Emulator: Show simulated notification
      console.log('📤 [EMULATOR] Simulating test notification...');
      
      // Add simulated notification to list
      const newNotification = {
        id: `test_${Date.now()}`,
        title: 'Δοκιμαστική Ειδοποίηση',
        body: 'Συγχαρητήρια! Οι ειδοποιήσεις θα λειτουργούν σωστά σε πραγματική συσκευή! 🎉',
        timestamp: new Date(),
        type: 'test'
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setTestStatus('success');
      
      // Show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.body,
          icon: '/logo-light.png'
        });
      }
    } else {
      // Real device: Try actual test notification
      try {
        const { enhancedNotificationService } = await import('../../services/enhancedNotificationService');
        const success = await enhancedNotificationService.sendTestNotification();
        setTestStatus(success ? 'success' : 'error');
      } catch (error) {
        console.error('Real device test notification failed:', error);
        setTestStatus('error');
      }
    }
  };

  const handleSimulatePackageExpiry = async () => {
    if (!isEmulator) return;
    
    console.log('📦 [EMULATOR] Simulating package expiry notification...');
    
    const packageNotification = {
      id: `package_${Date.now()}`,
      title: '📅 Λήξη Πακέτου σε 1 Εβδομάδα',
      body: 'Το πακέτο προπονήσεων σας λήγει σε 7 μέρες. Ανανεώστε το για να συνεχίσετε!',
      timestamp: new Date(),
      type: 'package_expiry'
    };
    
    setNotifications(prev => [packageNotification, ...prev]);
  };

  const handleSimulateAppointment = async () => {
    if (!isEmulator) return;
    
    console.log('📅 [EMULATOR] Simulating appointment reminder...');
    
    const appointmentNotification = {
      id: `appointment_${Date.now()}`,
      title: '🏋️ Υπενθύμιση Ραντεβού',
      body: 'Το ραντεβού σας με τον προπονητή ξεκινά σε 1 ώρα!',
      timestamp: new Date(),
      type: 'appointment_reminder'
    };
    
    setNotifications(prev => [appointmentNotification, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
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

  const isInitialized = initStatus === 'success';
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
        {isEmulator && (
          <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs inline-block">
            🧪 Emulator Mode - Simulated Notifications
          </div>
        )}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getStatusIcon(initStatus)}</div>
            <h3 className="font-medium text-gray-800">Αρχικοποίηση</h3>
            <p className="text-sm text-gray-600">{getStatusText(initStatus)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getStatusIcon(permissionStatus)}</div>
            <h3 className="font-medium text-gray-800">Άδειες</h3>
            <p className="text-sm text-gray-600">{getStatusText(permissionStatus)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getStatusIcon(testStatus)}</div>
            <h3 className="font-medium text-gray-800">Δοκιμή</h3>
            <p className="text-sm text-gray-600">{getStatusText(testStatus)}</p>
          </div>
        </div>
      </div>

      {/* Action Steps */}
      <div className="space-y-4">
        {/* Step 1: Initialize */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">1. Αρχικοποίηση Υπηρεσίας</h3>
              <p className="text-gray-600 text-sm">
                {isEmulator ? 'Προσομοίωση υπηρεσίας ειδοποιήσεων' : 'Ξεκινήστε την υπηρεσία ειδοποιήσεων'}
              </p>
            </div>
            <button
              onClick={handleInitialize}
              disabled={initStatus === 'loading'}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isInitialized
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              }`}
            >
              {initStatus === 'loading' ? '🔄 Αρχικοποίηση...' : 
               isInitialized ? '✅ Ολοκληρώθηκε' : '🚀 Αρχικοποίηση'}
            </button>
          </div>
        </div>

        {/* Step 2: Permissions */}
        {isInitialized && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">2. Άδειες Ειδοποιήσεων</h3>
                <p className="text-gray-600 text-sm">
                  {isEmulator ? 'Προσομοίωση παραχώρησης αδειών' : 'Δώστε άδεια για λήψη ειδοποιήσεων'}
                </p>
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

        {/* Step 3: Test */}
        {isInitialized && hasPermissions && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">3. Δοκιμαστική Ειδοποίηση</h3>
                <p className="text-gray-600 text-sm">
                  {isEmulator ? 'Προσομοίωση δοκιμαστικής ειδοποίησης' : 'Στείλτε μια δοκιμαστική ειδοποίηση'}
                </p>
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

      {/* Emulator Simulation Controls */}
      {isEmulator && hasPermissions && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
          <h3 className="text-purple-800 font-semibold mb-4">🧪 Emulator Simulation Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSimulatePackageExpiry}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              📦 Simulate Package Expiry
            </button>
            <button
              onClick={handleSimulateAppointment}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              📅 Simulate Appointment Reminder
            </button>
          </div>
        </div>
      )}

      {/* Simulated Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              📱 {isEmulator ? 'Simulated' : 'Recent'} Notifications
            </h3>
            <button
              onClick={clearNotifications}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              🗑️ Clear All
            </button>
          </div>
          
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{notification.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{notification.body}</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <span>🕐 {notification.timestamp.toLocaleTimeString('el-GR')}</span>
                      <span>🏷️ {notification.type}</span>
                      {isEmulator && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">SIMULATED</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success/Ready State */}
      {isInitialized && hasPermissions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-green-800 font-semibold text-lg mb-2">
              {isEmulator ? 'Notifications Simulated Successfully!' : 'Ειδοποιήσεις Ενεργοποιημένες!'}
            </h3>
            <p className="text-green-700">
              {isEmulator 
                ? 'Σε πραγματική συσκευή θα λαμβάνετε αυτόματα:'
                : 'Θα λαμβάνετε αυτόματα:'
              }
            </p>
            <ul className="text-green-700 text-sm mt-3 space-y-1">
              <li>📦 Ειδοποιήσεις λήξης πακέτου (1 εβδομάδα και 2 μέρες πριν)</li>
              <li>📅 Υπενθυμίσεις ραντεβού (1 ώρα πριν)</li>
              <li>🎁 Ειδικές προσφορές και ανακοινώσεις</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmulatorSafeNotificationSettings;
