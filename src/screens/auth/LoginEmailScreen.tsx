"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

const DEMO_EMAIL = "demo@business.com"
const DEMO_PASSWORD = "demo1234"

export const LoginEmailScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const scrollViewRef = useRef<ScrollView>(null)

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email")
      return
    }
    if (!password.trim()) {
      setError("Please enter your password")
      return
    }

    setLoading(true)
    setError("")
    try {
      await login(email.trim(), password)
      // Navigation happens automatically in AppNavigation based on isAuthenticated
    } catch (err: any) {
      setError(err?.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 300)
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  const handleDemoCredentialsPress = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    Keyboard.dismiss()
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color={Colors.white} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in with your email and password</Text>
            </View>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Email</Text>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v)
                    setError("")
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={handleInputFocus}
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordInputContainer}>
                  <Input
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v)
                      setError("")
                    }}
                    secureTextEntry={!showPassword}
                    onFocus={handleInputFocus}
                    editable={!loading}
                    style={{ flex: 1 }}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={Colors.gray600}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {error && <Text style={styles.errorMessage}>{error}</Text>}

              <Button
                title="Sign In"
                onPress={handleLogin}
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading}
                primaryColor={Colors.teal}
              />

              <TouchableOpacity onPress={handleDemoCredentialsPress} style={styles.demoBox} activeOpacity={0.7}>
                <View style={styles.demoIcon}>
                  <Ionicons name="play-circle" size={20} color={Colors.teal} />
                </View>
                <View style={styles.demoContent}>
                  <Text style={styles.demoTitle}>Demo Credentials (Testing)</Text>
                  <Text style={styles.demoValue}>Email: {DEMO_EMAIL}</Text>
                  <Text style={styles.demoValue}>Password: {DEMO_PASSWORD}</Text>
                  <Text style={styles.demoHint}>Tap to auto-fill</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Onboarding")} style={styles.createAccount}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.gray600} />
                <Text style={styles.createAccountText}>
                  Don't have an account? Create a new business account to get started
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  innerContainer: { flex: 1 },
  topBar: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 12 },
  backButton: { padding: 4, width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 40 },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 32,
  },
  header: { marginBottom: 40 },
  title: { fontSize: Typography["3xl"], fontWeight: Typography.bold, color: Colors.gray900, marginBottom: 12 },
  subtitle: { fontSize: Typography.base, color: Colors.gray600, lineHeight: 24 },
  form: { gap: 24 },
  label: { fontSize: Typography.base, color: Colors.gray700, marginBottom: 8 },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  errorMessage: {
    fontSize: Typography.sm,
    color: Colors.error || "#e74c3c",
    marginTop: -16,
    marginBottom: 8,
  },
  demoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.teal50 || "#e0f7f6",
    borderWidth: 1,
    borderColor: Colors.teal200 || "#b3e5e0",
    borderRadius: 12,
    padding: 16,
  },
  demoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  demoContent: { flex: 1 },
  demoTitle: { fontSize: Typography.xs, color: Colors.gray600, marginBottom: 4 },
  demoValue: { fontSize: Typography.xs, color: Colors.teal, marginBottom: 2 },
  demoHint: { fontSize: Typography.xs, color: Colors.gray500, fontStyle: "italic" },
  createAccount: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingTop: 8 },
  createAccountText: { flex: 1, fontSize: Typography.sm, color: Colors.gray600, lineHeight: 20 },
})
