
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
import { PasswordStrengthMeter } from "../../components/PasswordStrengthMeter"
import { useAuth } from "../../contexts/AuthContext"
import { AuthService } from "../../services/AuthService"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { Toast } from "../../components/Toast"

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant", icon: "restaurant" },
  { value: "pharmacy", label: "Pharmacy", icon: "medical" },
  { value: "retail", label: "Retail Store", icon: "cart" },
  { value: "supermarket", label: "Supermarket", icon: "basket" },
  { value: "boutique", label: "Boutique", icon: "shirt" },
  { value: "other", label: "Other", icon: "business" },
]

const CURRENCIES = [
  { value: "NGN", label: "Nigerian Naira (₦)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "EUR", label: "Euro (€)" },
]

export const OnboardingScreen = ({ navigation }: any) => {
  const { registerBusiness } = useAuth()

  const [step, setStep] = useState(1)
  const [useSampleData, setUseSampleData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" as "error" | "success" | "info" })

  const [business, setBusiness] = useState({
    name: "",
    type: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    currency: "NGN",
  })

  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!business.name.trim()) newErrors.name = "Business name is required"
      if (!business.type) newErrors.type = "Please select a business type"
    } else if (step === 2) {
      if (!business.address.trim()) newErrors.address = "Address is required"
      if (!business.city.trim()) newErrors.city = "City is required"
    } else if (step === 3) {
      if (!admin.firstName.trim()) newErrors.firstName = "First name is required"
      if (!admin.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!admin.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(admin.email)) {
        newErrors.email = "Invalid email format"
      }
      if (!admin.password) {
        newErrors.password = "Password is required"
      } else if (admin.password.length < 8) {
        newErrors.password = "Min 8 characters"
      }
      if (admin.password !== admin.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1)
      } else {
        submit()
      }
    }
  }

  const isCurrentStepValid = useMemo(() => {
    if (step === 1) return !!(business.name.trim() && business.type)
    if (step === 2) return !!(business.address.trim() && business.city.trim() && business.currency)
    if (step === 3) {
      return !!(
        admin.firstName.trim() &&
        admin.lastName.trim() &&
        admin.email.trim() &&
        admin.password &&
        admin.password.length >= 8 &&
        admin.password === admin.confirmPassword
      )
    }
    if (step === 4) return true
    return false
  }, [step, business, admin, useSampleData])

  const submit = async () => {
    setLoading(true)
    try {
      await registerBusiness({
        business: {
          name: business.name.trim(),
          type: business.type,
          address: business.address.trim(),
          city: business.city.trim(),
          email: business.email.trim() || undefined,
          phone: business.phone.trim() || undefined,
          currency: business.currency,
        },
        user: {
          first_name: admin.firstName.trim(),
          last_name: admin.lastName.trim(),
          email: admin.email.trim(),
          password: admin.password,
        },
      })

      if (useSampleData) {
        try {
          // We need business ID for seeding, but registerBusiness returns it.
          // However, the seeding call needs the business object to be in state.
          // Since we are auto-logged in by registerBusiness, we can call seed.
          await AuthService.seedSampleData(0, business.type.toUpperCase()); // businessId is handled by header in backend
        } catch (seedError) {
          console.warn("Failed to seed sample data:", seedError);
        }
      }

      setToast({ visible: true, message: "Account created! Verify your email.", type: "success" })
      setTimeout(() => {
        navigation.navigate("OTPVerification", { email: admin.email.trim() })
      }, 1000)
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to complete onboarding"
      setToast({ visible: true, message: msg, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              {step > 1 && (
                <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
                </TouchableOpacity>
              )}
              <View style={styles.headerText}>
                <Text style={styles.title}>Business Setup</Text>
                <Text style={styles.subtitle}>Step {step} of 4</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(step / 4) * 100}%` }]} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
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
                      style={[styles.typeCard, business.type === item.value && styles.typeCardActive]}
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
                      <Text style={[styles.typeLabel, business.type === item.value && styles.typeLabelActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="Business Address"
                  placeholder="123 Main Street"
                  value={business.address}
                  onChangeText={(v) => {
                    setBusiness({ ...business, address: v })
                    clearError("address")
                  }}
                  error={errors.address}
                />

                <Input
                  label="City"
                  placeholder="New York"
                  value={business.city}
                  onChangeText={(v) => {
                    setBusiness({ ...business, city: v })
                    clearError("city")
                  }}
                  error={errors.city}
                />

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
                  error={errors.email}
                />

                <Text style={styles.currencySectionLabel}>System Currency</Text>
                <View style={styles.currencyGrid}>
                  {CURRENCIES.map((cur) => (
                    <TouchableOpacity
                      key={cur.value}
                      style={[
                        styles.currencyCard,
                        business.currency === cur.value && styles.currencyCardActive,
                      ]}
                      onPress={() => {
                        setBusiness({ ...business, currency: cur.value })
                        clearError("currency")
                      }}
                    >
                      <Text
                        style={[
                          styles.currencyLabel,
                          business.currency === cur.value && styles.currencyLabelActive,
                        ]}
                      >
                        {cur.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.currency && <Text style={styles.errorText}>{errors.currency}</Text>}
              </>
            )}

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

                <Input
                  label="Password"
                  placeholder="Enter a strong password"
                  value={admin.password}
                  onChangeText={(v) => {
                    setAdmin({ ...admin, password: v })
                    clearError("password")
                  }}
                  secureTextEntry
                  error={errors.password}
                />

                <PasswordStrengthMeter password={admin.password} />

                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={admin.confirmPassword}
                  onChangeText={(v) => {
                    setAdmin({ ...admin, confirmPassword: v })
                    clearError("confirmPassword")
                  }}
                  secureTextEntry
                  error={errors.confirmPassword}
                />
              </>
            )}

            {step === 4 && (
              <View style={styles.sampleDataContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="gift-outline" size={48} color={Colors.teal} />
                </View>
                <Text style={styles.sampleDataTitle}>Populate Sample Data?</Text>
                <Text style={styles.sampleDataText}>
                  Would you like to pre-populate your account with sample products, categories, and inventory based on the
                  {BUSINESS_TYPES.find((t) => t.value === business.type)?.label || "selected"} business type?
                </Text>

                <View style={styles.choiceContainer}>
                  <TouchableOpacity
                    style={[styles.choiceCard, useSampleData === true && styles.choiceCardActive]}
                    onPress={() => setUseSampleData(true)}
                  >
                    <Ionicons
                      name="checkbox"
                      size={24}
                      color={useSampleData === true ? Colors.teal : Colors.gray300}
                    />
                    <View style={styles.choiceTextContainer}>
                      <Text style={styles.choiceLabel}>Yes, populate data</Text>
                      <Text style={styles.choiceSublabel}>Start with a ready-made inventory</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.choiceCard, useSampleData === false && styles.choiceCardActive]}
                    onPress={() => setUseSampleData(false)}
                  >
                    <Ionicons
                      name="square-outline"
                      size={24}
                      color={useSampleData === false ? Colors.teal : Colors.gray300}
                    />
                    <View style={styles.choiceTextContainer}>
                      <Text style={styles.choiceLabel}>No, start empty</Text>
                      <Text style={styles.choiceSublabel}>I'll add my own products manually</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={step === 4 ? "Complete Setup" : "Continue"}
              onPress={handleNext}
              loading={loading}
              disabled={!isCurrentStepValid || loading}
              style={{
                backgroundColor: isCurrentStepValid ? Colors.teal : "#a0d8d3",
              }}
            />
          </View>

          <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 15 },
  headerText: { flex: 1 },
  title: { fontSize: 26, fontWeight: "700", color: Colors.gray900 },
  subtitle: { fontSize: 16, color: Colors.gray600, marginTop: 4 },
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
  sampleDataContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  sampleDataTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 12,
    textAlign: "center",
  },
  sampleDataText: {
    fontSize: Typography.base,
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  choiceContainer: {
    width: "100%",
    gap: 16,
  },
  choiceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  choiceCardActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal + "05", // very light teal
  },
  choiceTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  choiceLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 2,
  },
  choiceSublabel: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  currencySectionLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
    marginTop: 20,
    marginBottom: 12,
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  currencyCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    minWidth: "47%",
  },
  currencyCardActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal + "10",
  },
  currencyLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    textAlign: "center",
  },
  currencyLabelActive: {
    color: Colors.teal,
    fontWeight: Typography.bold,
  },
})
