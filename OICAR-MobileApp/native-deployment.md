# Native Mobile Deployment Guide

## 📱 Expo EAS Build (FREE)

### Step 1: Setup EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (create free account if needed)
eas login

# Initialize EAS in your project
cd OICAR-MobileApp
eas build:configure
```

### Step 2: Build for Android (FREE)
```bash
# Build APK for Android
eas build --platform android --profile preview

# This creates an APK you can install directly on Android
```

### Step 3: Build for iOS (Requires Apple Developer Account)
```bash
# Build for iOS (needs Apple Developer Account - $99/year)
eas build --platform ios --profile preview
```

### Step 4: Install on Phone

**Android:**
- Download APK from EAS build link
- Enable "Install from Unknown Sources" 
- Install APK directly

**iOS:**
- Requires TestFlight or App Store
- Needs Apple Developer Account

## 🆓 Free Limits
- **EAS Build**: 30 builds/month free
- **Android builds**: Completely free
- **iOS builds**: Free but need Apple Developer Account for installation

## 🎯 Best for Project Requirements
For academic project demonstration:
1. **Web deployment (Vercel)** - Easiest, immediate access
2. **Android APK** - Native app experience
3. **Expo Go testing** - Quick development testing 