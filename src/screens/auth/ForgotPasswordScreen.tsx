

import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { Ionicons } from "@expo/vector-icons"
import { AuthService } from "../../services/AuthService"
import { Toast } from "../../components/Toast"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../../navigation/AuthStack"

type ScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "ForgotPassword">

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" }>({ visible: false, message: "", type: "info" })

  const handleSubmit = async () => {
    if (!email.trim()) {
      setToast({ visible: true, message: "Please enter your email", type: "error" })
      return
    }

    setLoading(true)
    try {
      // Call Backend API
      await AuthService.forgotPassword(email.trim())
      
      setToast({ visible: true, message: "OTP sent to your email", type: "success" })
      
      // Navigate to Reset Password Screen with email
      // We assume ResetPasswordScreen exists and takes email as param
      setTimeout(() => {
          navigation.navigate("ResetPassword", { email: email.trim() })
      }, 1000)
    } catch (err: any) {
      setToast({ visible: true, message: err.response?.data?.error || "Failed to send OTP", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email address and we'll send you a code to reset your password.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <Button
              title="Send Verification Code"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              variant="primary"
              style={styles.button}
            />
          </View>

          <Toast 
            visible={toast.visible} 
            message={toast.message} 
            type={toast.type} 
            onHide={() => setToast({ ...toast, visible: false })} 
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 32,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  button: {
    marginTop: 16,
  },
})
