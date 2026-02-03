import type React from "react"
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import type { Sale } from "../types"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"
import { useAuth } from "../contexts/AuthContext"
import { formatCurrency } from "../utils/Formatter"
import { useNavigation } from "@react-navigation/native"
import { ReceiptService } from "../services/ReceiptService"

interface ReceiptModalProps {
  visible: boolean
  onClose: () => void
  sale: Sale | null
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ visible, onClose, sale }) => {
  const { business } = useAuth()
  const navigation = useNavigation<any>()
  
  if (!sale) return null

  const handleReprint = async () => {
    if (sale && business) {
      try {
        await ReceiptService.printReceipt(sale, business)
      } catch (error) {
        alert("Failed to print receipt")
      }
    }
  }
  
  const handleGoHome = () => {
      onClose()
      navigation.navigate("MainTabs", { screen: "POSHome" })
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipt Details</Text>
          <TouchableOpacity onPress={handleGoHome} style={styles.backButton}>
            <Ionicons name="home-outline" size={24} color={Colors.gray900} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.receipt}>
            <View style={styles.receiptHeader}>
              <View style={styles.storeIconContainer}>
                <Ionicons name="storefront" size={32} color={Colors.teal} />
              </View>
              <Text style={styles.receiptTitle}>{business?.name || "SALES RECEIPT"}</Text>
              {business?.address && <Text style={styles.receiptSubtitle}>{business.address}</Text>}
              {business?.city && <Text style={styles.receiptSubtitle}>{business.city}</Text>}
              <Text style={[styles.receiptDate, { marginTop: 8 }]}>{new Date(sale.createdAt).toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={[styles.receiptSection, { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View>
                <Text style={styles.sectionLabel}>Receipt No</Text>
                <Text style={styles.sectionValue}>{(sale as any).receiptNo || "#" + sale.id.toString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.sectionLabel}>Cashier</Text>
                <Text style={styles.sectionValue}>{sale.cashierName || "Staff"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.itemsHeader}>ITEMS</Text>
            {sale.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} x {formatCurrency(item.product.price, business?.currency)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.quantity * item.product.price - item.discount, business?.currency)}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(sale.subtotal, business?.currency)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{formatCurrency(sale.tax, business?.currency)}</Text>
            </View>

            {sale.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, { color: Colors.success }]}>-{formatCurrency(sale.discount, business?.currency)}</Text>
              </View>
            )}

            <View style={[styles.divider, { marginVertical: 8 }]} />

            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(sale.total, business?.currency)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentValue}>{sale.paymentMethod.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.thankYou}>Thank you for your business!</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.reprintButton} onPress={handleReprint}>
            <Ionicons name="print-outline" size={20} color={Colors.white} />
            <Text style={styles.reprintText}>Reprint Receipt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  contentContainer: {
    padding: 16,
  },
  receipt: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  storeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.teal + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: 4,
  },
  receiptSubtitle: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    textAlign: "center",
  },
  receiptDate: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 16,
  },
  receiptSection: {
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  itemsHeader: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.gray900,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  itemTotal: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: Typography.base,
    color: Colors.gray700,
  },
  totalValue: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.gray900,
  },
  grandTotalLabel: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  grandTotalValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.teal,
  },
  paymentInfo: {
    alignItems: "center",
    marginTop: 8,
  },
  paymentLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginBottom: 8,
  },
  paymentBadge: {
    backgroundColor: Colors.teal + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  paymentValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.teal,
  },
  thankYou: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  reprintButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  reprintText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
})
