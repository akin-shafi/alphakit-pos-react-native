// Color system for POS application with business-type themes
export const Colors = {
  // Base neutrals
  white: "#FFFFFF",
  black: "#0A0A0A",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Primary teal theme (from reference design)
  teal: "#0D5963",
  tealDark: "#0A4750",
  tealLight: "#E6F4F5",
  teal50: "#E6F4F5", // Added light teal background for icons

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  purple: "#9C27B0", // Added purple for tax metric

  green50: "#ECFDF5",
  blue50: "#EFF6FF",
  purple50: "#F5F3FF",
  red50: "#FEF2F2",

  // Online/Offline indicators
  online: "#10B981",
  offline: "#6B7280",
  syncing: "#F59E0B",

  // Product card colors (from reference design)
  productRed: "#E85D5D",
  productGreen: "#4CAF50",
  productBlue: "#3B82F6",
  productPurple: "#9C27B0",
  productOrange: "#FF9800",
}

// Business type themes - updated to use teal as primary
export const BusinessThemes = {
  retail: {
    primary: "#0D5963",
    primaryDark: "#0A4750",
    primaryLight: "#E6F4F5",
  },
  restaurant: {
    primary: "#0D5963",
    primaryDark: "#0A4750",
    primaryLight: "#E6F4F5",
  },
  pharmacy: {
    primary: "#0D5963",
    primaryDark: "#0A4750",
    primaryLight: "#E6F4F5",
  },
  grocery: {
    primary: "#0D5963",
    primaryDark: "#0A4750",
    primaryLight: "#E6F4F5",
  },
  default: {
    primary: "#0D5963",
    primaryDark: "#0A4750",
    primaryLight: "#E6F4F5",
  },
}
