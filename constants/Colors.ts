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

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Online/Offline indicators
  online: "#10B981",
  offline: "#6B7280",
  syncing: "#F59E0B",
}

// Business type themes
export const BusinessThemes = {
  retail: {
    primary: "#2563EB", // Blue
    primaryDark: "#1E40AF",
    primaryLight: "#DBEAFE",
  },
  restaurant: {
    primary: "#DC2626", // Red
    primaryDark: "#991B1B",
    primaryLight: "#FEE2E2",
  },
  pharmacy: {
    primary: "#059669", // Green
    primaryDark: "#047857",
    primaryLight: "#D1FAE5",
  },
  grocery: {
    primary: "#7C3AED", // Purple
    primaryDark: "#5B21B6",
    primaryLight: "#EDE9FE",
  },
  default: {
    primary: "#0A0A0A", // Black for enterprise
    primaryDark: "#000000",
    primaryLight: "#F3F4F6",
  },
}
