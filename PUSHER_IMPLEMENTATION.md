# Pusher Private Channels Implementation for Chat

## Overview
This implementation replaces the polling-based chat system with real-time Pusher private channels for instant message delivery.

## Configuration

### Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# API Configuration
VITE_API_URL=https://sweat93laravel.obs.com.gr

# Pusher Configuration
VITE_PUSHER_APP_KEY=YOUR_ACTUAL_PUSHER_KEY_HERE
VITE_PUSHER_CLUSTER=eu
VITE_PUSHER_FORCE_TLS=true
```

## Implementation Details

### 1. Pusher Service (`src/services/pusherService.ts`)
- Manages Pusher/Laravel Echo connection
- Handles authentication with Bearer token
- Subscribes to private channels
- Provides connection state monitoring

### 2. Chat Widget Integration (`src/components/chat/ChatWidget.tsx`)
- Initializes Pusher when user is authenticated
- Subscribes to `private-chat.{userId}` channel
- Listens for `ChatMessageReceived` events
- Updates UI in real-time when messages arrive
- Handles message deduplication
- Marks messages as read when chat is opened

### 3. Auth Context Integration (`src/contexts/AuthContext.tsx`)
- Disconnects Pusher on logout
- Ensures clean connection management

## Channel Structure

- **Channel Name**: `private-chat.{userId}`
- **Event Name**: `ChatMessageReceived`
- **Auth Endpoint**: `https://sweat93laravel.obs.com.gr/broadcasting/auth`

## Message Payload Structure

```javascript
{
  message: {
    id: number,
    content: string,
    sender_type: 'user' | 'admin',
    sender: {
      id: number,
      name: string,
      avatar?: string
    },
    created_at: string,
    is_read: boolean,
    conversation_id: number
  }
}
```

## Testing

### Using the Test Component
A test component is available at `src/components/chat/PusherTestComponent.tsx` for debugging:

1. Import and use the component in any page:
```tsx
import { PusherTestComponent } from '@/components/chat/PusherTestComponent';

// In your component
<PusherTestComponent />
```

2. The test component provides:
   - Connection state monitoring
   - Auth endpoint testing
   - Real-time message logging
   - Configuration display

### Manual Testing Steps

1. **Setup Environment**:
   - Add your Pusher app key to `.env` file
   - Restart the development server

2. **Test Authentication**:
   - Log in to the application
   - Open browser console
   - Look for "Pusher initialized for user X" message
   - Check for "Successfully subscribed to channel" message

3. **Test Real-time Messages**:
   - Open the chat widget
   - Have an admin send a message from the backend
   - Message should appear instantly without refresh
   - Check console for "New chat message received" logs

4. **Test Connection Recovery**:
   - Disconnect internet briefly
   - Reconnect
   - Pusher should automatically reconnect
   - Messages sent during disconnect should be received

## Troubleshooting

### Common Issues

1. **401 Unauthorized on /broadcasting/auth**:
   - Verify Bearer token is being sent
   - Check token is valid and not expired
   - Ensure user is authenticated

2. **Connection Issues**:
   - Verify Pusher app key is correct
   - Check cluster setting matches Pusher app configuration
   - Ensure forceTLS is enabled

3. **Messages Not Received**:
   - Verify channel name format: `private-chat.{userId}`
   - Check event name matches backend: `ChatMessageReceived`
   - Ensure user ID matches authenticated user

### Debug Mode
Enable Pusher debug logging by modifying `pusherService.ts`:

```javascript
this.echo = new Echo({
  // ... other config
  enabledTransports: ['ws', 'wss'],
  log: (msg) => console.log('[Pusher]', msg), // Add this line
});
```

## Security Notes

- Always use private channels for user-specific data
- Bearer token is required for authentication
- Auth endpoint validates user permissions
- Messages are only delivered to authorized users
- No sensitive data in channel names

## Acceptance Criteria Checklist

✅ App uses Bearer token authentication (no cookies)
✅ Subscribes to `private-chat.{userId}` after login
✅ Receives `ChatMessageReceived` events in real-time
✅ Updates chat UI instantly when messages arrive
✅ Auth endpoint (`/broadcasting/auth`) returns 200 OK
✅ No console errors in production
✅ Proper cleanup on logout/unmount