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
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

const DEMO_BUSINESS_ID = "BIZ001"

export const BusinessIDScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [businessId, setBusinessId] = useState("")
  const scrollViewRef = useRef<ScrollView>(null)

  const handleContinue = () => {
    if (!businessId.trim()) {
      alert("Please enter Business ID")
      return
    }
    navigation.navigate("PIN", { businessId })
  }

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 300)
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  const handleDemoIdPress = () => {
    setBusinessId(DEMO_BUSINESS_ID)
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
              <Ionicons name="business" size={48} color={Colors.white} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Enter Business ID</Text>
              <Text style={styles.subtitle}>Enter your unique Business ID to continue</Text>
            </View>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Business ID</Text>
                <Input
                  placeholder="Enter Business ID"
                  value={businessId}
                  onChangeText={setBusinessId}
                  autoCapitalize="characters"
                  onFocus={handleInputFocus}
                />
              </View>

              <Button title="Continue" onPress={handleContinue} fullWidth size="lg" primaryColor={Colors.teal} />

              <TouchableOpacity onPress={handleDemoIdPress} style={styles.demoIdBox} activeOpacity={0.7}>
                <View style={styles.demoIdIcon}>
                  <Ionicons name="play-circle" size={20} color={Colors.teal} />
                </View>
                <View style={styles.demoIdContent}>
                  <Text style={styles.demoIdTitle}>Demo Business ID (Testing)</Text>
                  <Text style={styles.demoIdValue}>{DEMO_BUSINESS_ID}</Text>
                  <Text style={styles.demoIdHint}>Tap to auto-fill</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Onboarding")} style={styles.createAccount}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.gray600} />
                <Text style={styles.createAccountText}>
                  Don't have a Business ID? Create a new account to get started
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
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  innerContainer: {
    flex: 1,
  },
  topBar: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
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
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray600,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  label: {
    fontSize: Typography.base,
    color: Colors.gray700,
    marginBottom: 8,
  },
  demoIdBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.teal50,
    borderWidth: 1,
    borderColor: Colors.teal200,
    borderRadius: 12,
    padding: 16,
  },
  demoIdIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  demoIdContent: {
    flex: 1,
  },
  demoIdTitle: {
    fontSize: Typography.xs,
    color: Colors.gray600,
    marginBottom: 4,
  },
  demoIdValue: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.teal,
    marginBottom: 2,
  },
  demoIdHint: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    fontStyle: "italic",
  },
  createAccount: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 8,
  },
  createAccountText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.gray600,
    lineHeight: 20,
  },
})
