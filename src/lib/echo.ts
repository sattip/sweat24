import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

window.Pusher = Pusher;

// CORRECT PUSHER CONFIGURATION - NOT REVERB!
export const echo = new Echo({
    broadcaster: 'pusher',  // Changed from 'reverb' to 'pusher'
    key: '9a32af76b0f65715f3ea',  // Changed from 'sweat24appkey' to correct Pusher key
    cluster: 'eu',
    forceTLS: true,
    authEndpoint: 'https://sweat93laravel.obs.com.gr/api/v1/broadcasting/auth',
    auth: {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    },
});

// Make echo available globally for debugging
window.Echo = echo; 