# OICAR Mobile App

A modern React Native mobile application built with Expo and TypeScript for the OICAR platform.

## 🚀 Tech Stack

- **Expo** - Official React Native framework for fast development
- **TypeScript** - Type safety and better developer experience
- **Expo Router** - Modern file-based navigation
- **NativeWind** - Tailwind CSS for React Native styling
- **React Native Reanimated** - Smooth, performant animations
- **Expo Image** - Optimized image handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** (optional but recommended): `npm install -g @expo/cli`
- **Expo Go app** on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### For iOS Development (macOS only):
- **Xcode** (latest version)
- **iOS Simulator**

### For Android Development:
- **Android Studio**
- **Android SDK**
- **Android Emulator** or physical Android device

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OICAR/OICAR-MobileApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

## 📱 Running the App

### Method 1: Expo Go (Recommended for development)
1. Install Expo Go on your mobile device
2. Run `npx expo start` in your terminal
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

### Method 2: iOS Simulator (macOS only)
1. Start the development server: `npx expo start`
2. Press `i` in the terminal to open iOS Simulator
3. Or run: `npm run ios`

### Method 3: Android Emulator/Device
1. Start the development server: `npx expo start`
2. Press `a` in the terminal to open Android emulator
3. Or run: `npm run android`

### Method 4: Web Browser
1. Start the development server: `npx expo start`
2. Press `w` in the terminal to open in web browser
3. Or run: `npm run web`

## 📁 Project Structure

```
OICAR-MobileApp/
├── App.tsx              # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── README.md           # This file
├── assets/             # Images, fonts, and other static assets
│   ├── images/
│   └── fonts/
├── src/                # Source code (to be created)
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens/pages
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API calls and external services
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript type definitions
│   └── constants/      # App constants
└── node_modules/       # Installed packages
```

## 🧪 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run build` - Build for production

## 🔧 Development Workflow

1. **Hot Reloading**: Changes to your code will automatically refresh the app
2. **Debug Menu**: Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to access developer tools
3. **Remote Debugging**: Use Chrome DevTools for debugging JavaScript

## 📚 Key Features to Implement

- [ ] User Authentication
- [ ] Vehicle Booking System
- [ ] Real-time Location Tracking
- [ ] Payment Integration
- [ ] Push Notifications
- [ ] Offline Support
- [ ] Multi-language Support

## 🎨 Styling

This project uses **NativeWind** (Tailwind CSS for React Native). Example usage:

```tsx
import { View, Text } from 'react-native';

export default function MyComponent() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-blue-600">
        Hello OICAR!
      </Text>
    </View>
  );
}
```

## 🌐 Environment Configuration

Create environment files for different stages:
- `.env.development` - Development environment variables
- `.env.staging` - Staging environment variables  
- `.env.production` - Production environment variables

## 🚀 Deployment

### Development Build
```bash
npx expo build:android
npx expo build:ios
```

### Production Build
```bash
npx expo build:android --release-channel production
npx expo build:ios --release-channel production
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Dependencies issues**: Delete `node_modules` and run `npm install`
3. **iOS build issues**: Clean Xcode build folder (`Cmd+Shift+K`)
4. **Android build issues**: Clean Gradle cache: `cd android && ./gradlew clean`

### Getting Help

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Happy Coding! 🎉** 