"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { usePaymentConfig } from "../../contexts/PaymentConfigContext"
import { PaymentMethodSelector } from "../../components/PaymentMethodSelector"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useAuth()
  const { items, updateQuantity, removeItem, getSubtotal, getTax, getTotal, clearCart } = useCart()
  const { config } = usePaymentConfig()
  const [showPaymentSelector, setShowPaymentSelector] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default

  const handleCheckoutPress = () => {
    if (config.defaultMode === "ask-every-time") {
      setShowPaymentSelector(true)
    } else if (config.defaultMode === "in-app-card") {
      handleCheckout("card")
    } else if (config.defaultMode === "external-terminal") {
      handlePaymentMethodSelect("external-terminal")
    }
  }

  const handlePaymentMethodSelect = (method: string, provider?: string) => {
    setShowPaymentSelector(false)

    if (method === "external-terminal") {
      navigation.navigate("ExternalTerminal", { provider: provider || "moniepoint" })
    } else {
      handleCheckout(method)
    }
  }

  const handleCheckout = (paymentMethod: string) => {
    Alert.alert("Process Payment", `Process ${paymentMethod} payment of $${getTotal().toFixed(2)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => processPayment(paymentMethod),
      },
    ])
  }

  const processPayment = async (paymentMethod: string) => {
    setProcessingPayment(true)
    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false)
      navigation.navigate("Checkout", { paymentMethod })
    }, 1500)
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.gray300} />
          <Text style={styles.emptyTitle}>Cart is empty</Text>
          <Text style={styles.emptyText}>Add items to get started</Text>
          <Button title="Browse Products" onPress={() => navigation.goBack()} style={styles.emptyButton} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart ({items.length})</Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => (
          <Card style={styles.cartItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <TouchableOpacity onPress={() => removeItem(item.product.id)}>
                <Ionicons name="close-circle" size={24} color={Colors.gray400} />
              </TouchableOpacity>
            </View>

            <View style={styles.itemDetails}>
              <Text style={styles.itemPrice}>${item.product.price.toFixed(2)}</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={20} color={Colors.gray700} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={20} color={Colors.gray700} />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemTotal}>${(item.product.price * item.quantity).toFixed(2)}</Text>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <Card style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${getSubtotal().toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (10%)</Text>
            <Text style={styles.totalValue}>${getTax().toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={[styles.grandTotalValue, { color: theme.primary }]}>${getTotal().toFixed(2)}</Text>
          </View>
        </Card>

        <Button
          title="Proceed to Checkout"
          onPress={handleCheckoutPress}
          fullWidth
          primaryColor={theme.primary}
          loading={processingPayment}
        />

        {config.defaultMode !== "ask-every-time" && (
          <TouchableOpacity style={styles.overrideButton} onPress={() => setShowPaymentSelector(true)}>
            <Ionicons name="swap-horizontal" size={16} color={theme.primary} />
            <Text style={[styles.overrideText, { color: theme.primary }]}>Choose Different Payment Method</Text>
          </TouchableOpacity>
        )}
      </View>

      <PaymentMethodSelector
        visible={showPaymentSelector}
        onClose={() => setShowPaymentSelector(false)}
        onSelect={handlePaymentMethodSelect}
        config={config}
        primaryColor={theme.primary}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  clearButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    flex: 1,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemPrice: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    minWidth: 24,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    gap: 16,
  },
  totalsCard: {
    padding: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: Typography.base,
    color: Colors.gray600,
  },
  totalValue: {
    fontSize: Typography.base,
    color: Colors.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  grandTotalValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
  overrideButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  overrideText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.gray500,
    marginBottom: 32,
  },
  emptyButton: {
    minWidth: 200,
  },
})
