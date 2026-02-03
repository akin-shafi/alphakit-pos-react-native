

import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    setTimeout(() => {
      // If authenticated, AppNavigation will automatically switch to POS stack.
      // We don't need to manually navigate here if AppNavigation renders POS stack.
      // But if we want to ensure we're on POSHome:
      if (!isAuthenticated) {
        navigation.replace("Welcome")
      }
    }, 2000)
  }, [isAuthenticated, navigation])

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Ionicons name="storefront" size={56} color={Colors.teal} />
        </View>
        <Text style={styles.title}>POS Terminal</Text>
        <Text style={styles.subtitle}>Point of Sale System</Text>
      </View>
      <ActivityIndicator size="large" color={Colors.white} style={styles.loader} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    marginBottom: 100,
  },
  logoCircle: {
    width: 140,
    height: 140,
    backgroundColor: Colors.white,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: Typography.bold,
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.lg,
    color: Colors.white,
    opacity: 0.9,
    textAlign: "center",
  },
  loader: {
    marginTop: 48,
  },
})
