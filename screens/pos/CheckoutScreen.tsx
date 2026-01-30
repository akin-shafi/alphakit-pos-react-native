"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { Button } from "../../components/Button"
import { ReceiptPreview } from "../../components/ReceiptPreview"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const CheckoutScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { paymentMethod, provider } = route.params
  const { business, user } = useAuth()
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCart()
  const [printStatus, setPrintStatus] = useState<"idle" | "printing" | "success" | "error">("idle")

  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default

  const getPaymentMethodLabel = () => {
    if (paymentMethod === "external-terminal") {
      const providerNames: Record<string, string> = {
        moniepoint: "MoniePoint",
        opay: "OPay",
        other: "External Terminal",
      }
      return `${providerNames[provider] || "External Terminal"}`
    }
    return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
  }

  const handlePrint = async () => {
    setPrintStatus("printing")
    // Simulate printing
    setTimeout(() => {
      setPrintStatus("success")
      Alert.alert("Success", "Receipt printed successfully!", [
        {
          text: "New Sale",
          onPress: () => {
            clearCart()
            navigation.navigate("POSHome")
          },
        },
      ])
    }, 2000)
  }

  useEffect(() => {
    // Auto print on mount
    handlePrint()
  }, [])

  if (!business || !user) return null

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
        </View>
        <Text style={styles.successTitle}>Payment Successful</Text>
        <Text style={styles.successSubtitle}>{getPaymentMethodLabel()} payment completed</Text>
      </View>

      <View style={styles.content}>
        <ReceiptPreview
          business={business}
          user={user}
          items={items}
          subtotal={getSubtotal()}
          tax={getTax()}
          total={getTotal()}
        />
      </View>

      <View style={styles.footer}>
        {printStatus === "printing" && (
          <View style={styles.printingStatus}>
            <Ionicons name="print" size={24} color={theme.primary} />
            <Text style={styles.printingText}>Printing receipt...</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Print Again"
            onPress={handlePrint}
            variant="outline"
            fullWidth
            loading={printStatus === "printing"}
          />
          <Button
            title="New Sale"
            onPress={() => {
              clearCart()
              navigation.navigate("POSHome")
            }}
            fullWidth
            primaryColor={theme.primary}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  successBadge: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.white,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: Typography.base,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    gap: 16,
  },
  printingStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
  },
  printingText: {
    fontSize: Typography.base,
    color: Colors.gray700,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
})
