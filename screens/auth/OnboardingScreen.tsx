"use client"

import type React from "react"
import { useState } from "react"
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
import { Typography } from "../../constants/Typography"

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant", icon: "restaurant" as const },
  { value: "bar", label: "Bar", icon: "beer" as const },
  { value: "supermarket", label: "Supermarket", icon: "cart" as const },
  { value: "pharmacy", label: "Pharmacy", icon: "medical" as const },
  { value: "gas_station", label: "Gas/Fuel Station", icon: "car" as const },
  { value: "boutique", label: "Boutique", icon: "shirt" as const },
  { value: "sales_store", label: "Sales Store", icon: "storefront" as const },
  { value: "retail", label: "Retail", icon: "bag-handle" as const },
]

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { registerBusiness, setupAdmin } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [businessData, setBusinessData] = useState({
    name: "",
    type: "retail" as "retail" | "restaurant" | "pharmacy" | "grocery" | "gas_station" | "boutique",
    branchName: "",
    address: "",
    phone: "",
    email: "",
  })

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
  })

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  const handleStep1Submit = () => {
    const newErrors: { [key: string]: string } = {}

    if (!businessData.name.trim()) {
      newErrors.name = "Business name is required"
    }
    if (!businessData.branchName.trim()) {
      newErrors.branchName = "Branch name is required"
    }
    if (!businessData.type) {
      newErrors.type = "Business type is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setStep(2)
  }

  const handleStep2Submit = () => {
    const newErrors: { [key: string]: string } = {}

    if (businessData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(businessData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    if (businessData.phone.trim()) {
      const phoneRegex = /^[\d\s+\-$$$$]+$/
      if (!phoneRegex.test(businessData.phone)) {
        newErrors.phone = "Please enter a valid phone number"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setStep(3)
  }

  const handleStep3Submit = async () => {
    const newErrors: { [key: string]: string } = {}

    if (!adminData.name.trim()) {
      newErrors.adminName = "Your name is required"
    }

    if (adminData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(adminData.email)) {
        newErrors.adminEmail = "Please enter a valid email address"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await registerBusiness(businessData)
      navigation.navigate("CreatePIN", { adminData, businessData })
    } catch (error) {
      alert("Error setting up business")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          <View style={styles.topBar}>
            {step > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
                <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
              </TouchableOpacity>
            )}
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Setup Business</Text>
              <Text style={styles.stepSubtitle}>Step {step} of 3</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {step === 1 && (
                <>
                  <View style={styles.header}>
                    <Text style={styles.title}>Business Details</Text>
                    <Text style={styles.subtitle}>Tell us about your business</Text>
                  </View>

                  <View style={styles.form}>
                    <View>
                      <Input
                        label="Business Name *"
                        placeholder="My Store"
                        value={businessData.name}
                        onChangeText={(text) => {
                          setBusinessData({ ...businessData, name: text })
                          if (errors.name) {
                            setErrors({ ...errors, name: "" })
                          }
                        }}
                      />
                      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View>
                      <Input
                        label="Branch Name *"
                        placeholder="Main location"
                        value={businessData.branchName}
                        onChangeText={(text) => {
                          setBusinessData({ ...businessData, branchName: text })
                          if (errors.branchName) {
                            setErrors({ ...errors, branchName: "" })
                          }
                        }}
                      />
                      {errors.branchName && <Text style={styles.errorText}>{errors.branchName}</Text>}
                    </View>

                    <View>
                      <Text style={styles.label}>Business Type *</Text>
                      <View style={styles.typeGrid}>
                        {BUSINESS_TYPES.map((type) => (
                          <TouchableOpacity
                            key={type.value}
                            style={[styles.typeCard, businessData.type === type.value && styles.typeCardActive]}
                            onPress={() => setBusinessData({ ...businessData, type: type.value as any })}
                          >
                            <View
                              style={[
                                styles.typeIconContainer,
                                businessData.type === type.value && styles.typeIconContainerActive,
                              ]}
                            >
                              <Ionicons
                                name={type.icon}
                                size={28}
                                color={businessData.type === type.value ? Colors.white : Colors.gray600}
                              />
                            </View>
                            <Text style={styles.typeLabel}>{type.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
                    </View>
                  </View>
                </>
              )}

              {step === 2 && (
                <>
                  <View style={styles.header}>
                    <Text style={styles.title}>Contact Information</Text>
                    <Text style={styles.subtitle}>Optional - you can skip this step</Text>
                  </View>

                  <View style={styles.form}>
                    <View>
                      <Input
                        label="Phone Number"
                        placeholder="+1 234 567 8900"
                        value={businessData.phone}
                        onChangeText={(text) => {
                          setBusinessData({ ...businessData, phone: text })
                          if (errors.phone) {
                            setErrors({ ...errors, phone: "" })
                          }
                        }}
                        keyboardType="phone-pad"
                      />
                      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    <View>
                      <Input
                        label="Email"
                        placeholder="contact@mybusiness.com"
                        value={businessData.email}
                        onChangeText={(text) => {
                          setBusinessData({ ...businessData, email: text })
                          if (errors.email) {
                            setErrors({ ...errors, email: "" })
                          }
                        }}
                        keyboardType="email-address"
                      />
                      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <Input
                      label="Address"
                      placeholder="123 Main St, City, State"
                      value={businessData.address}
                      onChangeText={(text) => setBusinessData({ ...businessData, address: text })}
                      multiline
                    />
                  </View>
                </>
              )}

              {step === 3 && (
                <>
                  <View style={styles.header}>
                    <Text style={styles.title}>Create Admin Account</Text>
                    <Text style={styles.subtitle}>Setup your administrator account</Text>
                  </View>

                  <View style={styles.form}>
                    <View>
                      <Input
                        label="Your Name *"
                        placeholder="John Doe"
                        value={adminData.name}
                        onChangeText={(text) => {
                          setAdminData({ ...adminData, name: text })
                          if (errors.adminName) {
                            setErrors({ ...errors, adminName: "" })
                          }
                        }}
                      />
                      {errors.adminName && <Text style={styles.errorText}>{errors.adminName}</Text>}
                    </View>

                    <View>
                      <Input
                        label="Email (Optional)"
                        placeholder="admin@mybusiness.com"
                        value={adminData.email}
                        onChangeText={(text) => {
                          setAdminData({ ...adminData, email: text })
                          if (errors.adminEmail) {
                            setErrors({ ...errors, adminEmail: "" })
                          }
                        }}
                        keyboardType="email-address"
                      />
                      {errors.adminEmail && <Text style={styles.errorText}>{errors.adminEmail}</Text>}
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {step === 1 && (
              <Button title="Next" onPress={handleStep1Submit} fullWidth size="lg" primaryColor={Colors.teal} />
            )}
            {step === 2 && (
              <Button title="Next" onPress={handleStep2Submit} fullWidth size="lg" primaryColor={Colors.teal} />
            )}
            {step === 3 && (
              <Button
                title="Next"
                onPress={handleStep3Submit}
                fullWidth
                size="lg"
                loading={loading}
                primaryColor={Colors.teal}
              />
            )}
          </View>
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
  innerContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  stepSubtitle: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginTop: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.gray200,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.teal,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray600,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.gray700,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "30%",
    minWidth: 100,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  typeCardActive: {
    borderColor: Colors.teal,
    borderWidth: 2,
  },
  typeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  typeIconContainerActive: {
    backgroundColor: Colors.teal,
  },
  typeLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.gray900,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.white,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: 4,
  },
})
