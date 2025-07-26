# Sweat24 Mobile App Setup Guide

## Prerequisites

Before setting up the mobile app, ensure you have:

### For iOS Development:
- macOS (required for iOS development)
- Xcode (latest version)
- Node.js >= 20.0.0
- CocoaPods: `sudo gem install cocoapods`

### For Android Development:
- Android Studio
- Android SDK
- Java JDK 11 or higher
- Node.js >= 20.0.0

## Installation Steps

### 1. Update Node.js
The project requires Node.js version 20.0.0 or higher. Update if needed:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download directly from nodejs.org
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Web App
```bash
npm run build
```

### 4. Add Mobile Platforms
```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android
```

### 5. Sync the Web App to Native Projects
```bash
npx cap sync
```

## Running the Mobile App

### iOS Development
```bash
# Open in Xcode
npx cap open ios

# Or run directly
npx cap run ios
```

In Xcode:
1. Select your development team
2. Choose a simulator or connected device
3. Click the Run button

### Android Development
```bash
# Open in Android Studio
npx cap open android

# Or run directly
npx cap run android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Select an emulator or connected device
3. Click the Run button

## Live Reload Development

For development with live reload:

1. Update capacitor.config.ts temporarily:
```typescript
server: {
  url: 'http://YOUR_IP:5173',
  cleartext: true
}
```

2. Run the development server:
```bash
npm run dev
```

3. Sync and run:
```bash
npx cap sync
npx cap run ios # or android
```

## Building for Production

### iOS Production Build
1. Open project in Xcode
2. Select "Generic iOS Device" as target
3. Product → Archive
4. Follow App Store submission process

### Android Production Build
1. Open project in Android Studio
2. Build → Generate Signed Bundle/APK
3. Follow the wizard to create a signed APK or AAB

## Common Issues and Solutions

### Node Version Error
If you see "The Capacitor CLI requires NodeJS >=20.0.0":
- Update Node.js to version 20 or higher
- Use nvm to manage Node versions

### iOS Build Errors
- Ensure Xcode is up to date
- Run `cd ios && pod install` if pod issues occur
- Check developer certificate and provisioning profiles

### Android Build Errors
- Ensure Android Studio and SDK are up to date
- Check Gradle version compatibility
- Verify Java version (JDK 11 or higher)

## Additional Resources
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic Native Plugins](https://ionicframework.com/docs/native)