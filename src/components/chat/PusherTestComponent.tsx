import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pusherService } from '@/services/pusherService';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export function PusherTestComponent() {
  const { user, isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Initialize Pusher
          pusherService.initialize(user.id, token);
          
          // Subscribe to chat channel
          const channel = pusherService.subscribeToChat(user.id, (payload: any) => {
            console.log('Test Component - Message received:', payload);
            setReceivedMessages(prev => [...prev, {
              timestamp: new Date().toISOString(),
              payload
            }]);
          });

          // Check connection state periodically
          const interval = setInterval(() => {
            const state = pusherService.getConnectionState();
            setConnectionState(state);
          }, 1000);

          return () => {
            clearInterval(interval);
            if (channel) {
              // Channel cleanup handled by pusherService
            }
          };
        } catch (err) {
          console.error('Pusher initialization error:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    }
  }, [isAuthenticated, user?.id]);

  const testAuthEndpoint = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('No auth token found');
      return;
    }

    try {
      const response = await fetch('https://sweat93laravel.obs.com.gr/broadcasting/auth', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: `socket_id=test.123&channel_name=private-chat.${user?.id}`
      });

      const data = await response.json();
      console.log('Auth endpoint response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        setError(`Auth failed: ${response.status} - ${JSON.stringify(data)}`);
      } else {
        setError(null);
        alert('Auth endpoint test successful! Check console for details.');
      }
    } catch (err) {
      console.error('Auth endpoint test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <p>Please log in to test Pusher functionality.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Pusher Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">User ID:</span>
            <span>{user?.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Channel:</span>
            <span>private-chat.{user?.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Connection State:</span>
            <Badge variant={
              connectionState === 'connected' ? 'default' : 
              connectionState === 'connecting' ? 'secondary' : 
              'destructive'
            }>
              {connectionState}
            </Badge>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            Error: {error}
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={testAuthEndpoint} variant="outline">
            Test Auth Endpoint
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Received Messages ({receivedMessages.length})</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {receivedMessages.map((msg, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <div className="text-xs text-gray-500">{msg.timestamp}</div>
                <pre className="mt-1 text-xs overflow-x-auto">
                  {JSON.stringify(msg.payload, null, 2)}
                </pre>
              </div>
            ))}
            {receivedMessages.length === 0 && (
              <p className="text-sm text-gray-500">No messages received yet.</p>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>Configuration:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Pusher Key: {import.meta.env.VITE_PUSHER_APP_KEY || 'YOUR_PUSHER_APP_KEY'}</li>
            <li>Cluster: {import.meta.env.VITE_PUSHER_CLUSTER || 'eu'}</li>
            <li>Auth Endpoint: https://sweat93laravel.obs.com.gr/broadcasting/auth</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}