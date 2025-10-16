import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { API_URL } from '@/config/api';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

window.Pusher = Pusher;

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };
};

// Get broadcasting auth endpoint from API_URL
const BROADCASTING_AUTH_ENDPOINT = `${API_URL}/broadcasting/auth`;

// CORRECT PUSHER CONFIGURATION - NOT REVERB!
export const echo = new Echo({
  broadcaster: 'pusher',
  key: '9a32af76b0f65715f3ea',
  cluster: 'eu',
  forceTLS: true,
  authEndpoint: BROADCASTING_AUTH_ENDPOINT,
  authorizer: (channel) => {
    return {
      authorize: (socketId: string, callback: (error: boolean, data: any) => void) => {
        const headers = getAuthHeaders();
        const body = `socket_id=${encodeURIComponent(socketId)}&channel_name=${encodeURIComponent(channel.name)}`;

        fetch(BROADCASTING_AUTH_ENDPOINT, {
          method: 'POST',
          headers,
          body,
        })
          .then(async (response) => {
            if (response.ok) {
              const data = await response.json();
              callback(false, data);
              return;
            }

            const errorText = await response.text().catch(() => '');
            console.error('🔐 Broadcasting auth failed', {
              status: response.status,
              channel: channel.name,
              body,
              response: errorText,
            });
            callback(true, new Error(`Auth failed with status ${response.status}`));
          })
          .catch((error) => {
            console.error('🔐 Broadcasting auth request error:', error);
            callback(true, error);
          });
      },
    };
  },
});

export const refreshEchoAuthHeaders = () => {
  const updatedHeaders = getAuthHeaders();

  if (echo && (echo as any).options?.auth) {
    (echo as any).options.auth.headers = updatedHeaders;
  }

  const connector = (echo as any).connector;
  const pusher = connector?.pusher;

  if (pusher?.config?.auth) {
    pusher.config.auth.headers = updatedHeaders;
  }
};

// Make echo available globally for debugging
window.Echo = echo;
