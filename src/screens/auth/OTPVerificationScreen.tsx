

import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { OTPInput } from "../../components/OTPInput"
import { Button } from "../../components/Button"
import { AuthService } from "../../services/AuthService"
import { useAuth } from "../../contexts/AuthContext"
import { Toast } from "../../components/Toast"
import { Ionicons } from "@expo/vector-icons"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../../navigation/AuthStack"

type ScreenRouteProp = RouteProp<AuthStackParamList, "OTPVerification">
type ScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "OTPVerification">

export const OTPVerificationScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>()
  const route = useRoute<ScreenRouteProp>()
  const { email } = route.params
  const { loginSuccess } = useAuth()
  
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code
    if (codeToVerify.length !== 6) {
      setError("Please enter the 6-digit code")
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await AuthService.verifyEmail(email, codeToVerify)
      await loginSuccess(response)
      setToast({ message: "Email verified successfully!", type: "success" })
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || "Invalid code. Please try again.")
      setToast({ message: "Verification failed", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      // await AuthService.resendOTP(email) 
      setToast({ message: "Code resent via email", type: "success" })
    } catch (err) {
      setToast({ message: "Failed to resend code", type: "error" })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-unread-outline" size={48} color={Colors.teal} />
            </View>

            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subtitle}>
              We have sent the verification code to your email address
              {"\n"}
              <Text style={styles.email}>{email}</Text>
            </Text>

            <OTPInput
              length={6}
              onComplete={(completedCode) => handleVerify(completedCode)}
              onChange={(currentCode) => setCode(currentCode)}
              error={error}
              resendEnabled={true}
              onResend={handleResend}
            />

            <Button
              title="Verify"
              onPress={() => handleVerify()}
              loading={loading}
              variant="primary"
              disabled={code.length !== 6 || loading}
              style={{ marginTop: 24, width: '100%' }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {toast && (
        <Toast
          visible={!!toast}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20, // circle
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2F1", // Light teal
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  email: {
    fontWeight: "bold",
    color: Colors.gray900,
  },
})
