import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline" | "danger"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  primaryColor?: string
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  primaryColor = Colors.black,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    variant === "primary" && { backgroundColor: primaryColor },
    style,
  ]

  const textStyles = [styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? Colors.white : primaryColor} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primary: {
    backgroundColor: Colors.black,
  },
  secondary: {
    backgroundColor: Colors.gray100,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.gray300,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  size_lg: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    minHeight: 64,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: Typography.semibold,
    textAlign: "center",
  },
  text_primary: {
    color: Colors.white,
  },
  text_secondary: {
    color: Colors.gray900,
  },
  text_outline: {
    color: Colors.gray900,
  },
  text_danger: {
    color: Colors.white,
  },
  textSize_sm: {
    fontSize: Typography.sm,
  },
  textSize_md: {
    fontSize: Typography.base,
  },
  textSize_lg: {
    fontSize: Typography.lg,
  },
})
