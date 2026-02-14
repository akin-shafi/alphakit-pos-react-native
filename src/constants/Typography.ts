// Typography system optimized for touch terminals
// Using Object.freeze to ensure immutability and help with bundler optimization

const TypographyValues = Object.freeze({
  // Font sizes - larger for touch terminals
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,

  // Font weights
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,

  // Line heights
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
})

// Named export
export const Typography = TypographyValues

// Default export for alternative import patterns
export default TypographyValues
