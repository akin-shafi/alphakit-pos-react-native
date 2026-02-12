

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { Button } from "../../components/Button"
import { Colors, BusinessThemes, getBusinessTheme } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"
import { SalesService } from "../../services/SalesService"

export const ExternalTerminalScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { provider = "moniepoint" } = route.params
  const { business, activeShift } = useAuth()
  const { items, getTotal, clearCart } = useCart()
  const [processing, setProcessing] = useState(false)

  const theme = getBusinessTheme(business?.type)

  const providerNames: Record<string, string> = {
    moniepoint: "MoniePoint",
    opay: "OPay",
    other: "External POS Terminal",
  }

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true)

      const payload = {
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        payment_method: "CARD", // External terminal is card-based
        amount_paid: getTotal(),
        discount: items.reduce((sum, item) => sum + item.discount, 0),
        shift_id: activeShift?.id,
        terminal_provider: provider.toUpperCase(),
      }

      const receiptData = await SalesService.createSale(payload)

      // Success! Clear cart and navigate
      clearCart()
      navigation.navigate("Checkout", {
        receipt: receiptData.sale,
        items: (receiptData.items || []).map((item: any) => ({
          product: {
            id: item.product_id,
            name: item.product_name,
            price: item.unit_price,
          },
          quantity: item.quantity,
          discount: 0,
        })),
        paymentMethod: "external-terminal",
        provider,
      })
    } catch (error: any) {
      console.error("Payment failed:", error)
      Alert.alert("Payment Failed", error.response?.data?.error || "Failed to process payment. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>External Terminal Payment</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.instructionCard}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
            <Ionicons name="terminal" size={64} color={theme.primary} />
          </View>

          <Text style={styles.providerName}>{providerNames[provider]}</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Charge</Text>
            <Text style={[styles.amountValue, { color: theme.primary }]}>{formatCurrency(getTotal(), business?.currency)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>Instructions:</Text>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Enter the amount on your {providerNames[provider]} terminal</Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Process the card payment on the terminal</Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Wait for successful payment confirmation</Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Click "Payment Received" below to print receipt</Text>
            </View>
          </View>

          {processing && (
            <View style={styles.confirmingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.confirmingText}>Processing payment...</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Payment Received"
          onPress={handleConfirmPayment}
          fullWidth
          primaryColor={theme.primary}
          disabled={processing}
          loading={processing}
        />
        <Button title="Cancel" onPress={handleCancel} variant="outline" fullWidth disabled={processing} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  providerName: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 24,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: Typography.bold,
    letterSpacing: -1,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.gray200,
    marginBottom: 24,
  },
  instructions: {
    width: "100%",
    gap: 16,
  },
  instructionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 8,
  },
  instructionStep: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray900,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.gray700,
    lineHeight: 24,
  },
  confirmingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  confirmingText: {
    fontSize: Typography.base,
    color: Colors.gray600,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    gap: 12,
  },
})
