"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const PINScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { businessId } = route.params
  const { login } = useAuth()
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      setError("")

      // Auto submit when 4 digits entered
      if (newPin.length === 4) {
        handleSubmit(newPin)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError("")
  }

  const handleSubmit = async (pinValue: string) => {
    if (pinValue.length < 4) return

    setLoading(true)
    try {
      await login(businessId, pinValue)
      // Navigation happens automatically in AppNavigation based on isAuthenticated
    } catch (err) {
      setError("Invalid PIN")
      setPin("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <View style={styles.keypadGrid}>
              {[...Array(9)].map((_, i) => (
                <View key={i} style={styles.keypadDot} />
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN to continue</Text>

        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled, error && styles.dotError]} />
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            {["1", "2", "3"].map((num) => (
              <TouchableOpacity key={num} style={styles.key} onPress={() => handleNumberPress(num)} disabled={loading}>
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {["4", "5", "6"].map((num) => (
              <TouchableOpacity key={num} style={styles.key} onPress={() => handleNumberPress(num)} disabled={loading}>
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {["7", "8", "9"].map((num) => (
              <TouchableOpacity key={num} style={styles.key} onPress={() => handleNumberPress(num)} disabled={loading}>
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            <View style={styles.key} />
            <TouchableOpacity style={styles.key} onPress={() => handleNumberPress("0")} disabled={loading}>
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={handleBackspace} disabled={loading || pin.length === 0}>
              <Ionicons name="backspace-outline" size={28} color={Colors.gray900} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.hint}>
        <Text style={styles.hintText}>Demo PINs: 1234 (Admin) | 5678 (Cashier)</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    backgroundColor: Colors.teal,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  keypadGrid: {
    width: 36,
    height: 36,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  keypadDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray600,
    marginBottom: 48,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 64,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray200,
  },
  dotFilled: {
    backgroundColor: Colors.teal,
  },
  dotError: {
    backgroundColor: Colors.error,
  },
  error: {
    fontSize: Typography.sm,
    color: Colors.error,
    marginBottom: 24,
  },
  keypad: {
    gap: 20,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 20,
  },
  key: {
    width: 80,
    height: 80,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  keyText: {
    fontSize: 32,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  hint: {
    padding: 16,
    backgroundColor: Colors.success + "20",
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 12,
  },
  hintText: {
    fontSize: Typography.sm,
    color: Colors.gray700,
    textAlign: "center",
  },
})
