

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Button } from "../../components/Button"
import { useAuthStore } from "../../stores/useAuthStore"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const CreatePINScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { businessData, userId } = route.params
  const { setPin, login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [pin, setPinState] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [step, setStep] = useState<"create" | "confirm">("create")

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  const handleNumberPress = (num: string) => {
    if (step === "create") {
      if (pin.length < 4) setPinState(pin + num)
    } else {
      if (confirmPin.length < 4) setConfirmPin(confirmPin + num)
    }
  }

  const handleBackspace = () => {
    if (step === "create") setPinState(pin.slice(0, -1))
    else setConfirmPin(confirmPin.slice(0, -1))
  }

  const handleContinue = () => {
    if (step === "create") {
      if (pin.length === 4) setStep("confirm")
    } else {
      if (confirmPin.length === 4) handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      alert("PINs do not match. Please try again.")
      setConfirmPin("")
      return
    }

    setLoading(true)
    try {
      // Call setPin from Zustand, which talks to AuthService
      await setPin(userId, pin)

      // Auto-login after onboarding
      await login(businessData.businessId, pin)

      // Navigate to main dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      })
    } catch (error: any) {
      alert(error.message || "Error setting up PIN")
    } finally {
      setLoading(false)
    }
  }

  const currentPin = step === "create" ? pin : confirmPin
  const isComplete = currentPin.length === 4

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          <View style={styles.topBar}>
            {step === "confirm" && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep("create")
                  setConfirmPin("")
                }}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
              </TouchableOpacity>
            )}
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Setup Business</Text>
              <Text style={styles.stepSubtitle}>Step 4 of 4</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: "100%" }]} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="keypad" size={48} color={Colors.white} />
                </View>
              </View>

              <View style={styles.header}>
                <Text style={styles.title}>{step === "create" ? "Create Your PIN" : "Confirm Your PIN"}</Text>
                <Text style={styles.subtitle}>
                  {step === "create"
                    ? "Enter a 4-digit PIN to secure your account"
                    : "Re-enter your 4-digit PIN to confirm"}
                </Text>
              </View>

              <View style={styles.pinDisplay}>
                {[0, 1, 2, 3].map((index) => (
                  <View key={index} style={[styles.pinDot, currentPin.length > index && styles.pinDotFilled]} />
                ))}
              </View>

              <View style={styles.keypad}>
                {["123", "456", "789"].map((row) => (
                  <View key={row} style={styles.keypadRow}>
                    {row.split("").map((num) => (
                      <TouchableOpacity key={num} style={styles.keypadButton} onPress={() => handleNumberPress(num)}>
                        <Text style={styles.keypadButtonText}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                <View style={styles.keypadRow}>
                  <View style={styles.keypadButton} />
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("0")}>
                    <Text style={styles.keypadButtonText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.keypadButton} onPress={handleBackspace}>
                    <Ionicons name="backspace-outline" size={28} color={Colors.gray900} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title={step === "create" ? "Continue" : "Create Business"}
                onPress={handleContinue}
                fullWidth
                size="lg"
                disabled={!isComplete}
                loading={loading}
                primaryColor={Colors.teal}
              />
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
  topBar: { flexDirection: "row", alignItems: "center", paddingTop: 48, paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  backButton: { padding: 4 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.gray900 },
  stepSubtitle: { fontSize: Typography.sm, color: Colors.gray600, marginTop: 2 },
  progressContainer: { height: 4, backgroundColor: Colors.gray200, marginHorizontal: 20, marginBottom: 24, borderRadius: 2, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: Colors.teal, borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  iconContainer: { alignItems: "center", marginBottom: 32 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 48 },
  title: { fontSize: Typography["2xl"], fontWeight: Typography.bold, color: Colors.gray900, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: Typography.base, color: Colors.gray600, textAlign: "center" },
  pinDisplay: { flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 64 },
  pinDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.gray200 },
  pinDotFilled: { backgroundColor: Colors.teal },
  keypad: { gap: 16 },
  keypadRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  keypadButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.gray200 },
  keypadButtonText: { fontSize: 32, fontWeight: Typography.semibold, color: Colors.gray900 },
  footer: { paddingHorizontal: 20, paddingVertical: 16 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 100 },
})
