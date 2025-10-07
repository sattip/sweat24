# 🔥 Backend FCM Implementation Guide

## 📋 Required Environment Variables

Add to your Laravel `.env` file:

```env
# Firebase Cloud Messaging
FIREBASE_SERVER_KEY=your_server_key_from_firebase_console
FIREBASE_SENDER_ID=367901918033
FIREBASE_PROJECT_ID=sweat93-89bb8
```

## 🔧 Laravel Implementation

### 1. Create FCM Service

Create `app/Services/FCMService.php`:

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FCMService
{
    private $serverKey;
    private $senderId;
    
    public function __construct()
    {
        $this->serverKey = config('services.firebase.server_key');
        $this->senderId = config('services.firebase.sender_id');
    }

    /**
     * Send FCM notification to single token
     */
    public function sendToToken($token, $title, $body, $data = [])
    {
        $payload = [
            'to' => $token,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'icon' => '/logo-light.png',
                'badge' => '/logo-light.png',
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK'
            ],
            'data' => array_merge($data, [
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK'
            ])
        ];

        return $this->sendFCMRequest($payload);
    }

    /**
     * Send FCM notification to multiple tokens
     */
    public function sendToTokens($tokens, $title, $body, $data = [])
    {
        $payload = [
            'registration_ids' => $tokens,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'icon' => '/logo-light.png',
                'badge' => '/logo-light.png',
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK'
            ],
            'data' => array_merge($data, [
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK'
            ])
        ];

        return $this->sendFCMRequest($payload);
    }

    /**
     * Send FCM notification to topic
     */
    public function sendToTopic($topic, $title, $body, $data = [])
    {
        $payload = [
            'to' => '/topics/' . $topic,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'icon' => '/logo-light.png',
                'badge' => '/logo-light.png'
            ],
            'data' => $data
        ];

        return $this->sendFCMRequest($payload);
    }

    /**
     * Send request to FCM servers
     */
    private function sendFCMRequest($payload)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $this->serverKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', $payload);

            $result = $response->json();

            if ($response->successful()) {
                Log::info('FCM notification sent successfully', $result);
                return [
                    'success' => true,
                    'response' => $result
                ];
            } else {
                Log::error('FCM notification failed', [
                    'status' => $response->status(),
                    'response' => $result
                ]);
                return [
                    'success' => false,
                    'error' => $result
                ];
            }
        } catch (\Exception $e) {
            Log::error('FCM request exception', [
                'message' => $e->getMessage(),
                'payload' => $payload
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
```

### 2. Update Config

Add to `config/services.php`:

```php
'firebase' => [
    'server_key' => env('FIREBASE_SERVER_KEY'),
    'sender_id' => env('FIREBASE_SENDER_ID'),
    'project_id' => env('FIREBASE_PROJECT_ID'),
],
```

### 3. Update Notification Controller

Update your existing `NotificationController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Services\FCMService;
use App\Models\UserPushToken;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $fcmService;

    public function __construct(FCMService $fcmService)
    {
        $this->fcmService = $fcmService;
    }

    /**
     * Store push token
     */
    public function storePushToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'platform' => 'required|string',
            'type' => 'string|nullable'
        ]);

        $user = auth()->user();
        
        // Update or create token
        UserPushToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'platform' => $request->platform
            ],
            [
                'token' => $request->token,
                'is_active' => true,
                'device_info' => $request->device_info ?? null
            ]
        );

        return response()->json([
            'message' => 'Push token stored successfully',
            'success' => true
        ]);
    }

    /**
     * Send test notification
     */
    public function sendTestNotification(Request $request)
    {
        $request->validate([
            'title' => 'string|nullable',
            'body' => 'string|nullable',
            'platform' => 'string|nullable'
        ]);

        $user = auth()->user();
        $title = $request->title ?? 'Test Notification';
        $body = $request->body ?? 'This is a test notification from Sweat93! 🔥';

        // Get user's active tokens
        $tokens = UserPushToken::where('user_id', $user->id)
            ->where('is_active', true)
            ->pluck('token')
            ->toArray();

        if (empty($tokens)) {
            return response()->json([
                'message' => 'No active push tokens found for user',
                'success' => false
            ], 400);
        }

        // Send to all user's devices
        $result = $this->fcmService->sendToTokens($tokens, $title, $body, [
            'type' => 'test',
            'user_id' => $user->id
        ]);

        if ($result['success']) {
            return response()->json([
                'message' => 'Test notification sent successfully',
                'success' => true,
                'details' => $result['response']
            ]);
        } else {
            return response()->json([
                'message' => 'Failed to send test notification',
                'success' => false,
                'error' => $result['error']
            ], 500);
        }
    }

    /**
     * Schedule notification
     */
    public function scheduleNotification(Request $request)
    {
        $request->validate([
            'id' => 'required|string',
            'type' => 'required|string',
            'title' => 'required|string',
            'body' => 'required|string',
            'scheduled_for' => 'required|date',
            'user_id' => 'required|integer',
            'related_id' => 'integer|nullable',
            'data' => 'array|nullable'
        ]);

        // Store in scheduled_notifications table
        \App\Models\ScheduledNotification::create([
            'id' => $request->id,
            'user_id' => $request->user_id,
            'type' => $request->type,
            'title' => $request->title,
            'body' => $request->body,
            'scheduled_for' => $request->scheduled_for,
            'related_id' => $request->related_id,
            'data' => $request->data
        ]);

        return response()->json([
            'message' => 'Notification scheduled successfully',
            'success' => true
        ]);
    }
}
```

### 4. Update Routes

Add to `routes/api.php`:

```php
// Push notification routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/users/push-token', [NotificationController::class, 'storePushToken']);
    Route::post('/notifications/test', [NotificationController::class, 'sendTestNotification']);
    Route::post('/notifications/schedule', [NotificationController::class, 'scheduleNotification']);
    Route::delete('/notifications/cancel/{id}', [NotificationController::class, 'cancelNotification']);
    Route::get('/users/{id}/notifications', [NotificationController::class, 'getUserNotifications']);
});
```

## 🚀 Testing

### 1. Test FCM Service directly:

```php
// In tinker or test route
$fcmService = new \App\Services\FCMService();
$result = $fcmService->sendToToken(
    'user_token_here',
    'Test Title',
    'Test Body',
    ['type' => 'test']
);
```

### 2. Test via API:

```bash
curl -X POST https://api.sweat93.gr/api/v1/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Hello from API"}'
```

## ⚙️ Scheduled Notifications (Cron Job)

Create `app/Console/Commands/SendScheduledNotifications.php`:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ScheduledNotification;
use App\Services\FCMService;
use Carbon\Carbon;

class SendScheduledNotifications extends Command
{
    protected $signature = 'notifications:send-scheduled';
    protected $description = 'Send scheduled notifications';

    public function handle()
    {
        $fcmService = new FCMService();
        
        $notifications = ScheduledNotification::where('scheduled_for', '<=', Carbon::now())
            ->where('is_sent', false)
            ->get();

        foreach ($notifications as $notification) {
            $user = $notification->user;
            $tokens = $user->pushTokens()->where('is_active', true)->pluck('token')->toArray();

            if (!empty($tokens)) {
                $result = $fcmService->sendToTokens(
                    $tokens,
                    $notification->title,
                    $notification->body,
                    $notification->data ?? []
                );

                if ($result['success']) {
                    $notification->update([
                        'is_sent' => true,
                        'sent_at' => Carbon::now()
                    ]);
                }
            }
        }

        $this->info('Scheduled notifications processed: ' . $notifications->count());
    }
}
```

Add to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('notifications:send-scheduled')->everyMinute();
}
```
