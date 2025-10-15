# 🔥 Modern Firebase Cloud Messaging (HTTP v1) Implementation

## 📋 Why This Change?

Google deprecated the Legacy FCM API on 20/6/2023. The new **HTTP v1 API** is more secure and feature-rich.

## 🔧 Laravel Implementation (HTTP v1)

### 1. Install Dependencies

```bash
composer require google/auth kreait/firebase-php
```

### 2. Get Service Account JSON

1. **Firebase Console** → **Project Settings** → **Service Accounts**
2. **Generate new private key** → Download JSON
3. **Save as**: `storage/app/firebase-service-account.json`

### 3. Environment Variables

Update `.env`:

```env
# Firebase Configuration (HTTP v1)
FIREBASE_PROJECT_ID=sweat93-89bb8
FIREBASE_SERVICE_ACCOUNT_PATH=storage/app/firebase-service-account.json
```

### 4. Modern FCM Service

Create `app/Services/ModernFCMService.php`:

```php
<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ModernFCMService
{
    private $projectId;
    private $serviceAccountPath;
    
    public function __construct()
    {
        $this->projectId = config('services.firebase.project_id');
        $this->serviceAccountPath = config('services.firebase.service_account_path');
    }

    /**
     * Get OAuth2 Access Token for FCM API
     */
    private function getAccessToken()
    {
        try {
            $credentialsPath = storage_path('app/firebase-service-account.json');
            
            if (!file_exists($credentialsPath)) {
                throw new \Exception('Firebase service account JSON not found');
            }

            $credentials = new ServiceAccountCredentials(
                'https://www.googleapis.com/auth/cloud-platform',
                json_decode(file_get_contents($credentialsPath), true)
            );

            $token = $credentials->fetchAuthToken();
            return $token['access_token'];
        } catch (\Exception $e) {
            Log::error('Failed to get FCM access token', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Send FCM notification to single token (HTTP v1)
     */
    public function sendToToken($token, $title, $body, $data = [])
    {
        $message = [
            'message' => [
                'token' => $token,
                'notification' => [
                    'title' => $title,
                    'body' => $body
                ],
                'data' => array_map('strval', $data), // FCM requires string values
                'android' => [
                    'notification' => [
                        'icon' => 'ic_notification',
                        'color' => '#FF6B35',
                        'sound' => 'default',
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK'
                    ]
                ],
                'apns' => [
                    'payload' => [
                        'aps' => [
                            'sound' => 'default',
                            'badge' => 1
                        ]
                    ]
                ],
                'webpush' => [
                    'notification' => [
                        'icon' => '/logo-light.png',
                        'badge' => '/logo-light.png',
                        'requireInteraction' => true
                    ]
                ]
            ]
        ];

        return $this->sendFCMRequest($message);
    }

    /**
     * Send FCM notification to multiple tokens
     */
    public function sendToTokens($tokens, $title, $body, $data = [])
    {
        $results = [];
        
        foreach ($tokens as $token) {
            $result = $this->sendToToken($token, $title, $body, $data);
            $results[] = $result;
            
            // Small delay to avoid rate limiting
            usleep(100000); // 0.1 second
        }
        
        return $results;
    }

    /**
     * Send FCM notification to topic
     */
    public function sendToTopic($topic, $title, $body, $data = [])
    {
        $message = [
            'message' => [
                'topic' => $topic,
                'notification' => [
                    'title' => $title,
                    'body' => $body
                ],
                'data' => array_map('strval', $data),
                'android' => [
                    'notification' => [
                        'icon' => 'ic_notification',
                        'color' => '#FF6B35',
                        'sound' => 'default'
                    ]
                ],
                'apns' => [
                    'payload' => [
                        'aps' => [
                            'sound' => 'default'
                        ]
                    ]
                ]
            ]
        ];

        return $this->sendFCMRequest($message);
    }

    /**
     * Send request to FCM HTTP v1 API
     */
    private function sendFCMRequest($message)
    {
        try {
            $accessToken = $this->getAccessToken();
            $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])->post($url, $message);

            $result = $response->json();

            if ($response->successful()) {
                Log::info('FCM notification sent successfully (HTTP v1)', $result);
                return [
                    'success' => true,
                    'response' => $result,
                    'message_id' => $result['name'] ?? null
                ];
            } else {
                Log::error('FCM notification failed (HTTP v1)', [
                    'status' => $response->status(),
                    'response' => $result,
                    'message' => $message
                ]);
                return [
                    'success' => false,
                    'error' => $result,
                    'status' => $response->status()
                ];
            }
        } catch (\Exception $e) {
            Log::error('FCM request exception (HTTP v1)', [
                'message' => $e->getMessage(),
                'payload' => $message
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Validate FCM token
     */
    public function validateToken($token)
    {
        try {
            // Send a dry-run message to validate token
            $message = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => 'Test',
                        'body' => 'Validation'
                    ]
                ],
                'validate_only' => true
            ];

            $result = $this->sendFCMRequest($message);
            return $result['success'];
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Subscribe token to topic
     */
    public function subscribeToTopic($tokens, $topic)
    {
        try {
            $accessToken = $this->getAccessToken();
            $url = "https://iid.googleapis.com/iid/v1:batchAdd";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'to' => '/topics/' . $topic,
                'registration_tokens' => is_array($tokens) ? $tokens : [$tokens]
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to subscribe to topic', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
```

### 5. Update Config

Add to `config/services.php`:

```php
'firebase' => [
    'project_id' => env('FIREBASE_PROJECT_ID'),
    'service_account_path' => env('FIREBASE_SERVICE_ACCOUNT_PATH'),
],
```

### 6. Updated Controller

Update your `NotificationController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Services\ModernFCMService;
use App\Models\UserPushToken;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $fcmService;

    public function __construct(ModernFCMService $fcmService)
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
        
        // Validate token with FCM
        $isValid = $this->fcmService->validateToken($request->token);
        
        if (!$isValid) {
            return response()->json([
                'message' => 'Invalid FCM token',
                'success' => false
            ], 400);
        }
        
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
     * Send test notification (HTTP v1)
     */
    public function sendTestNotification(Request $request)
    {
        $request->validate([
            'title' => 'string|nullable',
            'body' => 'string|nullable'
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
        $results = $this->fcmService->sendToTokens($tokens, $title, $body, [
            'type' => 'test',
            'user_id' => (string) $user->id
        ]);

        $successCount = count(array_filter($results, fn($r) => $r['success']));

        return response()->json([
            'message' => "Test notification sent to {$successCount}/{count($tokens)} devices",
            'success' => $successCount > 0,
            'details' => $results
        ]);
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

## 🧪 Testing the Modern Implementation

### Test directly:

```php
// In tinker
$fcmService = new \App\Services\ModernFCMService();
$result = $fcmService->sendToToken(
    'user_token_here',
    'Modern FCM Test',
    'This uses HTTP v1 API!',
    ['type' => 'test']
);
```

## 🎯 Benefits of HTTP v1:

- ✅ **More secure** (OAuth2 vs API key)
- ✅ **Better error handling**
- ✅ **Token validation**
- ✅ **Future-proof** (won't be deprecated)
- ✅ **More features** (topics, conditions, etc.)

## 📋 Migration Checklist:

- [ ] Download service account JSON
- [ ] Install dependencies
- [ ] Update environment variables
- [ ] Replace FCM service with modern version
- [ ] Test notifications
- [ ] Update scheduled notification sender
