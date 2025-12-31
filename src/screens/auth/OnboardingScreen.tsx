"use client"

import React, { useState, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant", icon: "restaurant" },
  { value: "bar", label: "Bar", icon: "beer" },
  { value: "supermarket", label: "Supermarket", icon: "cart" },
  { value: "pharmacy", label: "Pharmacy", icon: "medical" },
  { value: "gas_station", label: "Gas Station", icon: "car" },
  { value: "boutique", label: "Boutique", icon: "shirt" },
]

export const OnboardingScreen = ({ navigation }: any) => {
  const { registerBusiness } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [business, setBusiness] = useState({
    name: "",
    type: "",
    phone: "",
    email: "",
  })

  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const clearError = (field: string) => {
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {}
    if (!business.name.trim()) e.name = "Business name is required"
    if (!business.type) e.type = "Please select a business type"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {}
    if (business.phone.trim() && !/^[0-9+\-\s()]+$/.test(business.phone.trim())) {
      e.phone = "Invalid phone number format"
    }
    if (business.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email.trim())) {
      e.email = "Invalid email address"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = (): boolean => {
    const e: Record<string, string> = {}
    if (!admin.firstName.trim()) e.firstName = "First name is required"
    if (!admin.lastName.trim()) e.lastName = "Last name is required"
    if (!admin.email.trim()) {
      e.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email.trim())) {
      e.email = "Invalid email address"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const isCurrentStepValid = useMemo(() => {
    if (step === 1) {
      return business.name.trim() !== "" && business.type !== ""
    }
    if (step === 2) {
      const phoneValid = !business.phone.trim() || /^[0-9+\-\s()]+$/.test(business.phone.trim())
      const emailValid = !business.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email.trim())
      return phoneValid && emailValid
    }
    if (step === 3) {
      return (
        admin.firstName.trim() !== "" &&
        admin.lastName.trim() !== "" &&
        admin.email.trim() !== "" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email.trim())
      )
    }
    return false
  }, [step, business.name, business.type, business.phone, business.email, admin])

  const handleNext = () => {
    let isValid = false

    if (step === 1) {
      isValid = validateStep1()
    } else if (step === 2) {
      isValid = validateStep2()
    } else if (step === 3) {
      isValid = validateStep3()
    }

    if (isValid) {
      if (step === 3) {
        submit()
      } else {
        setStep(step + 1)
      }
    }
  }

  const submit = async () => {
    setLoading(true)
    try {
      await registerBusiness({
        business: {
          name: business.name.trim(),
          type: business.type,
          email: business.email.trim() || undefined,
          phone: business.phone.trim() || undefined,
        },
        owner: {
          firstName: admin.firstName.trim(),
          lastName: admin.lastName.trim(),
          email: admin.email.trim(),
        },
      })
      navigation.replace("Login")
    } catch (error: any) {
      alert(error?.message || "Failed to complete onboarding")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            {step > 1 && (
              <TouchableOpacity onPress={() => setStep(step - 1)}>
                <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>Business Setup</Text>
            <Text style={styles.subtitle}>Step {step} of 3</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Step 1 */}
            {step === 1 && (
              <>
                <Input
                  label="Business Name"
                  placeholder="e.g. Joe's Coffee Shop"
                  value={business.name}
                  onChangeText={(v) => {
                    setBusiness({ ...business, name: v })
                    clearError("name")
                  }}
                  error={errors.name}
                />

                <Text style={styles.sectionLabel}>Business Type</Text>
                {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}

                <View style={styles.grid}>
                  {BUSINESS_TYPES.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.typeCard,
                        business.type === item.value && styles.typeCardActive,
                      ]}
                      onPress={() => {
                        setBusiness({ ...business, type: item.value })
                        clearError("type")
                      }}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={28}
                        color={business.type === item.value ? "#fff" : Colors.gray600}
                      />
                      <Text
                        style={[
                          styles.typeLabel,
                          business.type === item.value && styles.typeLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <Input
                  label="Business Phone (optional)"
                  placeholder="+1 (555) 123-4567"
                  value={business.phone}
                  onChangeText={(v) => {
                    setBusiness({ ...business, phone: v })
                    clearError("phone")
                  }}
                  keyboardType="phone-pad"
                  error={errors.phone}
                />

                <Input
                  label="Business Email (optional)"
                  placeholder="contact@business.com"
                  value={business.email}
                  onChangeText={(v) => {
                    setBusiness({ ...business, email: v })
                    clearError("email")
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <Input
                  label="First Name"
                  placeholder="John"
                  value={admin.firstName}
                  onChangeText={(v) => {
                    setAdmin({ ...admin, firstName: v })
                    clearError("firstName")
                  }}
                  error={errors.firstName}
                />

                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={admin.lastName}
                  onChangeText={(v) => {
                    setAdmin({ ...admin, lastName: v })
                    clearError("lastName")
                  }}
                  error={errors.lastName}
                />

                <Input
                  label="Your Email"
                  placeholder="john@example.com"
                  value={admin.email}
                  onChangeText={(v) => {
                    setAdmin({ ...admin, email: v })
                    clearError("email")
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={step === 3 ? "Complete Setup" : "Continue"}
              onPress={handleNext}
              loading={loading}
              disabled={!isCurrentStepValid || loading}
              style={{
                backgroundColor: isCurrentStepValid ? Colors.teal : "#a0d8d3",
              }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700", color: Colors.gray900 },
  subtitle: { fontSize: 16, color: Colors.gray600, marginTop: 6 },
  progressContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 30,
  },
  progressBar: { height: "100%", backgroundColor: Colors.teal },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: Colors.gray800,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  typeCard: {
    width: "48%",
    paddingVertical: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  typeCardActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  typeLabel: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.gray700,
  },
  typeLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  footer: { paddingVertical: 20 },
  errorText: { color: "#e74c3c", fontSize: 13, marginTop: 4, marginLeft: 4 },
})