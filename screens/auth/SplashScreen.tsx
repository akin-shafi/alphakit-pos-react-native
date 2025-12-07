"use client"

import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace("POSHome")
      } else {
        navigation.replace("Welcome")
      }
    }, 2000)
  }, [isAuthenticated, navigation])

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>POS</Text>
        </View>
        <Text style={styles.title}>Point of Sale</Text>
        <Text style={styles.subtitle}>Professional Business Solutions</Text>
      </View>
      <ActivityIndicator size="large" color={Colors.black} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: Colors.black,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: Typography["4xl"],
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  title: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray500,
  },
})
