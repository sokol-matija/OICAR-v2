# OICAR Mobile App

This is our React Native mobile app for the OICAR e-commerce platform. We built it using Expo and it works on both iOS and Android.

## What you need to run this

- Node.js 18 or newer
- Expo CLI (npm install -g @expo/cli)
- For testing on device: Expo Go app
- For emulators: Android Studio or Xcode

## How to run it

First make sure the API backend is running. You can check the main README in the root folder for that.

Then:

```bash
# Install everything
npm install

# Start the app
npm start
# or if you prefer
npx expo start

# For Android emulator specifically
npx expo start --android

# If you run into issues, try clearing cache
npx expo start --clear
```

The Expo dev server will start and show you a QR code. You can scan it with the Expo Go app on your phone, or press 'a' for Android emulator or 'i' for iOS simulator.

## What the app does

This mobile app connects to our OICAR API and lets users:

- Register and login to their accounts
- Browse products and categories
- Add items to their cart
- Place orders and view order history
- Create new items to sell
- Manage their profile
- Request data anonymization (GDPR compliance)

## API Connection

The app automatically connects to the right API endpoint depending on where you're running it:

- Android emulator: http://10.0.2.2:7118/api (because Android emulator can't reach localhost)
- iOS simulator: http://localhost:7118/api
- Web: http://localhost:7118/api

If you're having connection issues, make sure the API backend is running first.

## Testing

We have tests set up using Jest and React Native Testing Library. To run them:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Common Issues

### Network request failed
This usually means the API isn't running or the app can't reach it. Make sure:
1. The API backend is running on http://localhost:7118
2. If using Android emulator, the app should automatically use 10.0.2.2 instead of localhost
3. Check your firewall settings

### Expo/Metro bundler issues
Try these commands:
```bash
# Clear cache and restart
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache

# If all else fails, delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Build issues
Make sure you have the right versions:
- Node.js 18+
- Expo CLI latest version
- All dependencies up to date

## Project Structure

The app is organized like this:

- `components/` - Reusable UI components
- `screens/` - Main app screens
- `utils/` - API services and utilities
- `types/` - TypeScript type definitions
- `__tests__/` - Test files

The main entry point is `App.tsx` which handles navigation between screens.
