import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { useAuth } from '../../contexts/AuthContext';
import * as API from '../../config/api';

const HybridNotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [isNative] = useState(Capacitor.isNativePlatform());
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'loading'>('unknown');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentToken, setCurrentToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Auto-initialize based on platform
  useEffect(() => {
    if (isNative) {
      console.log('📱 Native platform detected - using Capacitor Push Notifications');
    } else {
      console.log('🌐 Web platform detected - using FCM Web');
      // For web, we can still try to use FCM
      initializeFCMWeb();
    }
  }, [isNative]);

  const initializeFCMWeb = async () => {
    try {
      // Dynamic import FCM for web only
      const { fcmService } = await import('../../services/fcmService');
      const success = await fcmService.initialize();
      setInitStatus(success ? 'success' : 'error');
      if (success) {
        const status = fcmService.getStatus();
        setPermissionStatus(status.permission === 'granted' ? 'granted' : 'unknown');
        setCurrentToken(status.token || '');
      }
    } catch (error) {
      console.error('FCM Web initialization failed:', error);
      setInitStatus('error');
      setError('FCM Web not available');
    }
  };

  const initializeNativePush = async () => {
    setInitStatus('loading');
    setError('');

    try {
      console.log('🔔 Initializing native push notifications...');

      // Request permissions first
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive !== 'granted') {
        setPermissionStatus('denied');
        setInitStatus('error');
        setError('Push notification permissions denied');
        return;
      }

      setPermissionStatus('granted');

      // Register for push notifications
      await PushNotifications.register();

      // Add listeners
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('✅ Push registration success:', token.value.substring(0, 20) + '...');
        setCurrentToken(token.value.substring(0, 20) + '...');
        sendTokenToBackend(token.value, 'native');
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('❌ Push registration error:', error);
        setInitStatus('error');
        setError('Registration failed: ' + error.error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📩 Push notification received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('👆 Push notification action performed:', notification);
      });

      setInitStatus('success');
      console.log('🎉 Native push notifications initialized successfully!');

    } catch (error) {
      console.error('💥 Native push initialization failed:', error);
      setInitStatus('error');
      setError(error instanceof Error ? error.message : 'Native push initialization failed');
    }
  };

  const sendTokenToBackend = async (token: string, platform: string) => {
    try {
      console.log(`📤 Sending ${platform} token to backend...`);
      
      await API.apiRequest('/users/push-token', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          platform: platform,
          type: isNative ? 'native' : 'fcm',
          device_info: {
            platform: Capacitor.getPlatform(),
            is_native: isNative,
            user_agent: navigator.userAgent
          }
        })
      });

      console.log('✅ Token sent to backend successfully');
    } catch (error) {
      console.error('⚠️ Failed to send token to backend:', error);
    }
  };

  const handleInitialize = async () => {
    if (isNative) {
      await initializeNativePush();
    } else {
      await initializeFCMWeb();
    }
  };

  const handleSendTest = async () => {
    setTestStatus('loading');
    setError('');

    try {
      const response = await API.apiRequest('/notifications/test', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Notification',
          body: `Test από ${isNative ? 'mobile app' : 'web browser'}! 🚀`,
          platform: isNative ? 'native' : 'web',
          type: isNative ? 'native' : 'fcm'
        })
      });

      if (response.ok) {
        setTestStatus('success');
        console.log('✅ Test notification sent successfully');
      } else {
        setTestStatus('error');
        setError('Test notification failed');
      }
    } catch (error) {
      console.error('⚠️ Test notification failed:', error);
      setTestStatus('error');
      setError(error instanceof Error ? error.message : 'Test notification failed');
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
      case 'loading': return 'Loading...';
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'granted': return 'Granted';
      case 'denied': return 'Denied';
      case 'unknown': return 'Unknown';
      default: return 'Waiting';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          {isNative ? '📱' : '🌐'} Push Notifications
        </h1>
        {user && (
          <p className="text-sm text-gray-600 mt-1">
            User: {user.name} • Platform: {isNative ? 'Mobile App' : 'Web Browser'}
          </p>
        )}
        <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs inline-block">
          {isNative ? '📱 Native Push (Capacitor)' : '🌐 FCM Web'}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-2">⚠️</span>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getStatusIcon(initStatus)}</div>
            <h3 className="font-medium text-gray-800">Service</h3>
            <p className="text-sm text-gray-600">{getStatusText(initStatus)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getStatusIcon(permissionStatus)}</div>
            <h3 className="font-medium text-gray-800">Permission</h3>
            <p className="text-sm text-gray-600">{getStatusText(permissionStatus)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{currentToken ? '🔑' : '❌'}</div>
            <h3 className="font-medium text-gray-800">Token</h3>
            <p className="text-sm text-gray-600">{currentToken ? 'Available' : 'Missing'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{isNative ? '📱' : '🌐'}</div>
            <h3 className="font-medium text-gray-800">Platform</h3>
            <p className="text-sm text-gray-600">{isNative ? 'Native' : 'Web'}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {isNative ? 'Native Push Controls' : 'FCM Web Controls'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Initialize */}
          <button
            onClick={handleInitialize}
            disabled={initStatus === 'loading' || initStatus === 'success'}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              initStatus === 'success'
                ? 'border-green-200 bg-green-50 text-green-800 cursor-not-allowed'
                : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
            } ${initStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {initStatus === 'success' ? '✅ Service Active' : `🚀 Initialize ${isNative ? 'Native Push' : 'FCM'}`}
                </h3>
                <p className="text-sm opacity-75">
                  {initStatus === 'success' 
                    ? 'Service is running' 
                    : `Start ${isNative ? 'native push notifications' : 'Firebase messaging'}`
                  }
                </p>
              </div>
              {initStatus === 'loading' && (
                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
              )}
            </div>
          </button>

          {/* Test Notification */}
          <button
            onClick={handleSendTest}
            disabled={initStatus !== 'success' || testStatus === 'loading'}
            className="p-4 rounded-lg border-2 border-green-200 bg-green-50 text-green-800 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed text-left transition-colors"
          >
            <div>
              <h3 className="font-medium">
                {testStatus === 'loading' ? '📤 Sending...' : '📤 Send Test'}
              </h3>
              <p className="text-sm opacity-75">Test push notification</p>
            </div>
          </button>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Platform Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Platform:</span>
              <span className="font-medium text-blue-600">{Capacitor.getPlatform()}</span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Native:</span>
              <span className={`font-medium ${isNative ? 'text-green-600' : 'text-orange-600'}`}>
                {isNative ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Service Type:</span>
              <span className="font-medium text-purple-600">
                {isNative ? 'Capacitor Push' : 'Firebase FCM'}
              </span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Token Preview:</span>
              <span className="font-medium text-gray-600 text-xs">
                {currentToken || 'Not available'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-blue-800 font-medium mb-2">
          {isNative ? '📱 Native Push Instructions' : '🌐 Web FCM Instructions'}
        </h3>
        <div className="text-blue-700 text-sm space-y-2">
          {isNative ? (
            <>
              <p>• You're using the mobile app with native push notifications</p>
              <p>• This uses Capacitor Push Notifications plugin</p>
              <p>• Works with both Android (FCM) and iOS (APNs) automatically</p>
              <p>• Notifications will work in production builds</p>
            </>
          ) : (
            <>
              <p>• You're using the web browser with Firebase Cloud Messaging</p>
              <p>• This requires HTTPS in production</p>
              <p>• Service worker handles background notifications</p>
              <p>• VAPID key is configured for web push</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HybridNotificationSettings;
