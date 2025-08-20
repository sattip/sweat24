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
      key: '9a32af76b0f65715f3ea', // From backend config
      cluster: 'eu', // From backend config
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
    console.log('✅ Pusher initialized for user', userId);
    
    // Debug: Log connection state changes
    const pusher = (this.echo?.connector as any)?.pusher;
    if (pusher) {
      pusher.connection.bind('state_change', (states: any) => {
        console.log('🔌 Pusher connection state:', states.current);
      });
      
      pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully');
      });
      
      pusher.connection.bind('error', (error: any) => {
        console.error('❌ Pusher connection error:', error);
      });
    }
  }

  subscribeToChat(userId: number, onMessageReceived: (payload: any) => void) {
    if (!this.echo) {
      console.error('Pusher not initialized. Call initialize() first.');
      return null;
    }

    // Use the correct channel name format from backend
    const channelName = `chat.${userId}`;
    console.log('🔌 Subscribing to private channel:', `private-${channelName}`);

    // Subscribe to private channel
    const channel = this.echo.private(channelName);

    // Listen for both possible event names (until backend adds broadcastAs)
    // Option 1: Default Laravel event class name
    channel.listen('ChatMessageReceived', (payload: any) => {
      console.log('📨 New message via ChatMessageReceived event:', payload);
      onMessageReceived(payload);
    });

    // Option 2: Custom broadcast name (after backend adds broadcastAs)
    channel.listen('.message.received', (payload: any) => {
      console.log('📨 New message via message.received event:', payload);
      onMessageReceived(payload);
    });

    // Handle subscription success
    channel.subscribed(() => {
      console.log('✅ Successfully subscribed to channel:', `private-${channelName}`);
    });

    // Handle subscription error
    channel.error((error: any) => {
      console.error('❌ Channel subscription error:', error);
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