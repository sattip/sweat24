import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

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
      console.log('Pusher already initialized for user', userId);
      return;
    }

    // Clean up existing connection if user changed
    if (this.echo && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId;

    // Make Pusher available globally as required by Laravel Echo
    window.Pusher = Pusher;

    // Initialize Laravel Echo with Pusher
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY || '9a32af76b0f65715f3ea',
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'eu',
      forceTLS: true,
      authEndpoint: 'https://sweat93laravel.obs.com.gr/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      // Enable debug logging to troubleshoot
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
    });

    this.isInitialized = true;
  }

  subscribeToChat(userId: number, onMessageReceived: (payload: any) => void) {
    if (!this.echo) {
      console.error('Pusher not initialized. Call initialize() first.');
      return null;
    }

    // Use the correct channel name format from backend
    const channelName = `chat.${userId}`;
    // Subscribe to private channel
    const channel = this.echo.private(channelName);

    // Listen for ChatMessageReceived event
    channel.listen('ChatMessageReceived', (payload: any) => {
      onMessageReceived(payload);
    });

    // Handle subscription error
    channel.error((error: any) => {
      if (import.meta.env.DEV) {
        console.error('Channel subscription error:', error);
      }
    });

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