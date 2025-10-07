# 📱 PUSH NOTIFICATIONS SYSTEM - Backend Implementation Requirements

## 🎯 **ΣΤΟΧΟΣ ΣΥΣΤΗΜΑΤΟΣ**

Υλοποίηση push notification system για:
1. **📅 Package Expiry Notifications** - 1 εβδομάδα και 2 μέρες πριν τη λήξη
2. **⏰ Appointment Reminders** - 1 ώρα πριν το ραντεβού/μάθημα

---

## 🗄️ **1. DATABASE SCHEMA**

### **Πίνακας `user_push_tokens`:**
```sql
CREATE TABLE user_push_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token TEXT NOT NULL,
    platform ENUM('ios', 'android', 'web') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, is_active)
);
```

### **Πίνακας `scheduled_notifications`:**
```sql
CREATE TABLE scheduled_notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('package_expiry_week', 'package_expiry_2days', 'appointment_reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    scheduled_for DATETIME NOT NULL,
    related_id BIGINT UNSIGNED NULL COMMENT 'package_id ή appointment_id',
    data JSON NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_scheduled_pending (scheduled_for, is_sent),
    INDEX idx_user_notifications (user_id)
);
```

### **Πίνακας `notification_logs`:**
```sql
CREATE TABLE notification_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(255) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    push_token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL,
    status ENUM('success', 'failed', 'invalid_token') NOT NULL,
    response_data JSON NULL,
    error_message TEXT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_status (notification_id, status),
    INDEX idx_user_logs (user_id, sent_at)
);
```

---

## 📡 **2. API ENDPOINTS**

### **A. Push Token Management**

#### **Store/Update Push Token:**
```
POST /api/v1/users/push-token
```

