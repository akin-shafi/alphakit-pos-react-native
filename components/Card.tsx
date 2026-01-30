import type React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { Colors } from "../constants/Colors"

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: number
}

export const Card: React.FC<CardProps> = ({ children, style, padding = 16 }) => {
  return <View style={[styles.card, { padding }, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
})
