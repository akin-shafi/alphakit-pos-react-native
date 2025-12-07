"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

const BUSINESS_TYPES = [
  { value: "retail", label: "Retail Store", icon: "🏪" },
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "pharmacy", label: "Pharmacy", icon: "💊" },
  { value: "grocery", label: "Grocery", icon: "🛒" },
]

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { registerBusiness, setupAdmin } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [businessData, setBusinessData] = useState({
    name: "",
    type: "retail" as "retail" | "restaurant" | "pharmacy" | "grocery",
    address: "",
    phone: "",
    email: "",
  })

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    pin: "",
    confirmPin: "",
  })

  const handleBusinessSubmit = () => {
    if (!businessData.name || !businessData.address || !businessData.phone) {
      alert("Please fill all required fields")
      return
    }
    setStep(2)
  }

  const handleAdminSubmit = async () => {
    if (!adminData.name || !adminData.pin || adminData.pin !== adminData.confirmPin) {
      alert("Please check all fields and ensure PINs match")
      return
    }

    setLoading(true)
    try {
      await registerBusiness(businessData)
      await setupAdmin({
        name: adminData.name,
        email: adminData.email,
        pin: adminData.pin,
        role: "admin" as any,
      })
      navigation.replace("POSHome")
    } catch (error) {
      alert("Error setting up business")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{step === 1 ? "Business Registration" : "Admin Setup"}</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? "Tell us about your business" : "Create your admin account"}
          </Text>
        </View>

        <View style={styles.progress}>
          <View style={[styles.progressBar, step >= 1 && styles.progressBarActive]} />
          <View style={[styles.progressBar, step >= 2 && styles.progressBarActive]} />
        </View>

        {step === 1 ? (
          <View style={styles.form}>
            <Input
              label="Business Name *"
              placeholder="Enter business name"
              value={businessData.name}
              onChangeText={(text) => setBusinessData({ ...businessData, name: text })}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Business Type *</Text>
              <View style={styles.typeGrid}>
                {BUSINESS_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.typeCard, businessData.type === type.value && styles.typeCardActive]}
                    onPress={() => setBusinessData({ ...businessData, type: type.value as any })}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={styles.typeLabel}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Address *"
              placeholder="Business address"
              value={businessData.address}
              onChangeText={(text) => setBusinessData({ ...businessData, address: text })}
              multiline
            />

            <Input
              label="Phone *"
              placeholder="+1234567890"
              value={businessData.phone}
              onChangeText={(text) => setBusinessData({ ...businessData, phone: text })}
              keyboardType="phone-pad"
            />

            <Input
              label="Email"
              placeholder="business@email.com"
              value={businessData.email}
              onChangeText={(text) => setBusinessData({ ...businessData, email: text })}
              keyboardType="email-address"
            />

            <Button title="Continue" onPress={handleBusinessSubmit} fullWidth size="lg" />
          </View>
        ) : (
          <View style={styles.form}>
            <Input
              label="Admin Name *"
              placeholder="Enter your name"
              value={adminData.name}
              onChangeText={(text) => setAdminData({ ...adminData, name: text })}
            />

            <Input
              label="Email"
              placeholder="admin@email.com"
              value={adminData.email}
              onChangeText={(text) => setAdminData({ ...adminData, email: text })}
              keyboardType="email-address"
            />

            <Input
              label="Admin PIN *"
              placeholder="4-6 digit PIN"
              value={adminData.pin}
              onChangeText={(text) => setAdminData({ ...adminData, pin: text })}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />

            <Input
              label="Confirm PIN *"
              placeholder="Re-enter PIN"
              value={adminData.confirmPin}
              onChangeText={(text) => setAdminData({ ...adminData, confirmPin: text })}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />

            <View style={styles.actions}>
              <Button title="Back" onPress={() => setStep(1)} variant="outline" fullWidth size="lg" />
              <Button title="Complete Setup" onPress={handleAdminSubmit} fullWidth size="lg" loading={loading} />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray500,
  },
  progress: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: Colors.black,
  },
  form: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.gray200,
  },
  typeCardActive: {
    borderColor: Colors.black,
    backgroundColor: Colors.gray50,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.gray700,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
})
