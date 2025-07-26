import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

window.Pusher = Pusher;

// Determine if we're in a native app environment
const isNativeApp = Capacitor.isNativePlatform();

// Configure WebSocket settings based on environment
const wsConfig = {
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'sweat24appkey',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'sweat93laravel.obs.com.gr',
    wsPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    // Disable stats for native apps to reduce connection overhead
    disableStats: isNativeApp,
    // Add connection timeout for better error handling
    authEndpoint: 'https://sweat93laravel.obs.com.gr/api/v1/broadcasting/auth',
    auth: {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        }
    },
    authorizer: (channel: any, options: any) => {
        return {
            authorize: (socketId: string, callback: Function) => {
                const authToken = localStorage.getItem('auth_token');
                
                if (!authToken) {
                    callback('No auth token available', null);
                    return;
                }
                
                fetch('https://sweat93laravel.obs.com.gr/api/v1/broadcasting/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json',
                        // Add Origin header for native apps
                        ...(isNativeApp ? { 'Origin': 'capacitor://localhost' } : {})
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Authorization failed: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => callback(null, data))
                .catch(error => {
                    console.error('WebSocket authorization error:', error);
                    callback(error, null);
                });
            }
        };
    }
};

export const echo = new Echo(wsConfig);

// Make echo available globally for debugging
window.Echo = echo; 