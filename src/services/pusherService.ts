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
      key: import.meta.env.VITE_PUSHER_APP_KEY || 'YOUR_PUSHER_APP_KEY',
      cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'eu',
      forceTLS: import.meta.env.VITE_PUSHER_FORCE_TLS !== 'false',
      authEndpoint: 'https://sweat93laravel.obs.com.gr/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      // Disable Pusher logging in production
      enabledTransports: ['ws', 'wss'],
    });

    this.isInitialized = true;
    console.log('Pusher initialized for user', userId);
  }

  subscribeToChat(userId: number, onMessageReceived: (payload: any) => void) {
    if (!this.echo) {
      console.error('Pusher not initialized. Call initialize() first.');
      return null;
    }

    const channelName = `chat.${userId}`;
    console.log('Subscribing to private channel:', channelName);

    // Subscribe to private channel
    const channel = this.echo.private(channelName);

    // Listen for ChatMessageReceived event
    channel.listen('ChatMessageReceived', (payload: any) => {
      console.log('New chat message received:', payload);
      onMessageReceived(payload);
    });

    // Handle subscription success
    channel.subscribed(() => {
      console.log('Successfully subscribed to channel:', channelName);
    });

    // Handle subscription error
    channel.error((error: any) => {
      console.error('Channel subscription error:', error);
    });

    return channel;
  }

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
      this.isInitialized = false;
      this.userId = null;
      console.log('Pusher disconnected');
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