**Request:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push token saved successfully"
}
```

#### **Delete Push Token:**
```
DELETE /api/v1/users/push-token
```

### **B. Notification Scheduling**

#### **Schedule Notification:**
```
POST /api/v1/notifications/schedule
```

**Request:**
```json
{
  "id": "package_expiry_week_123",
  "type": "package_expiry_week",
  "title": "📅 Λήξη Πακέτου σε 1 Εβδομάδα",
  "body": "Το πακέτο σας λήγει σε 7 μέρες...",
  "scheduled_for": "2024-12-15T10:00:00Z",
  "user_id": 123,
  "related_id": 456,
  "data": {
    "type": "package_expiry",
    "related_id": 456
  }
}
```

#### **Cancel Notification:**
```
DELETE /api/v1/notifications/cancel/{notificationId}
```

#### **Get User Notifications:**
```
GET /api/v1/users/{id}/notifications
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "package_expiry_week_123",
      "type": "package_expiry_week",
      "title": "📅 Λήξη Πακέτου σε 1 Εβδομάδα",
      "body": "Το πακέτο σας λήγει σε 7 μέρες...",
      "scheduled_for": "2024-12-15T10:00:00Z",
      "is_sent": false
    }
  ]
}
```

### **C. Test Notification**

#### **Send Test Notification:**
```
POST /api/v1/notifications/test
```

**Request:**
```json
{
  "title": "Test Notification",
  "body": "Δοκιμαστική ειδοποίηση",
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

---

## 🔧 **3. PHP IMPLEMENTATION (Laravel)**

### **A. Models**

#### **UserPushToken Model:**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPushToken extends Model
{
    protected $fillable = [
        'user_id',
        'token', 
        'platform',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function saveToken(int $userId, string $token, string $platform)
    {
        return static::updateOrCreate(
            [
                'user_id' => $userId,
                'platform' => $platform
            ],
            [
                'token' => $token,
                'is_active' => true
            ]
        );
    }
}
```

#### **ScheduledNotification Model:**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduledNotification extends Model
{
    protected $fillable = [
        'id',
        'user_id',
        'type',
        'title',
        'body',
        'scheduled_for',
        'related_id',
        'data',
        'is_sent',
        'sent_at'
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'data' => 'array',
        'is_sent' => 'boolean',
        'sent_at' => 'datetime'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### **B. Controller**

#### **NotificationController:**
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPushToken;
use App\Models\ScheduledNotification;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        private PushNotificationService $pushService
    ) {}

    /**
     * Store/Update push token
     */
    public function storePushToken(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'platform' => 'required|in:ios,android,web'
        ]);

        $userId = auth()->id();
        
        UserPushToken::saveToken(
            $userId,
            $validated['token'],
            $validated['platform']
        );

        return response()->json([
            'success' => true,
            'message' => 'Push token saved successfully'
        ]);
    }

    /**
     * Delete push token
     */
    public function deletePushToken(Request $request)
    {
        $userId = auth()->id();
        
        UserPushToken::where('user_id', $userId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Push token deleted successfully'
        ]);
    }

    /**
     * Schedule notification
     */
    public function scheduleNotification(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:scheduled_notifications,id',
            'type' => 'required|in:package_expiry_week,package_expiry_2days,appointment_reminder',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'scheduled_for' => 'required|date',
            'user_id' => 'required|exists:users,id',
            'related_id' => 'nullable|integer',
            'data' => 'nullable|array'
        ]);

        ScheduledNotification::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Notification scheduled successfully'
        ]);
    }

    /**
     * Cancel notification
     */
    public function cancelNotification(string $notificationId)
    {
        $notification = ScheduledNotification::find($notificationId);
        
        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification cancelled successfully'
        ]);
    }

    /**
     * Get user notifications
     */
    public function getUserNotifications(int $userId)
    {
        $notifications = ScheduledNotification::where('user_id', $userId)
            ->where('is_sent', false)
            ->where('scheduled_for', '>', now())
            ->orderBy('scheduled_for')
            ->get();

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    /**
     * Send test notification
     */
    public function sendTestNotification(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'body' => 'required|string',
            'token' => 'required|string'
        ]);

        $result = $this->pushService->sendToToken(
            $validated['token'],
            $validated['title'],
            $validated['body']
        );

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message']
        ]);
    }
}
```

### **C. Push Notification Service**

#### **PushNotificationService:**
```php
<?php

namespace App\Services;

use App\Models\UserPushToken;
use App\Models\NotificationLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    private $fcmServerKey;
    private $expoAccessToken;

    public function __construct()
    {
        $this->fcmServerKey = config('services.fcm.server_key');
        $this->expoAccessToken = config('services.expo.access_token');
    }

    /**
     * Send notification to specific token
     */
    public function sendToToken(string $token, string $title, string $body, array $data = [])
    {
        try {
            if (str_starts_with($token, 'ExponentPushToken')) {
                return $this->sendExpoNotification($token, $title, $body, $data);
            } else {
                return $this->sendFCMNotification($token, $title, $body, $data);
            }
        } catch (\Exception $e) {
            Log::error('Push notification failed', [
                'token' => $token,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Send notification to user (all devices)
     */
    public function sendToUser(int $userId, string $title, string $body, array $data = [])
    {
        $tokens = UserPushToken::where('user_id', $userId)
            ->where('is_active', true)
            ->get();

        $results = [];
        foreach ($tokens as $tokenModel) {
            $result = $this->sendToToken(
                $tokenModel->token,
                $title,
                $body,
                $data
            );

            // Log result
            NotificationLog::create([
                'notification_id' => $data['notification_id'] ?? 'manual',
                'user_id' => $userId,
                'push_token' => $tokenModel->token,
                'platform' => $tokenModel->platform,
                'status' => $result['success'] ? 'success' : 'failed',
                'response_data' => $result,
                'error_message' => $result['success'] ? null : $result['message']
            ]);

            $results[] = $result;
        }

        return $results;
    }

    /**
     * Send Expo notification
     */
    private function sendExpoNotification(string $token, string $title, string $body, array $data = [])
    {
        $payload = [
            'to' => $token,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'sound' => 'default',
            'badge' => 1
        ];

        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Accept-encoding' => 'gzip, deflate',
            'Content-Type' => 'application/json'
        ])->post('https://exp.host/--/api/v2/push/send', $payload);

        if ($response->successful()) {
            return [
                'success' => true,
                'message' => 'Expo notification sent successfully',
                'response' => $response->json()
            ];
        }

        throw new \Exception('Expo API error: ' . $response->body());
    }

    /**
     * Send FCM notification
     */
    private function sendFCMNotification(string $token, string $title, string $body, array $data = [])
    {
        $payload = [
            'to' => $token,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'sound' => 'default'
            ],
            'data' => $data
        ];

        $response = Http::withHeaders([
            'Authorization' => 'key=' . $this->fcmServerKey,
            'Content-Type' => 'application/json'
        ])->post('https://fcm.googleapis.com/fcm/send', $payload);

        if ($response->successful()) {
            return [
                'success' => true,
                'message' => 'FCM notification sent successfully',
                'response' => $response->json()
            ];
        }

        throw new \Exception('FCM API error: ' . $response->body());
    }
}
```

### **D. Scheduled Notification Job**

#### **SendScheduledNotifications Job:**
```php
<?php

namespace App\Jobs;

use App\Models\ScheduledNotification;
use App\Services\PushNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendScheduledNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(PushNotificationService $pushService)
    {
        $notifications = ScheduledNotification::where('scheduled_for', '<=', now())
            ->where('is_sent', false)
            ->get();

        foreach ($notifications as $notification) {
            $pushService->sendToUser(
                $notification->user_id,
                $notification->title,
                $notification->body,
                array_merge($notification->data ?? [], [
                    'notification_id' => $notification->id,
                    'type' => $notification->type
                ])
            );

            $notification->update([
                'is_sent' => true,
                'sent_at' => now()
            ]);
        }
    }
}
```

### **E. Automatic Package Expiry Scheduling**

#### **Package Event Listener:**
```php
<?php

namespace App\Listeners;

use App\Events\PackagePurchased;
use App\Models\ScheduledNotification;
use Carbon\Carbon;

class SchedulePackageExpiryNotifications
{
    public function handle(PackagePurchased $event)
    {
        $package = $event->package;
        $user = $event->user;
        
        // Υπολογισμός ημερομηνίας λήξης
        $endDate = Carbon::parse($package->end_date);
        
        // 1 εβδομάδα πριν
        $oneWeekBefore = $endDate->clone()->subWeek();
        if ($oneWeekBefore->isFuture()) {
            ScheduledNotification::create([
                'id' => "package_expiry_week_{$package->id}",
                'user_id' => $user->id,
                'type' => 'package_expiry_week',
                'title' => '📅 Λήξη Πακέτου σε 1 Εβδομάδα',
                'body' => 'Το πακέτο σας λήγει σε 7 μέρες. Ανανεώστε το για να συνεχίσετε!',
                'scheduled_for' => $oneWeekBefore,
                'related_id' => $package->id,
                'data' => ['type' => 'package_expiry', 'package_id' => $package->id]
            ]);
        }
        
        // 2 μέρες πριν  
        $twoDaysBefore = $endDate->clone()->subDays(2);
        if ($twoDaysBefore->isFuture()) {
            ScheduledNotification::create([
                'id' => "package_expiry_2days_{$package->id}",
                'user_id' => $user->id,
                'type' => 'package_expiry_2days',
                'title' => '⚠️ Λήξη Πακέτου σε 2 Μέρες',
                'body' => 'Το πακέτο σας λήγει σε 2 μέρες! Ανανεώστε τώρα.',
                'scheduled_for' => $twoDaysBefore,
                'related_id' => $package->id,
                'data' => ['type' => 'package_expiry', 'package_id' => $package->id]
            ]);
        }
    }
}
```

---

## 🛣️ **4. ROUTES**

### **routes/api.php:**
```php
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    
    // Push Token Management
    Route::post('/users/push-token', [NotificationController::class, 'storePushToken']);
    Route::delete('/users/push-token', [NotificationController::class, 'deletePushToken']);
    
    // Notification Management
    Route::post('/notifications/schedule', [NotificationController::class, 'scheduleNotification']);
    Route::delete('/notifications/cancel/{id}', [NotificationController::class, 'cancelNotification']);
    Route::get('/users/{id}/notifications', [NotificationController::class, 'getUserNotifications']);
    
    // Test Notifications
    Route::post('/notifications/test', [NotificationController::class, 'sendTestNotification']);
    
});
```

---

## ⚙️ **5. CONFIGURATION**

### **config/services.php:**
```php
'fcm' => [
    'server_key' => env('FCM_SERVER_KEY'),
],

'expo' => [
    'access_token' => env('EXPO_ACCESS_TOKEN'),
],
```

### **.env additions:**
```bash
# Firebase Cloud Messaging
FCM_SERVER_KEY=your_fcm_server_key_here

# Expo Push Service (optional)
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

---

## ⏰ **6. CRON JOBS**

### **app/Console/Kernel.php:**
```php
protected function schedule(Schedule $schedule)
{
    // Check για scheduled notifications κάθε λεπτό
    $schedule->job(new SendScheduledNotifications)->everyMinute();
}
```

---

## 🧪 **7. TESTING**

### **Test Push Token Storage:**
```bash
curl -X POST "https://api.sweat93.gr/api/v1/users/push-token" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "platform": "android"
  }'
```

### **Test Notification Scheduling:**
```bash
curl -X POST "https://api.sweat93.gr/api/v1/notifications/schedule" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_notification_123",
    "type": "package_expiry_week",
    "title": "Test Notification",
    "body": "Δοκιμαστική ειδοποίηση",
    "scheduled_for": "2024-12-15T10:00:00Z",
    "user_id": 1
  }'
