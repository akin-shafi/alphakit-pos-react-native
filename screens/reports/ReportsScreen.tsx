"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { RolePermissions } from "../../constants/Roles"
import type { Sale } from "../../types"
import { ReceiptModal } from "../../components/ReceiptModal"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const ReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today")
  const [selectedTransaction, setSelectedTransaction] = useState<Sale | null>(null)
  const [receiptModalVisible, setReceiptModalVisible] = useState(false)

  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default
  const canView = user ? RolePermissions[user.role].canViewReports : false

  // Mock data
  const salesData = {
    today: { sales: 45, revenue: 1250.75, items: 132 },
    week: { sales: 312, revenue: 8945.5, items: 876 },
    month: { sales: 1245, revenue: 35678.25, items: 3421 },
  }

  const mockTransactions: Sale[] = [
    {
      id: "TXN001",
      businessId: "1",
      branchId: "1",
      userId: "1",
      items: [
        {
          product: { id: "1", name: "Coca Cola 500ml", price: 2.5, category: "Beverages" } as any,
          quantity: 2,
          discount: 0,
        },
        { product: { id: "2", name: "Chips BBQ", price: 3.0, category: "Snacks" } as any, quantity: 1, discount: 0 },
      ],
      subtotal: 8.0,
      tax: 0.8,
      discount: 0,
      total: 8.8,
      paymentMethod: "cash",
      status: "completed",
      createdAt: new Date(),
      syncStatus: "synced",
    },
    {
      id: "TXN002",
      businessId: "1",
      branchId: "1",
      userId: "1",
      items: [
        { product: { id: "3", name: "Bread White", price: 2.5, category: "Bakery" } as any, quantity: 1, discount: 0 },
      ],
      subtotal: 2.5,
      tax: 0.25,
      discount: 0,
      total: 2.75,
      paymentMethod: "card",
      status: "completed",
      createdAt: new Date(Date.now() - 3600000),
      syncStatus: "synced",
    },
  ]

  const transactions = selectedPeriod === "today" ? mockTransactions : []

  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0)
  const avgSale = transactions.length > 0 ? totalSales / transactions.length : 0
  const totalTax = transactions.reduce((sum, t) => sum + t.tax, 0)
  const totalDiscount = transactions.reduce((sum, t) => sum + t.discount, 0)

  const handleTransactionPress = (transaction: Sale) => {
    setSelectedTransaction(transaction)
    setReceiptModalVisible(true)
  }

  const handleGenerateReport = () => {
    navigation.navigate("DetailedReport")
  }

  if (!canView) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.noAccess}>
          <Ionicons name="lock-closed" size={64} color={Colors.gray300} />
          <Text style={styles.noAccessTitle}>Access Denied</Text>
          <Text style={styles.noAccessText}>You don't have permission to view reports</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTop}>
          <Text style={styles.businessName}>{business?.name || "Demo Store"}</Text>
        </View>
        <Text style={styles.headerSubtitle}>Daily sales overview</Text>
      </View>

      <View style={styles.periodTabs}>
        <TouchableOpacity
          style={[styles.periodTab, selectedPeriod === "today" && styles.periodTabActive]}
          onPress={() => setSelectedPeriod("today")}
        >
          <Text style={[styles.periodTabText, selectedPeriod === "today" && styles.periodTabTextActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodTab, selectedPeriod === "week" && styles.periodTabActive]}
          onPress={() => setSelectedPeriod("week")}
        >
          <Text style={[styles.periodTabText, selectedPeriod === "week" && styles.periodTabTextActive]}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodTab, selectedPeriod === "month" && styles.periodTabActive]}
          onPress={() => setSelectedPeriod("month")}
        >
          <Text style={[styles.periodTabText, selectedPeriod === "month" && styles.periodTabTextActive]}>
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: Colors.green50 }]}>
              <Ionicons name="trending-up" size={24} color={Colors.success} />
            </View>
            <Text style={styles.metricLabel}>Total Sales</Text>
            <Text style={styles.metricValue}>${totalSales.toFixed(2)}</Text>
            <Text style={styles.metricSubtext}>{transactions.length} transactions</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: Colors.blue50 }]}>
              <Ionicons name="wallet" size={24} color={Colors.info} />
            </View>
            <Text style={styles.metricLabel}>Avg. Sale</Text>
            <Text style={styles.metricValue}>${avgSale.toFixed(2)}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: Colors.purple50 }]}>
              <Ionicons name="pricetag" size={24} color={Colors.purple} />
            </View>
            <Text style={styles.metricLabel}>Tax</Text>
            <Text style={styles.metricValue}>${totalTax.toFixed(2)}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: Colors.red50 }]}>
              <Ionicons name="gift" size={24} color={Colors.error} />
            </View>
            <Text style={styles.metricLabel}>Discounts</Text>
            <Text style={styles.metricValue}>${totalDiscount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.transactionsCard}>
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateReport}>
            <Ionicons name="document-text" size={20} color={Colors.white} />
            <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>

          <Text style={styles.transactionsTitle}>Recent Transactions</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.gray300} />
              <Text style={styles.emptyText}>No transactions today</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionRow}
                  onPress={() => handleTransactionPress(transaction)}
                >
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionId}>{transaction.id}</Text>
                    <Text style={styles.transactionTime}>{new Date(transaction.createdAt).toLocaleTimeString()}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>${transaction.total.toFixed(2)}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ReceiptModal
        visible={receiptModalVisible}
        onClose={() => setReceiptModalVisible(false)}
        sale={selectedTransaction}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  topHeader: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
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
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  headerTop: {
    marginBottom: 4,
  },
  businessName: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  periodTabs: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    alignItems: "center",
  },
  periodTabActive: {
    backgroundColor: Colors.teal,
  },
  periodTabText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray600,
  },
  periodTabTextActive: {
    color: Colors.white,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
  transactionsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  transactionsTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginTop: 16,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.gray400,
    marginTop: 12,
  },
  transactionsList: {
    gap: 12,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionId: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  transactionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionAmount: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  noAccess: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  noAccessTitle: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginTop: 24,
    marginBottom: 8,
  },
  noAccessText: {
    fontSize: Typography.base,
    color: Colors.gray500,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.teal,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    width: "100%",
  },
  generateButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
})
