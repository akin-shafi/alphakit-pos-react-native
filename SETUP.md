# Mobile POS Setup Guide

## Important: This is a React Native Application

This project is built with **React Native** and **Expo**, designed specifically for Android POS terminals. It **cannot run in a web browser** like a typical Next.js application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **Android Studio** (for Android emulator)
- **Physical Android Device** (optional, for real device testing)

## Installation Steps

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install all required packages including:
- React Native core libraries
- Expo SDK
- Navigation libraries
- AsyncStorage for local data persistence
- Vector icons

### 2. Start the Development Server

\`\`\`bash
npm start
\`\`\`

Or use Expo CLI directly:

\`\`\`bash
expo start
\`\`\`

This will open the Expo DevTools in your browser with a QR code.

### 3. Run on Android Device

#### Option A: Physical Android Device

1. Install the **Expo Go** app from Google Play Store
2. Scan the QR code from the Expo DevTools
3. The app will load on your device

#### Option B: Android Emulator

1. Open Android Studio and start an AVD (Android Virtual Device)
2. Press `a` in the terminal where `expo start` is running
3. Or click "Run on Android device/emulator" in Expo DevTools

#### Option C: Direct Build

\`\`\`bash
npm run android
\`\`\`

This requires Android Studio and Android SDK to be properly configured.

## Demo Credentials

Use these credentials to test the application:

**Business ID:** `BIZ001`

**User Roles:**
- **Admin** - PIN: `1234` (Full access)
- **Manager** - PIN: `5678` (Sales, inventory, reports)
- **Cashier** - PIN: `9999` (POS operations only)

## Project Structure

\`\`\`
/mobile-pos-app
├── /components          # Reusable UI components
├── /constants          # Colors, typography, roles
├── /contexts           # React Context providers
├── /navigation         # Navigation configuration
├── /screens            # Screen components
├── /services           # API service layer
├── /utils              # Helper functions
├── App.tsx             # Entry point
├── app.json            # Expo configuration
└── package.json        # Dependencies
\`\`\`

## Features by Role

### Admin
- Full business and branch management
- Create and manage users
- Complete inventory control
- View all reports and analytics
- Configure system settings
- Manage printer and payment settings

### Manager
- Open/close shifts
- Process sales
- View sales reports
- Manage inventory levels
- Approve discounts
- Cannot modify business settings

### Cashier
- Browse products
- Process sales transactions
- Print receipts
- View personal daily sales
- Cannot access admin features

## Development Tips

### Hot Reloading
Changes to the code will automatically reload in the app. Shake the device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open the developer menu.

### Debugging
- Use Chrome DevTools for debugging
- Press `j` in the terminal to open debugger
- Use `console.log()` statements to debug

### Clear Cache
If you encounter issues:

\`\`\`bash
expo start -c
\`\`\`

Or:

\`\`\`bash
npm start -- --clear
\`\`\`

## Building for Production

### Create APK for Testing

\`\`\`bash
expo build:android -t apk
\`\`\`

### Create AAB for Google Play

\`\`\`bash
expo build:android -t app-bundle
\`\`\`

## Backend Integration

The app is ready for backend integration. Update these files:

1. **Environment Variables**: Create `.env` file
2. **Service Layer**: Update API URLs in `/services` directory
3. **Authentication**: Implement real auth in `AuthService.ts`
4. **Sync Logic**: Configure sync in `SyncService.ts`

## Thermal Printer Integration

To integrate with physical thermal printers:

1. Install Bluetooth library: `expo-bluetooth` or `react-native-bluetooth-escpos-printer`
2. Update `services/PrinterService.ts` (create this file)
3. Implement ESC/POS commands for receipt formatting
4. Test with your specific printer model

## Troubleshooting

### Metro Bundler Issues
\`\`\`bash
watchman watch-del-all
rm -rf node_modules
npm install
expo start -c
\`\`\`

### Android Build Errors
- Ensure Android SDK is installed
- Check Java version (JDK 11 or higher)
- Verify ANDROID_HOME environment variable

### Expo Go Connection Issues
- Ensure device and computer are on the same network
- Try using tunnel mode: `expo start --tunnel`

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review Expo documentation: https://docs.expo.dev
3. Contact your system administrator

## Next Steps

1. Test all user roles with demo credentials
2. Customize business themes in `/constants/Colors.ts`
3. Configure your backend API endpoints
4. Set up thermal printer connection
5. Deploy to Android POS terminals

---

**Note**: This application is optimized for Android POS terminals with touch screens. For best results, test on actual POS hardware with the target screen size and resolution.