```

### **Test Notification Send:**
```bash
curl -X POST "https://api.sweat93.gr/api/v1/notifications/test" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "body": "Δοκιμή",
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
  }'
```

---

## 📋 **8. IMPLEMENTATION CHECKLIST**

### **Database Setup:**
- [ ] Create `user_push_tokens` table
- [ ] Create `scheduled_notifications` table  
- [ ] Create `notification_logs` table
- [ ] Run migrations

### **Backend Code:**
- [ ] Create Models (UserPushToken, ScheduledNotification, NotificationLog)
- [ ] Create NotificationController
- [ ] Create PushNotificationService
- [ ] Create SendScheduledNotifications Job
- [ ] Add routes to api.php
- [ ] Configure FCM/Expo credentials

### **Automation:**
- [ ] Create Package event listener
- [ ] Create Appointment event listener
- [ ] Setup cron job για scheduled notifications
- [ ] Test automatic scheduling

### **Testing:**
- [ ] Test push token storage
- [ ] Test notification scheduling
- [ ] Test manual notification send
- [ ] Test automatic package expiry notifications
- [ ] Test appointment reminders

---

## 🚀 **EXPECTED TIMELINE**

1. **Database Setup** (30 mins)
2. **Models & Controller** (2 hours)
3. **Push Service Implementation** (2 hours)
4. **Automation & Events** (1 hour)
5. **Testing & Debugging** (1 hour)

**Total: ~6-7 hours για complete implementation**

---

## 🎯 **SUCCESS CRITERIA**

✅ **Package Expiry Notifications:**
- Automatic scheduling όταν αγοράζεται πακέτο
- Notifications στέλνονται 1 εβδομάδα και 2 μέρες πριν τη λήξη
- User μπορεί να δει scheduled notifications

✅ **Appointment Reminders:**  
- Automatic scheduling όταν κλείνεται ραντεβού
- Notification στέλνεται 1 ώρα πριν το ραντεβού
- User μπορεί να ακυρώσει reminders

✅ **General Features:**
- Cross-platform support (Android/iOS)
- Test notifications λειτουργούν
- Notification history & logging
- Token management & updates

**🎉 Με αυτή την υλοποίηση, η εφαρμογή θα έχει complete push notification system!**
