

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { RolePermissions } from "../../constants/Roles"
import type { Sale } from "../../types"
import { ReceiptModal } from "../../components/ReceiptModal"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { ReportService, type DailyReport, type SalesReport } from "../../services/ReportService"
import { formatCurrency } from "../../utils/Formatter"

export const ReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today")
  const [selectedTransaction, setSelectedTransaction] = useState<Sale | null>(null)
  const [receiptModalVisible, setReceiptModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "cash" | "card" | "transfer">("all")
  
  const [reportData, setReportData] = useState<DailyReport | SalesReport | null>(null)
  const [transactions, setTransactions] = useState<Sale[]>([])

  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default
  
  const roleKey = (user?.role?.toLowerCase() || "") as any
  const permissions = RolePermissions[roleKey as keyof typeof RolePermissions]
  const canView = permissions?.canViewReports || false
  const isCashier = user?.role?.toLowerCase() === "cashier"

  useEffect(() => {
    if (isCashier) {
      setSelectedPeriod("today")
    }
  }, [isCashier])

  useEffect(() => {
    if (canView) {
      fetchData()
    }
  }, [selectedPeriod, isCashier])

  const fetchData = async () => {
    setLoading(true)
    try {
      let startDateStr = ""
      let endDateStr = ""

      if (selectedPeriod === "today") {
        startDateStr = new Date().toISOString().split("T")[0]
        endDateStr = startDateStr
        // Update metrics
        const data = await ReportService.getDailyReport()
        setReportData(data)
      } else {
        const now = new Date()
        let start = new Date()
        if (selectedPeriod === "week") {
          start.setDate(now.getDate() - 7)
        } else {
          start.setMonth(now.getMonth() - 1)
        }
        startDateStr = start.toISOString().split("T")[0]
        endDateStr = now.toISOString().split("T")[0]
        
        const data = await ReportService.getSalesReport(startDateStr, endDateStr)
        setReportData(data)
      }

      // Fetch transactions for the list
      const sales = await ReportService.getSales({
        from: startDateStr,
        to: endDateStr
      })
      setTransactions(sales)

    } catch (e) {
      console.error("Failed to fetch report data", e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleTransactionPress = (transaction: Sale) => {
    setSelectedTransaction(transaction)
    setReceiptModalVisible(true)
  }

  const handleGenerateReport = () => {
    navigation.navigate("DetailedReport")
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = selectedFilter === "all" || t.paymentMethod?.toLowerCase() === selectedFilter
    const matchesUser = !isCashier || t.userId === user?.id?.toString()
    return matchesFilter && matchesUser
  })

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.headerTop}>
            <Text style={styles.businessName}>{business?.name || "Demo Store"}</Text>
          </View>
          <TouchableOpacity 
            style={{ padding: 8, backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray200 }} 
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Ionicons name="apps" size={24} color={Colors.teal} />
          </TouchableOpacity>
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
        
        {!isCashier && (
          <>
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
          </>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.teal]} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.teal} />
            <Text style={styles.loadingText}>Loading report data...</Text>
          </View>
        ) : (
          <>
            {!isCashier && (
              <View style={styles.metricsGrid}>
                <TouchableOpacity 
                  style={[styles.metricCard, selectedFilter === "all" && { borderColor: theme.primary, borderWidth: 2 }]}
                  onPress={() => setSelectedFilter("all")}
                >
                  <View style={[styles.metricIcon, { backgroundColor: Colors.green50 }]}>
                    <Ionicons name="trending-up" size={24} color={Colors.success} />
                  </View>
                  <Text style={styles.metricLabel}>Total Sales</Text>
                  <Text style={styles.metricValue}>{formatCurrency(reportData?.total_sales || 0, business?.currency)}</Text>
                  <Text style={styles.metricSubtext}>{(reportData?.total_transactions || 0)} transactions</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.metricCard, selectedFilter === "all" && { borderColor: theme.primary, borderWidth: 2, opacity: 0.7 }]}
                   // Just average, clicking it resets to all? Or maybe does nothing. Let's make it reset to all.
                  onPress={() => setSelectedFilter("all")}
                >
                  <View style={[styles.metricIcon, { backgroundColor: Colors.blue50 }]}>
                    <Ionicons name="wallet" size={24} color={Colors.info} />
                  </View>
                  <Text style={styles.metricLabel}>Avg. Sale</Text>
                  <Text style={styles.metricValue}>{formatCurrency(reportData?.average_sale || 0, business?.currency)}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.metricCard, selectedFilter === "cash" && { borderColor: theme.primary, borderWidth: 2 }]}
                  onPress={() => setSelectedFilter("cash")}
                >
                  <View style={[styles.metricIcon, { backgroundColor: Colors.purple50 }]}>
                    <Ionicons name="cash" size={24} color={Colors.purple} />
                  </View>
                  <Text style={styles.metricLabel}>Cash Sales</Text>
                  <Text style={styles.metricValue}>{formatCurrency(reportData?.cash_sales || 0, business?.currency)}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.metricCard, selectedFilter === "card" && { borderColor: theme.primary, borderWidth: 2 }]}
                  onPress={() => setSelectedFilter("card")}
                >
                  <View style={[styles.metricIcon, { backgroundColor: Colors.orange50 }]}>
                    <Ionicons name="card" size={24} color={Colors.orange} />
                  </View>
                  <Text style={styles.metricLabel}>Card Sales</Text>
                  <Text style={styles.metricValue}>{formatCurrency(reportData?.card_sales || 0, business?.currency)}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.transactionsCard}>
              {!isCashier && (
                <TouchableOpacity style={styles.generateButton} onPress={handleGenerateReport}>
                  <Ionicons name="document-text" size={20} color={Colors.white} />
                  <Text style={styles.generateButtonText}>Generate Detailed PDF</Text>
                </TouchableOpacity>
              )}

              {!isCashier && (
                <>
                  <Text style={styles.transactionsTitle}>Summary</Text>
                  
                  <View style={styles.summaryTable}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Transfer Sales</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(reportData?.transfer_sales || 0, business?.currency)}</Text>
                    </View>
                    {"mobile_money_sales" in (reportData || {}) && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Mobile Money</Text>
                        <Text style={styles.summaryValue}>{formatCurrency((reportData as SalesReport)?.mobile_money_sales || 0, business?.currency)}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
              
              <Text style={[styles.transactionsTitle, { marginTop: 24 }]}>Recent Transactions ({filteredTransactions.length})</Text>

              <View style={styles.transactionsList}>
                {filteredTransactions.length === 0 ? (
                  <View style={styles.emptyState}>
                     <Text style={styles.emptyText}>No transactions found for this period.</Text>
                  </View>
                ) : (
                  filteredTransactions.map((sale) => (
                    <TouchableOpacity 
                      key={sale.id} 
                      style={styles.transactionRow} 
                      onPress={() => handleTransactionPress(sale)}
                    >
                      <View style={styles.transactionLeft}>
                         <Text style={styles.transactionId}>#{sale.id.toString().slice(-6)}</Text>
                         <Text style={styles.transactionTime}>{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.paymentMethod.toUpperCase()}</Text>
                      </View>
                      <View style={styles.transactionRight}>
                         <Text style={styles.transactionAmount}>{formatCurrency(sale.total, business?.currency)}</Text>
                         <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </>
        )}
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.gray500,
    fontSize: Typography.sm,
  },
  summaryTable: {
    marginTop: 8,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
  },
  summaryLabel: {
    fontSize: Typography.base,
    color: Colors.gray600,
  },
  summaryValue: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
})
