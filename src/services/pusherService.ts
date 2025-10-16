import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { API_URL } from '@/config/api';

declare global {
  interface Window {
    Echo: Echo;
    Pusher: typeof Pusher;
  }
}

class PusherService {
  private echo: Echo | null = null;
  private userId: number | null = null;
  private isInitialized = false;

  initialize(userId: number, token: string) {
    if (this.isInitialized && this.userId === userId) {
      return;
    }

    // Clean up existing connection if user changed
    if (this.echo && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId;

    // Make Pusher available globally as required by Laravel Echo
    window.Pusher = Pusher;

    // Initialize Laravel Echo with Pusher - Custom authorizer
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY || '9a32af76b0f65715f3ea',
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'eu',
      forceTLS: true,
      // Custom authorizer to fix 403 issue
      authorizer: (channel: any, options: any) => {
        return {
          authorize: (socketId: string, callback: any) => {
            fetch(`${API_URL}/broadcasting/auth`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: `socket_id=${socketId}&channel_name=${channel.name}`
            })
            .then(response => {
              if (response.status === 200) {
                return response.json();
              } else {
                // Only log auth failures once, not repeatedly
                if (!sessionStorage.getItem(`auth_failed_${channel.name}`)) {
                  sessionStorage.setItem(`auth_failed_${channel.name}`, 'true');
                }
                throw new Error(`Auth failed with status: ${response.status}`);
              }
            })
            .then(data => {
              callback(false, data);
            })
            .catch(error => {
              // Silently fail for private channels - they spam the console
              callback(true, error);
            });
          }
        };
      },
      // Enable debug logging to troubleshoot
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
    });

    // DEBUG: Add connection event listeners
    const pusher = (this.echo.connector as any)?.pusher;
    if (pusher) {
      pusher.connection.bind('error', (err: any) => {
        // Only log connection errors once to avoid spam
        if (!sessionStorage.getItem('pusher_error_logged')) {
          console.error('❌ Pusher connection error:', err);
          sessionStorage.setItem('pusher_error_logged', 'true');
        }
      });
    }

    this.isInitialized = true;
  }

  subscribeToChat(userId: number, onMessageReceived: (payload: any) => void) {
    if (!this.echo) {
      console.error('Pusher not initialized. Call initialize() first.');
      return null;
    }

    // Use the correct channel name format from backend
    // Backend sends to private-chat.{userId}
    const channelName = `chat.${userId}`;
    // Subscribe to private channel (Echo automatically adds 'private-' prefix)
    const channel = this.echo.private(channelName);

    channel.error((error: any) => {
      console.error('❌ Subscription failed for private-chat.' + userId + ':', error);
    });

    // Listen for ChatMessageReceived event
    channel.listen('ChatMessageReceived', (payload: any) => {
      onMessageReceived(payload);
    });

    // DEBUG: Test auth endpoint manually
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch(`${API_URL}/broadcasting/auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `channel_name=private-chat.${userId}&socket_id=test`
      })
      .then(response => {
        return response.text();
      })
      .catch(err => {
        console.error('🔐 Auth endpoint test failed:', err);
      });
    }

    return channel;
  }

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
      this.isInitialized = false;
      this.userId = null;
      // Disconnected
    }
  }

  getConnectionState() {
    if (!this.echo) {
      return 'disconnected';
    }
    
    // Access the underlying Pusher connection state
    const pusher = (this.echo.connector as any)?.pusher;
    return pusher?.connection?.state || 'unknown';
  }
}

export const pusherService = new PusherService();