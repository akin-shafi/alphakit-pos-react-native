

import type React from "react"
import { useState, useRef, useEffect } from "react"
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

const DEMO_EMAIL = "sakinropo@gmail.com"
const DEMO_PASSWORD = "user@123"

export const LoginEmailScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, lastLoggedUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSmartLogin, setIsSmartLogin] = useState(!!lastLoggedUser)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (lastLoggedUser && isSmartLogin) {
      setEmail(lastLoggedUser.email)
    }
  }, [lastLoggedUser, isSmartLogin])

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
      const msg = err?.response?.data?.error || err?.message || "Login failed"
      if (msg.toLowerCase().includes("verify") || msg.toLowerCase().includes("verified")) {
          // If 401 says please verify, we redirect
          navigation.navigate("OTPVerification", { email: email.trim() })
          return
      }
      setError(msg)
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Welcome")}>
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
              <Ionicons name="lock-closed" size={28} color={Colors.white} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>{isSmartLogin ? "Welcome Back" : "Sign In"}</Text>
              <Text style={styles.subtitle}>
                {isSmartLogin 
                  ? `Hello ${lastLoggedUser?.name}, please enter your password to continue` 
                  : "Sign in with your email and password"}
              </Text>
            </View>

            <View style={styles.form}>
              {!isSmartLogin ? (
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
              ) : (
                <View style={styles.accountCard}>
                   <View style={styles.accountInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{lastLoggedUser?.name.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={styles.accountName}>{lastLoggedUser?.name}</Text>
                        <Text style={styles.accountEmail}>{lastLoggedUser?.email}</Text>
                      </View>
                   </View>
                   <TouchableOpacity onPress={() => setIsSmartLogin(false)}>
                      <Text style={styles.switchAccount}>Switch Account</Text>
                   </TouchableOpacity>
                </View>
              )}

              <View>
                <Text style={styles.label}>Password</Text>
                <Input
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v)
                    setError("")
                  }}
                  secureTextEntry
                  onFocus={handleInputFocus}
                  editable={!loading}
                />
                <TouchableOpacity 
                   style={styles.forgotPassword} 
                   onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
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
  topBar: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 2 },
  backButton: { padding: 4, width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 40 },
  iconContainer: {
    width: 60,
    height: 60,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: Colors.teal,
    fontWeight: "600",
    fontSize: Typography.sm,
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
  accountCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: Typography.lg,
  },
  accountName: {
    fontSize: Typography.base,
    fontWeight: "600",
    color: Colors.gray900,
  },
  accountEmail: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
  switchAccount: {
    fontSize: Typography.xs,
    color: Colors.teal,
    fontWeight: "600",
  },
})
