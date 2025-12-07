"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const BusinessIDScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [businessId, setBusinessId] = useState("")

  const handleContinue = () => {
    if (!businessId.trim()) {
      alert("Please enter Business ID")
      return
    }
    navigation.navigate("PIN", { businessId })
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Business ID</Text>
          <Text style={styles.subtitle}>Login to your existing business account</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Business ID"
            placeholder="e.g., BIZ001"
            value={businessId}
            onChangeText={setBusinessId}
            autoCapitalize="characters"
          />

          <View style={styles.hint}>
            <Text style={styles.hintText}>For demo, use: BIZ001</Text>
          </View>

          <Button title="Continue" onPress={handleContinue} fullWidth size="lg" />
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>Back to Welcome</Text>
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
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray500,
    textAlign: "center",
  },
  form: {
    gap: 24,
  },
  hint: {
    padding: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
  },
  hintText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    textAlign: "center",
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
