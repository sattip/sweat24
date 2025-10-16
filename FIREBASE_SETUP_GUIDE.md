# 🔥 Firebase Cloud Messaging Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for the sweat93 app.

## 📋 Prerequisites

- Google account
- Access to [Firebase Console](https://console.firebase.google.com)
- Node.js and npm installed

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `sweat93-notifications`
4. Disable Google Analytics (optional)
5. Click "Create project"

## 🔧 Step 2: Enable Cloud Messaging

1. In your Firebase project, go to **Project Settings** (gear icon)
2. Navigate to **Cloud Messaging** tab
3. Note down your **Server key** and **Sender ID**

## 🌐 Step 3: Add Web App

1. In Project Overview, click **Web** icon `</>`
2. Enter app nickname: `sweat93-web`
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object

## 🔑 Step 4: Generate VAPID Key

1. In Firebase Console, go to **Project Settings**
2. Navigate to **Cloud Messaging** tab
3. Scroll down to **Web configuration**
4. Click "Generate key pair" under **Web push certificates**
5. Copy the generated VAPID key

## ⚙️ Step 5: Configure Application

### Update Firebase Config

Edit `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "sweat93-notifications.firebaseapp.com",
  projectId: "sweat93-notifications",
  storageBucket: "sweat93-notifications.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

export const VAPID_KEY = "YOUR_VAPID_KEY_HERE";
```

### Update Service Worker

Edit `public/firebase-messaging-sw.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "sweat93-notifications.firebaseapp.com",
  projectId: "sweat93-notifications",
  storageBucket: "sweat93-notifications.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 📱 Step 6: Mobile App Setup (Android)

### Add Android App to Firebase

1. In Firebase Console, click "Add app" → Android
2. Enter package name: `com.sweat93.app`
3. Download `google-services.json`
4. Place it in `android/app/` directory

### Update Android Configuration

Add to `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.0.0'
    // ... other dependencies
}
```

Add to `android/build.gradle`:

```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.10'
    // ... other dependencies
}
```

## 🍎 Step 7: Mobile App Setup (iOS)

### Add iOS App to Firebase

1. In Firebase Console, click "Add app" → iOS
2. Enter bundle ID: `com.sweat93.app`
3. Download `GoogleService-Info.plist`
4. Add it to your iOS project in Xcode

### Update iOS Configuration

Add to `ios/App/App/AppDelegate.swift`:

```swift
import Firebase

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    FirebaseApp.configure()
    return true
}
```

## 🔧 Step 8: Backend Configuration

### Update Backend for FCM

Add these environment variables to your Laravel `.env`:

```env
FIREBASE_SERVER_KEY=your_server_key_here
FIREBASE_SENDER_ID=your_sender_id_here
FIREBASE_PROJECT_ID=sweat93-notifications
```

### Install Firebase Admin SDK (Laravel)

```bash
composer require kreait/firebase-php
```

### Create Firebase Service (Laravel)

```php
// app/Services/FirebaseService.php
<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

class FirebaseService
{
    private $messaging;

    public function __construct()
    {
        $firebase = (new Factory)
            ->withServiceAccount(storage_path('app/firebase-credentials.json'));
            
        $this->messaging = $firebase->createMessaging();
    }

    public function sendNotification($token, $title, $body, $data = [])
    {
        $message = CloudMessage::withTarget('token', $token)
            ->withNotification([
                'title' => $title,
                'body' => $body,
            ])
            ->withData($data);

        return $this->messaging->send($message);
    }
}
```

## 🧪 Step 9: Testing

### Test in Development

1. Build the app: `npm run build`
2. Sync to platform: `npx cap sync android`
3. Open the app and navigate to Notifications
4. Click "Initialize FCM"
5. Grant permissions when prompted
6. Send a test notification

### Test Notification Flow

1. **Web Browser**: Open in Chrome/Firefox with developer tools
2. **Android Emulator**: Use Android Studio emulator
3. **iOS Simulator**: Use Xcode simulator
4. **Real Device**: Install APK/IPA on physical device

## 🔍 Debugging

### Common Issues

1. **Service Worker Not Found**
   - Ensure `firebase-messaging-sw.js` is in `public/` directory
   - Check browser console for errors

2. **Permission Denied**
   - Clear browser data and try again
   - Check if notifications are blocked in browser settings

3. **Token Not Generated**
   - Verify VAPID key is correct
   - Check Firebase project configuration

4. **Notifications Not Received**
   - Test with Firebase Console test message
   - Verify token is sent to backend correctly

### Debug Tools

1. **Firebase Console**: Use "Cloud Messaging" → "Send test message"
2. **Browser DevTools**: Check Console and Network tabs
3. **Android Logcat**: Monitor native app logs
4. **iOS Console**: Use Xcode console for iOS debugging

## 📚 Additional Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [FCM Web Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
- [FCM Android Guide](https://firebase.google.com/docs/cloud-messaging/android/client)
- [FCM iOS Guide](https://firebase.google.com/docs/cloud-messaging/ios/client)

## 🎯 Production Checklist

- [ ] Firebase project created
- [ ] Web app added to Firebase
- [ ] Android app added to Firebase (if using)
- [ ] iOS app added to Firebase (if using)
- [ ] VAPID key generated and configured
- [ ] Service worker updated with correct config
- [ ] Firebase config updated in app
- [ ] Backend Firebase admin SDK configured
- [ ] Test notifications working
- [ ] Production domain whitelisted in Firebase
- [ ] Analytics configured (optional)

## 🔒 Security Notes

- Never expose your Firebase server key in client-side code
- Use environment variables for sensitive configuration
- Regularly rotate your VAPID keys
- Monitor Firebase usage and quotas
- Set up proper Firebase security rules

---

**Need help?** Check the Firebase documentation or create an issue in the project repository.
