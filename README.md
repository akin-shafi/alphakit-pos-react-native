# Mobile POS Application

A professional Point of Sale (POS) application for Android terminals with thermal printer support, built with React Native and Expo.

## Features

### Authentication & Onboarding
- Splash screen with branding
- Business registration flow
- Multi-step onboarding (business setup + admin creation)
- Secure PIN-based authentication
- Business ID + PIN login system
- Role-based access control (Admin, Manager, Cashier)

### POS System
- Fast product browsing with category filters
- Real-time search functionality
- Large touch-optimized product tiles
- Shopping cart with quantity management
- Flexible payment handling with configurable modes
- Support for in-app card payments and external terminals (MoniePoint, OPay)
- Payment method selection during checkout
- Thermal receipt printing simulation
- Online/Offline status indicators

### Payment & Checkout
- Configurable default payment behavior:
  - Ask every time (recommended)
  - Default to in-app card processing
  - Default to external terminals
- Multiple payment methods:
  - Cash
  - Card (In-App)
  - External Terminal (MoniePoint, OPay, etc.)
  - Bank Transfer
  - Credit Sale
- External terminal workflow with cashier instructions
- Always print receipts regardless of payment method
- Override capability for cashiers to choose different payment methods

### Inventory Management
- Product listing with search and filters
- Low stock warnings
- Stock level monitoring
- Product details with pricing and SKU
- Category-based organization
- Role-based edit permissions

### Reports & Analytics
- Daily, weekly, and monthly sales reports
- Revenue tracking
- Transaction summaries
- Best-selling products
- Peak hours analysis
- Role-based access (Admin & Manager only)

### Settings
- User profile management
- Business information display
- Payment & checkout configuration
- Permission viewer
- System settings (Printer, Sync, Payments)
- Secure logout functionality

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: React Context API
- **Storage**: AsyncStorage for local persistence
- **UI**: Custom components optimized for POS terminals
- **Icons**: Expo Vector Icons (Ionicons)
- **TypeScript**: Full type safety

## Architecture

### Offline-First Design
- Products cached locally for offline browsing
- Online-only transactions (MVP requirement)
- Sync status indicators
- Prepared for backend API integration

### Role-Based Permissions
- **Admin**: Full system access including payment configuration
- **Manager**: Sales, inventory, reports, payment settings
- **Cashier**: POS operations only

### Business Type Theming
- Retail (Blue)
- Restaurant (Red)
- Pharmacy (Green)
- Grocery (Purple)
- Default (Black)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally
- Android Studio (for Android development)
- Android POS terminal or emulator

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm start
\`\`\`

3. Run on Android:
\`\`\`bash
npm run android
\`\`\`

### Demo Credentials

**Business ID**: BIZ001

**User PINs**:
- Admin: 1234
- Manager: 5678
- Cashier: 9999

## File Structure

\`\`\`
/mobile-pos-app
├── /assets                  # Images, fonts, icons
├── /components              # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── ProductTile.tsx
│   ├── ReceiptPreview.tsx
│   ├── StatusBadge.tsx
│   └── PaymentMethodSelector.tsx
├── /constants               # App-wide constants
│   ├── Colors.ts
│   ├── Typography.ts
│   └── Roles.ts
├── /contexts                # React Contexts
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── InventoryContext.tsx
│   └── PaymentConfigContext.tsx
├── /navigation              # Navigation structure
│   ├── AppNavigation.tsx
│   ├── AuthStack.tsx
│   └── POSStack.tsx
├── /screens                 # Screen components
│   ├── /auth
│   │   ├── SplashScreen.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── BusinessIDScreen.tsx
│   │   └── PINScreen.tsx
│   ├── /pos
│   │   ├── POSHomeScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── CheckoutScreen.tsx
│   │   └── ExternalTerminalScreen.tsx
│   ├── /inventory
│   │   └── InventoryScreen.tsx
│   ├── /reports
│   │   └── ReportsScreen.tsx
│   └── /settings
│       ├── SettingsScreen.tsx
│       └── PaymentSettingsScreen.tsx
├── /types                   # TypeScript definitions
│   └── index.ts
├── App.tsx                  # Entry point
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
\`\`\`

## Design System

### Color Palette
- **Neutrals**: White, Gray scale, Black
- **Status**: Success (Green), Warning (Orange), Error (Red), Info (Blue)
- **Connection**: Online (Green), Offline (Gray), Syncing (Orange)
- **Business Themes**: Customizable primary colors per business type

### Typography
- Large touch-friendly font sizes (16-48px)
- Bold headings for quick scanning
- High contrast for readability
- System fonts for performance

### Touch Optimization
- Minimum 48px touch targets
- Large buttons and tiles
- Generous spacing
- Clear visual feedback

## Payment System

### Configuration
Merchants can configure their preferred payment behavior in **Settings → Payment & Checkout**:

1. **Default Payment Mode**:
   - Ask Every Time (Recommended)
   - Process Card In-App
   - External Terminal Only

2. **Enabled Payment Methods**:
   - Toggle each payment method on/off
   - Cash, Card, External Terminal, Transfer, Credit Sale

### Checkout Flow

1. **Cart Review**: Customer reviews items and total
2. **Payment Selection**: Based on merchant configuration:
   - If "Ask Every Time": Shows payment method selector
   - If default mode set: Uses default (with override option)
3. **Payment Processing**:
   - **In-App Payments**: Direct payment processing
   - **External Terminals**: Shows instruction screen with steps
4. **Receipt Printing**: Always prints receipt from the app

### External Terminal Flow

When using external terminals (MoniePoint, OPay, etc.):
1. App displays amount and provider
2. Shows step-by-step instructions
3. Cashier processes payment on external device
4. Cashier confirms "Payment Received" in app
5. App prints receipt from thermal printer

## Backend Integration (Ready)

The app is structured for easy backend integration:

### API Endpoints (Design)
- `POST /auth/login` - User authentication
- `GET /products` - Fetch inventory
- `POST /sales` - Create transaction (includes payment method and provider)
- `POST /sync` - Sync offline data
- `GET /payment-config` - Fetch merchant payment configuration
- `PUT /payment-config` - Update payment settings

## Thermal Printer Integration

The app includes printer simulation and is ready for real thermal printer integration using:
- Bluetooth connectivity
- ESC/POS commands
- Receipt formatting
- Print status handling

## Future Enhancements

- Real backend API integration
- Actual Bluetooth thermal printer support
- Payment gateway integrations (Stripe, Paystack)
- Real-time external terminal status checking
- Barcode scanning
- Customer management
- Advanced analytics
- Multi-branch synchronization
- Cloud backup
- Receipt email/SMS
- Split payments
- Refund processing

## License

Proprietary - All rights reserved

## Support

For support and questions, contact your system administrator.
