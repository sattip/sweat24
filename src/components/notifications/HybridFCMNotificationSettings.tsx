import React, { useEffect, useState } from 'react';
import { hybridFCMService } from '../../services/hybridFCMService';
import { useAuth } from '../../contexts/AuthContext';
import { Capacitor } from '@capacitor/core';

const HybridFCMNotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [isNative] = useState(Capacitor.isNativePlatform());
  const [fcmStatus, setFcmStatus] = useState(hybridFCMService.getStatus());
  const [testMessage, setTestMessage] = useState({ title: '', body: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);

  // Auto-initialize on component mount
  useEffect(() => {
    if (!fcmStatus.isInitialized) {
      console.log('🔥 Auto-initializing Hybrid FCM...');
      handleInitialize();
    }

    // Set up message listener
    const unsubscribe = hybridFCMService.onMessage((payload) => {
      console.log('📩 New message received:', payload);
      setMessages(prev => [payload, ...prev.slice(0, 9)]); // Keep last 10 messages
    });

    return unsubscribe;
  }, []);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setFcmStatus(hybridFCMService.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInitialize = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Initializing Hybrid FCM...');
      const success = await hybridFCMService.initialize();
      
      if (success) {
        setFcmStatus(hybridFCMService.getStatus());
        console.log('✅ Hybrid FCM initialized successfully');
      } else {
        setError('Failed to initialize FCM service');
      }
    } catch (err) {
      console.error('💥 FCM initialization error:', err);
      setError(err instanceof Error ? err.message : 'FCM initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    setIsLoading(true);
    setError('');

    try {
      const title = testMessage.title || 'Test FCM Notification';
      const body = testMessage.body || `🔥 Test FCM από ${isNative ? 'mobile app' : 'web browser'}!`;
      
      const success = await hybridFCMService.sendTestNotification(title, body);
      
      if (!success) {
        setError('Test notification failed');
      }
    } catch (err) {
      console.error('💥 Test notification error:', err);
      setError(err instanceof Error ? err.message : 'Test notification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = await hybridFCMService.refreshToken();
      if (token) {
        setFcmStatus(hybridFCMService.getStatus());
        console.log('✅ Token refreshed successfully');
      } else {
        setError('Failed to refresh token');
      }
    } catch (err) {
      console.error('💥 Token refresh error:', err);
      setError(err instanceof Error ? err.message : 'Token refresh failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const clearError = () => {
    setError('');
  };

  const getPermissionIcon = () => {
    return fcmStatus.permission === 'granted' ? '✅' : fcmStatus.permission === 'denied' ? '❌' : '⏳';
  };

  const getPermissionText = () => {
    switch (fcmStatus.permission) {
      case 'granted': return 'Granted';
      case 'denied': return 'Denied';
      default: return 'Unknown';
    }
  };

  const getPermissionColor = () => {
    switch (fcmStatus.permission) {
      case 'granted': return 'text-green-600';
      case 'denied': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatMessageTime = (timestamp?: number) => {
    return new Date(timestamp || Date.now()).toLocaleTimeString('el-GR');
  };

  const getMessageIcon = (payload?: any) => {
    const type = payload?.data?.type || payload?.type;
    if (type?.includes('package')) return '📦';
    if (type?.includes('appointment')) return '📅';
    if (type?.includes('test')) return '🧪';
    return '🔥';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          🔥 Firebase Cloud Messaging (Hybrid)
        </h1>
        {user && (
          <p className="text-sm text-gray-600 mt-1">
            User: {user.name} • Platform: {isNative ? 'Mobile App' : 'Web Browser'}
          </p>
        )}
        <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs inline-block">
          {isNative ? '📱 Native FCM' : '🌐 Web FCM'}
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
              onClick={clearError}
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
            <div className="text-3xl mb-2">{fcmStatus.isInitialized ? '✅' : '❌'}</div>
            <h3 className="font-medium text-gray-800">FCM Service</h3>
            <p className="text-sm text-gray-600">{fcmStatus.isInitialized ? 'Active' : 'Inactive'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getPermissionIcon()}</div>
            <h3 className="font-medium text-gray-800">Permission</h3>
            <p className={`text-sm ${getPermissionColor()}`}>{getPermissionText()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{fcmStatus.hasToken ? '🔑' : '❌'}</div>
            <h3 className="font-medium text-gray-800">FCM Token</h3>
            <p className="text-sm text-gray-600">{fcmStatus.hasToken ? 'Available' : 'Missing'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{isNative ? '📱' : '🌐'}</div>
            <h3 className="font-medium text-gray-800">Platform</h3>
            <p className="text-sm text-gray-600">{fcmStatus.platform}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">FCM Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Initialize */}
          <button
            onClick={handleInitialize}
            disabled={isLoading || fcmStatus.isInitialized}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              fcmStatus.isInitialized 
                ? 'border-green-200 bg-green-50 text-green-800 cursor-not-allowed' 
                : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {fcmStatus.isInitialized ? '✅ FCM Active' : '🔥 Initialize FCM'}
                </h3>
                <p className="text-sm opacity-75">
                  {fcmStatus.isInitialized ? 'Service is running' : 'Start Firebase messaging'}
                </p>
              </div>
              {isLoading && (
                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
              )}
            </div>
          </button>

          {/* Refresh Token */}
          <button
            onClick={handleRefreshToken}
            disabled={!fcmStatus.isInitialized || isLoading}
            className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed text-left transition-colors"
          >
            <div>
              <h3 className="font-medium">🔄 Refresh Token</h3>
              <p className="text-sm opacity-75">Get new FCM token</p>
            </div>
          </button>

          {/* Clear Messages */}
          <button
            onClick={clearMessages}
            disabled={messages.length === 0}
            className="p-4 rounded-lg border-2 border-red-200 bg-red-50 text-red-800 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-left transition-colors"
          >
            <div>
              <h3 className="font-medium">🗑️ Clear Messages</h3>
              <p className="text-sm opacity-75">Clear message history</p>
            </div>
          </button>
        </div>
      </div>

      {/* Test Notification */}
      {fcmStatus.isInitialized && fcmStatus.permission === 'granted' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Test FCM Notification</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={testMessage.title}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Test FCM Notification"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <input
                  type="text"
                  value={testMessage.body}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, body: e.target.value }))}
                  placeholder={`🔥 Test FCM από ${isNative ? 'mobile app' : 'web browser'}!`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleSendTest}
              disabled={isLoading}
              className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '🔥 Sending...' : '🔥 Send Test FCM Notification'}
            </button>
          </div>
        </div>
      )}

      {/* Status Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">FCM Status Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Initialized:</span>
              <span className={`font-medium ${fcmStatus.isInitialized ? 'text-green-600' : 'text-red-600'}`}>
                {fcmStatus.isInitialized ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Has Token:</span>
              <span className={`font-medium ${fcmStatus.hasToken ? 'text-green-600' : 'text-red-600'}`}>
                {fcmStatus.hasToken ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Supported:</span>
              <span className={`font-medium ${fcmStatus.isSupported ? 'text-green-600' : 'text-red-600'}`}>
                {fcmStatus.isSupported ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Platform:</span>
              <span className="font-medium text-blue-600">{fcmStatus.platform}</span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Permission:</span>
              <span className={`font-medium ${getPermissionColor()}`}>{fcmStatus.permission}</span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Token Preview:</span>
              <span className="font-medium text-gray-600 text-xs">{fcmStatus.token || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      {messages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent FCM Messages</h2>
          
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">{getMessageIcon(message)}</span>
                      <h3 className="font-medium text-gray-800">
                        {message.notification?.title || message.title || 'Data Message'}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {message.type || 'FCM'}
                      </span>
                    </div>
                    
                    {(message.notification?.body || message.body) && (
                      <p className="text-gray-600 text-sm mb-2">
                        {message.notification?.body || message.body}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>🕐 {formatMessageTime()}</span>
                      {message.data?.type && (
                        <span>🏷️ {message.data.type}</span>
                      )}
                      {message.messageId && (
                        <span>🆔 {message.messageId.substring(0, 8)}...</span>
                      )}
                    </div>
                    
                    {message.data && Object.keys(message.data).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Data payload</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(message.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HybridFCMNotificationSettings;
