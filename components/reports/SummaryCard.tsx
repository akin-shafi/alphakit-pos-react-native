import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"

interface SummaryCardProps {
  icon: keyof typeof Feather.glyphMap
  iconColor: string
  iconBgColor: string
  label: string
  value: string
  subtext: string
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ icon, iconColor, iconBgColor, label, value, subtext }) => {
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: iconBgColor }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.subtext}>{subtext}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: Colors.gray600,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.gray900,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 11,
    color: Colors.gray500,
  },
})
