# Android Studio Quick Start for Sweat24

## 🚀 Immediate Steps After Opening

### 1. Wait for Gradle Sync
- Android Studio should automatically start syncing
- Look for "Gradle sync finished" in the bottom status bar
- If sync fails, click "Try Again" or check the Event Log

### 2. Create/Start Emulator
1. Click the **Device Manager** icon (phone icon) in the toolbar
2. Click **Create Virtual Device**
3. Select **Pixel 6** → Next
4. Download **API 34** (or latest) → Next
5. Name it "Sweat24 Test Device" → Finish
6. Click the ▶️ play button to start the emulator

### 3. Run the App
1. Wait for emulator to fully boot
2. Select "Sweat24 Test Device" from the device dropdown
3. Click the green **Run** button (or Shift+F10)
4. First build may take 2-5 minutes

## 📱 What You'll See

When the app launches successfully:
- Splash screen with purple background
- Main app interface matching the web version
- Bottom navigation for mobile-optimized UI
- All features working offline-first with Capacitor

## 🔧 Common First-Run Issues

### "SDK Location Not Found"
- Go to **File → Project Structure → SDK Location**
- Set Android SDK path (usually `~/Library/Android/sdk`)

### "Gradle Sync Failed"
- Check internet connection
- Click **File → Sync Project with Gradle Files**

### "Build Failed: SDK Not Installed"
- Open SDK Manager (cube icon in toolbar)
- Install missing components marked with ❌

### "Device Not Found"
- Ensure emulator is running
- Or connect physical device with USB debugging enabled

## ✅ Success Indicators
- App icon appears on emulator/device
- App launches without crashing
- Can navigate between screens
- Network requests work (if backend is running)

## 🎯 Next Development Steps
1. Test all app features
2. Customize theme colors in `styles.xml`
3. Add proper app icons (replace default icons)
4. Configure push notifications
5. Set up app signing for release builds

## 💡 Pro Tips
- Use **Logcat** (bottom panel) to debug issues
- Enable **Instant Run** for faster development
- Use **Layout Inspector** to debug UI issues
- Profile performance with **Android Profiler**