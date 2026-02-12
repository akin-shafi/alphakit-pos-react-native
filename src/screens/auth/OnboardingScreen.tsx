
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
import type { ComponentProps } from "react"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { PasswordStrengthMeter } from "../../components/PasswordStrengthMeter"
import { useAuth } from "../../contexts/AuthContext"
import { useSubscription } from "../../contexts/SubscriptionContext"
import { AuthService } from "../../services/AuthService"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { Toast } from "../../components/Toast"

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant", icon: "restaurant" as const },
  { value: "pharmacy", label: "Pharmacy", icon: "medical" as const },
  { value: "retail", label: "Retail Store", icon: "cart" as const },
  { value: "supermarket", label: "Supermarket", icon: "basket" as const },
  { value: "boutique", label: "Boutique", icon: "shirt" as const },
  { value: "other", label: "Other", icon: "business" as const },
]

const CURRENCIES = [
  { value: "NGN", label: "Nigerian Naira (₦)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "EUR", label: "Euro (€)" },
]

export const OnboardingScreen = ({ navigation }: any) => {
  const { registerBusiness } = useAuth()
  const { availableModules, availableBundles } = useSubscription()

  const [step, setStep] = useState(1)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [skipTrial, setSkipTrial] = useState(false)
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
      if (step < 5) {
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
    if (step === 4 || step === 5) return true
    return false
  }, [step, business, admin])

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
          modules: selectedModules,
          skip_trial: skipTrial,
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
              {step > 1 ? (
                <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => navigation.navigate("Welcome")} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
                </TouchableOpacity>
              )}
              <View style={styles.headerText}>
                <Text style={styles.title}>Business Setup</Text>
                <Text style={styles.subtitle}>Step {step} of 5</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(step / 5) * 100}%` }]} />
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
                        name={item.icon as ComponentProps<typeof Ionicons>["name"]}
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
              <View>
                <Text style={styles.sectionTitle}>Business Power-Ups</Text>
                <Text style={styles.sectionSubtitle}>Choose the features that fit your business needs. 14 days free trial included!</Text>
                
                <View style={styles.modulesGrid}>
                  {availableModules.map((mod) => (
                    <TouchableOpacity
                      key={mod.type}
                      style={[
                        styles.moduleCard,
                        selectedModules.includes(mod.type) && styles.moduleCardActive
                      ]}
                      onPress={() => {
                        setSelectedModules(prev => 
                          prev.includes(mod.type) 
                            ? prev.filter(m => m !== mod.type) 
                            : [...prev, mod.type]
                        )
                      }}
                    >
                      <View style={styles.moduleHeader}>
                        <Ionicons 
                          name={selectedModules.includes(mod.type) ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={selectedModules.includes(mod.type) ? Colors.teal : Colors.gray400} 
                        />
                        <Text style={styles.modulePrice}>₦{mod.price.toLocaleString()}/mo</Text>
                      </View>
                      <Text style={styles.moduleName}>{mod.name}</Text>
                      <Text style={styles.moduleDesc}>{mod.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Billing Priority Selector */}
                <View style={styles.billingPriorityContainer}>
                   <Text style={styles.billingPriorityTitle}>Billing Priority</Text>
                   <View style={styles.billingToggle}>
                      <TouchableOpacity 
                        style={[styles.billingOption, !skipTrial && styles.billingOptionActive]}
                        onPress={() => setSkipTrial(false)}
                      >
                         <Ionicons name="time-outline" size={18} color={!skipTrial ? Colors.white : Colors.teal} />
                         <Text style={[styles.billingOptionText, !skipTrial && styles.billingOptionTextActive]}>14-Day Trial</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.billingOption, skipTrial && styles.billingOptionActiveImmediate]}
                        onPress={() => setSkipTrial(true)}
                      >
                         <Ionicons name="flash-outline" size={18} color={skipTrial ? Colors.white : Colors.warning} />
                         <Text style={[styles.billingOptionText, skipTrial && styles.billingOptionTextActiveImmediate]}>Pay Immediately</Text>
                      </TouchableOpacity>
                   </View>
                   <Text style={styles.billingHint}>
                      {skipTrial 
                        ? "Bypass verification delays with immediate account activation." 
                        : "Explore every feature with zero financial commitment for 2 weeks."}
                   </Text>
                </View>
              </View>
            )}

            {step === 5 && (
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
              title={step === 5 ? "Complete Setup" : "Continue"}
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
            onHide={React.useCallback(() => setToast((prev) => ({ ...prev, visible: false })), [])}
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
  sectionTitle: { fontSize: 20, fontWeight: "700", color: Colors.gray900, marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, color: Colors.gray600, marginBottom: 24 },
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
  modulesGrid: {
    gap: 16,
    marginTop: 10,
  },
  moduleCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  moduleCardActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal + "05",
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray900,
    marginBottom: 4,
  },
  modulePrice: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.teal,
  },
  moduleDesc: {
    fontSize: 13,
    color: Colors.gray600,
    lineHeight: 18,
  },
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray500,
  },
  modeButtonTextActive: {
    color: Colors.teal,
  },
  bundlesContainer: {
    gap: 16,
  },
  bundleCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bundleCardActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal + "05",
  },
  bundleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bundleInfo: {
    flex: 1,
    marginRight: 10,
  },
  bundleName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.gray900,
    marginBottom: 4,
  },
  bundleDesc: {
    fontSize: 13,
    color: Colors.gray500,
    lineHeight: 18,
  },
  bundlePricing: {
    alignItems: "flex-end",
  },
  bundlePrice: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.teal,
  },
  bundlePriceUnit: {
    fontSize: 10,
    color: Colors.gray400,
    fontWeight: "600",
  },
  bundleModules: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  bundleModuleTag: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bundleModuleText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.gray600,
  },
  billingPriorityContainer: {
    marginTop: 30,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  billingPriorityTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.gray900,
    marginBottom: 16,
    textAlign: "center",
  },
  billingToggle: {
    flexDirection: "row",
    gap: 10,
  },
  billingOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  billingOptionActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  billingOptionActiveImmediate: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  billingOptionText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.gray500,
    textTransform: "uppercase",
  },
  billingOptionTextActive: {
    color: Colors.white,
  },
  billingOptionTextActiveImmediate: {
    color: Colors.white,
  },
  billingHint: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.gray500,
    textAlign: "center",
    fontStyle: "italic",
  },
})
