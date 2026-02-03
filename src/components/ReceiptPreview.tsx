import type React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import type { CartItem, Business, User } from "../types"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"
import { formatCurrency } from "../utils/Formatter"

interface ReceiptPreviewProps {
  business: Business
  user: User
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  saleDate?: string
  id?: string | number
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ business, user, items, subtotal, tax, total, saleDate, id }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.receipt}>
        <View style={styles.header}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessInfo}>{business.address}</Text>
          <Text style={styles.divider}>--------------------------------</Text>
          <Text style={styles.dateTime}>{saleDate ? new Date(saleDate).toLocaleString() : new Date().toLocaleString()}</Text>
          <Text style={styles.cashier}>Cashier: {user.first_name} {user.last_name}</Text>
          {id && <Text style={styles.cashier}>Receipt #: {id}</Text>}
          <Text style={styles.divider}>--------------------------------</Text>
        </View>

        <View style={styles.items}>
          {items.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.product?.name || "Unknown Product"}</Text>
                <Text style={styles.itemPrice}>{formatCurrency((item.product?.price || 0) * item.quantity, business.currency)}</Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemDetail}>
                  {item.quantity} x {formatCurrency(item.product?.price || 0, business.currency)}
                </Text>
                {item.discount > 0 && <Text style={styles.itemDiscount}>-{formatCurrency(item.discount, business.currency)}</Text>}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.divider}>--------------------------------</Text>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal, business.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax, business.currency)}</Text>
          </View>
          <Text style={styles.divider}>--------------------------------</Text>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total, business.currency)}</Text>
          </View>
        </View>

        <Text style={styles.divider}>--------------------------------</Text>
        <Text style={styles.footer}>Thank you for your business!</Text>
        <Text style={styles.footer}>Please come again</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  receipt: {
    backgroundColor: Colors.white,
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  businessName: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 8,
    textAlign: "center",
  },
  businessInfo: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    textAlign: "center",
  },
  divider: {
    fontSize: Typography.sm,
    color: Colors.gray400,
    marginVertical: 8,
    fontFamily: "monospace",
  },
  dateTime: {
    fontSize: Typography.sm,
    color: Colors.gray700,
  },
  cashier: {
    fontSize: Typography.sm,
    color: Colors.gray700,
  },
  items: {
    marginBottom: 16,
  },
  item: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    flex: 1,
  },
  itemPrice: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemDetail: {
    fontSize: Typography.xs,
    color: Colors.gray600,
  },
  itemDiscount: {
    fontSize: Typography.xs,
    color: Colors.error,
  },
  totals: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: Typography.sm,
    color: Colors.gray700,
  },
  totalValue: {
    fontSize: Typography.sm,
    color: Colors.gray900,
  },
  grandTotalLabel: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  grandTotalValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  footer: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    textAlign: "center",
  },
})
