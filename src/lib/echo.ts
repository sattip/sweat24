import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

window.Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'sweat24appkey',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'sweat93laravel.obs.com.gr',
    wsPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: any, options: any) => {
        return {
            authorize: (socketId: string, callback: Function) => {
                fetch('https://sweat93laravel.obs.com.gr/api/v1/broadcasting/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                })
                .then(response => response.json())
                .then(data => callback(null, data))
                .catch(error => callback(error, null));
            }
        };
    }
});

// Make echo available globally for debugging
window.Echo = echo; 