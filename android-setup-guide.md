# Android App Setup Guide for Sweat24

## Android Studio Configuration

### 1. Initial Setup (When Android Studio Opens)
- Wait for Gradle sync to complete
- If prompted about SDK location, accept the default or set it to your Android SDK path

### 2. Fix Common Issues

#### Java/JDK Configuration
If you see JAVA_HOME errors:
1. Go to **Android Studio → Preferences → Build, Execution, Deployment → Build Tools → Gradle**
2. Set Gradle JDK to your installed Java version (17.0.15)
3. Or use Android Studio's embedded JDK

#### SDK Configuration
1. Go to **Tools → SDK Manager**
2. Install required SDKs:
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

### 3. Running the App

#### On Emulator
1. Click **Tools → AVD Manager**
2. Create a new Virtual Device:
   - Choose a device (e.g., Pixel 6)
   - Select system image (API 34 recommended)
   - Finish setup
3. Click the green **Run** button or press `Shift + F10`

#### On Physical Device
1. Enable Developer Mode on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Select your device from the dropdown
5. Click **Run**

### 4. Build Variants
- **Debug**: For development and testing
- **Release**: For production (requires signing)

### 5. Troubleshooting

#### Gradle Sync Failed
```bash
# Clean and rebuild
./gradlew clean
./gradlew build
```

#### Build Failed
1. Check **Build → Rebuild Project**
2. **File → Invalidate Caches and Restart**

#### App Crashes on Launch
1. Check Logcat for errors
2. Ensure all permissions are granted
3. Verify minimum SDK version compatibility

### 6. Customization Tasks

#### App Icon
Replace these files in `android/app/src/main/res/`:
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

#### Splash Screen
Replace splash images in `android/app/src/main/res/drawable*/`

#### App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Sweat24</string>
```

### 7. Building for Release

1. Generate a signing key:
```bash
keytool -genkey -v -keystore sweat24-release-key.keystore -alias sweat24 -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/app/build.gradle`

3. Build release APK:
```bash
./gradlew assembleRelease
```

4. Or build AAB for Play Store:
```bash
./gradlew bundleRelease
```

### 8. Performance Tips
- Enable ProGuard for release builds
- Use Android App Bundle (AAB) format
- Test on various device configurations
- Monitor app size and optimize assets