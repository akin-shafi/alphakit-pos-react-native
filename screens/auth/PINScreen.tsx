"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native"
import { Button } from "../../components/Button"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const PINScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { businessId } = route.params
  const { login } = useAuth()
  const [pin, setPin] = useState(["", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)]

  const handlePinChange = (value: string, index: number) => {
    if (value.length > 1) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError("")

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto submit when all digits filled
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join("")
      handleSubmit(fullPin)
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleSubmit = async (fullPin?: string) => {
    const pinValue = fullPin || pin.join("")
    if (pinValue.length < 4) {
      setError("Please enter complete PIN")
      return
    }

    setLoading(true)
    try {
      await login(businessId, pinValue)
      navigation.replace("POSHome")
    } catch (err) {
      setError("Invalid PIN. Please try again.")
      setPin(["", "", "", ""])
      inputRefs[0].current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter PIN</Text>
          <Text style={styles.subtitle}>Business: {businessId}</Text>
        </View>

        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[styles.pinInput, error && styles.pinInputError]}
              value={digit}
              onChangeText={(value) => handlePinChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              selectTextOnFocus
            />
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Demo PINs:</Text>
          <Text style={styles.hintText}>Admin: 1234 | Manager: 5678 | Cashier: 9999</Text>
        </View>

        <Button title="Login" onPress={() => handleSubmit()} fullWidth size="lg" loading={loading} />
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>Change Business ID</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray500,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  pinInput: {
    width: 60,
    height: 70,
    backgroundColor: Colors.gray50,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 12,
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    textAlign: "center",
    color: Colors.gray900,
  },
  pinInputError: {
    borderColor: Colors.error,
  },
  error: {
    fontSize: Typography.sm,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 24,
  },
  hint: {
    padding: 16,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    marginBottom: 24,
  },
  hintTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
    marginBottom: 4,
  },
  hintText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  back: {
    padding: 16,
    alignItems: "center",
  },
  backText: {
    fontSize: Typography.base,
    color: Colors.gray600,
  },
})
