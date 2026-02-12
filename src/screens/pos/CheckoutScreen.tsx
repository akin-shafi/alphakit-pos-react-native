
import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useInventory } from "../../contexts/InventoryContext"
import { useSettings } from "../../contexts/SettingsContext"
import { Button } from "../../components/Button"
import { ReceiptPreview } from "../../components/ReceiptPreview"
import { ReceiptService } from "../../services/ReceiptService"
import { Colors, BusinessThemes, getBusinessTheme } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"

export const CheckoutScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { paymentMethod, provider, receipt, items } = route.params
  const { business, user } = useAuth()
  const { refreshData } = useInventory()
  const { autoPrint, printerType, printerAddress, printerPaperSize } = useSettings()
  const [printStatus, setPrintStatus] = useState<"idle" | "printing" | "success" | "error">("idle")

  const theme = getBusinessTheme(business?.type)

  const getPaymentMethodLabel = () => {
    if (paymentMethod === "external-terminal") {
      const providerNames: Record<string, string> = {
        moniepoint: "MoniePoint",
        opay: "OPay",
        other: "External Terminal",
      }
      return `${providerNames[provider] || "External Terminal"}`
    }
    return paymentMethod.toUpperCase()
  }

  const handlePrint = async () => {
    if (!business || !receipt) return;
    
    setPrintStatus("printing")
    try {
      await ReceiptService.printReceipt(
        { ...receipt, items: items || [] }, 
        business,
        {
          type: printerType,
          address: printerAddress,
          paperSize: printerPaperSize
        }
      )
      setPrintStatus("success")
    } catch (e) {
      console.error("Print failed", e)
      setPrintStatus("error")
    }
  }

  useEffect(() => {
    // Auto print on mount if enabled
    if (autoPrint) {
        handlePrint()
    }
  }, [])

  if (!business || !user) return null

  // Use receipt data if available, fallback to zero/empty
  const displayReceipt = receipt || { subtotal: 0, tax: 0, total: 0 }
  const displayItems = items || []

  return (
    <>
      <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end', position: 'absolute', top: 48, right: 24, zIndex: 10 }}>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Dashboard")}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
            >
              <Ionicons name="apps" size={18} color={Colors.white} style={{ marginRight: 6 }} />
              <Text style={{ color: Colors.white, fontWeight: '600' }}>Dashboard</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.successSubtitle}>{getPaymentMethodLabel()} payment completed</Text>
          <Text style={styles.amountTitle}>{formatCurrency(displayReceipt.total, business?.currency)}</Text>
        </View>

        <View style={styles.content}>
          <ReceiptPreview
            business={business}
            user={user}
            items={displayItems}
            subtotal={displayReceipt.subtotal}
            tax={displayReceipt.tax}
            total={displayReceipt.total}
            saleDate={displayReceipt.sale_date}
            id={displayReceipt.id}
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
              onPress={async () => {
                await refreshData()
                navigation.navigate("MainTabs", { screen: "POSHome" })
              }}
              fullWidth
              primaryColor={theme.primary}
            />
          </View>
        </View>
      </View>
    </>
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
    marginBottom: 8,
  },
  amountTitle: {
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    color: Colors.white,
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
