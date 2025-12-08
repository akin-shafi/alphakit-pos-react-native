"use client"

import { useState, useMemo, useRef } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, SafeAreaView } from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import { Colors } from "../../constants/Colors"
import { useAuth } from "../../contexts/AuthContext"
import type { Sale } from "../../types"
import PagerView from "react-native-pager-view"
import { SummaryCard } from "@/components/reports/SummaryCard"
import { DateRangeModal } from "@/components/reports/DateRangeModal"

const { width, height } = Dimensions.get("window")

export default function DetailedReportScreen() {
  const navigation = useNavigation()
  const { business } = useAuth()
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const pagerRef = useRef<PagerView>(null)
  const ITEMS_PER_PAGE = 10

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
      paymentMethod: "cash" as const,
      status: "completed" as const,
      createdAt: new Date(),
      syncStatus: "synced" as const,
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
      paymentMethod: "card" as const,
      status: "completed" as const,
      createdAt: new Date(Date.now() - 3600000),
      syncStatus: "synced" as const,
    },
    {
      id: "TXN003",
      businessId: "1",
      branchId: "1",
      userId: "1",
      items: [
        {
          product: { id: "4", name: "Cookies Chocolate", price: 4.5, category: "Snacks" } as any,
          quantity: 3,
          discount: 0,
        },
      ],
      subtotal: 13.5,
      tax: 1.35,
      discount: 0,
      total: 14.85,
      paymentMethod: "cash" as const,
      status: "completed" as const,
      createdAt: new Date(Date.now() - 7200000),
      syncStatus: "synced" as const,
    },
    ...Array.from({ length: 27 }, (_, i) => ({
      id: `TXN${String(i + 4).padStart(3, "0")}`,
      businessId: "1",
      branchId: "1",
      userId: "1",
      items: [
        {
          product: { id: String(i), name: `Product ${i}`, price: 5.0, category: "General" } as any,
          quantity: 1,
          discount: 0,
        },
      ],
      subtotal: 5.0,
      tax: 0.5,
      discount: 0,
      total: 5.5,
      paymentMethod: (i % 2 === 0 ? "cash" : "card") as "cash" | "card",
      status: "completed" as const,
      createdAt: new Date(Date.now() - i * 3600000),
      syncStatus: "synced" as const,
    })),
  ]

  const summary = useMemo(() => {
    const totalSales = mockTransactions.reduce((sum, txn) => sum + txn.total, 0)
    const totalTax = mockTransactions.reduce((sum, txn) => sum + txn.tax, 0)
    const totalDiscount = mockTransactions.reduce((sum, txn) => sum + txn.discount, 0)
    const transactionCount = mockTransactions.length

    return {
      totalSales,
      totalTax,
      totalDiscount,
      transactionCount,
      averageSale: transactionCount > 0 ? totalSales / transactionCount : 0,
    }
  }, [])

  const paginatedData = useMemo(() => {
    const pages = []
    for (let i = 0; i < mockTransactions.length; i += ITEMS_PER_PAGE) {
      pages.push(mockTransactions.slice(i, i + ITEMS_PER_PAGE))
    }
    return pages
  }, [])

  const totalPages = paginatedData.length

  const generatePDFReport = async () => {
    setIsGenerating(true)
    try {
      const transactionsHTML = mockTransactions
        .map(
          (txn, index) => `
        <tr style="border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 12px;">${index + 1}</td>
          <td style="padding: 12px;">${txn.id}</td>
          <td style="padding: 12px;">${new Date(txn.createdAt).toLocaleString()}</td>
          <td style="padding: 12px; text-transform: capitalize;">${txn.paymentMethod}</td>
          <td style="padding: 12px; text-align: right; font-weight: bold;">$${txn.total.toFixed(2)}</td>
        </tr>
      `,
        )
        .join("")

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #0D5963; margin-bottom: 10px; }
              .header { margin-bottom: 30px; border-bottom: 2px solid #0D5963; padding-bottom: 20px; }
              .info { color: #6B7280; margin: 5px 0; }
              .summary { display: flex; justify-content: space-between; margin: 20px 0; }
              .summary-card { background: #F9FAFB; padding: 15px; border-radius: 8px; flex: 1; margin: 0 10px; text-align: center; }
              .summary-label { color: #6B7280; font-size: 14px; }
              .summary-value { color: #0A0A0A; font-size: 24px; font-weight: bold; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background: #0D5963; color: white; padding: 12px; text-align: left; }
              td { padding: 12px; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center; color: #6B7280; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${business?.name || "POS Terminal"}</h1>
              <p class="info">Sales Report</p>
              <p class="info">Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
              <p class="info">Generated: ${new Date().toLocaleString()}</p>
            </div>

            <div class="summary">
              <div class="summary-card">
                <div class="summary-label">Total Sales</div>
                <div class="summary-value">$${summary.totalSales.toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Transactions</div>
                <div class="summary-value">${summary.transactionCount}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Avg. Sale</div>
                <div class="summary-value">$${summary.averageSale.toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Tax Collected</div>
                <div class="summary-value">$${summary.totalTax.toFixed(2)}</div>
              </div>
            </div>

            <h2 style="color: #0D5963; margin-top: 30px;">All Transactions (${mockTransactions.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Payment Method</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${transactionsHTML}
              </tbody>
            </table>

            <div class="footer">
              <p>${business?.name || "POS Terminal"} - Detailed Sales Report</p>
              <p>This report contains all ${mockTransactions.length} transactions for the selected period</p>
            </div>
          </body>
        </html>
      `

      const { uri } = await Print.printToFileAsync({ html })
      return uri
    } catch (error) {
      console.error("PDF generation error:", error)
      Alert.alert("Error", "Failed to generate PDF report")
    } finally {
      setIsGenerating(false)
    }
  }

  const shareReport = async () => {
    const uri = await generatePDFReport()
    if (uri) {
      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Share Sales Report",
          UTI: "com.adobe.pdf",
        })
      } else {
        Alert.alert("Error", "Sharing is not available on this device")
      }
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      pagerRef.current?.setPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Detailed Report</Text>
            <Text style={styles.subtitle}>{business?.name || "Demo Store"}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Range Filter */}
          <TouchableOpacity style={styles.dateRangeButton} onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" size={20} color={Colors.teal} />
            <View style={styles.dateRangeText}>
              <Text style={styles.dateRangeLabel}>Date Range</Text>
              <Text style={styles.dateRangeValue}>
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </Text>
            </View>
            <Feather name="chevron-down" size={20} color={Colors.gray600} />
          </TouchableOpacity>

          <View style={styles.summaryGrid}>
            <SummaryCard
              icon="trending-up"
              iconColor={Colors.success}
              iconBgColor={Colors.green50}
              label="Total Sales"
              value={`$${summary.totalSales.toFixed(2)}`}
              subtext={`${summary.transactionCount} transactions`}
            />
            <SummaryCard
              icon="shopping-bag"
              iconColor={Colors.info}
              iconBgColor={Colors.blue50}
              label="Avg. Sale"
              value={`$${summary.averageSale.toFixed(2)}`}
              subtext="per transaction"
            />
            <SummaryCard
              icon="percent"
              iconColor={Colors.purple}
              iconBgColor={Colors.purple50}
              label="Tax"
              value={`$${summary.totalTax.toFixed(2)}`}
              subtext="collected"
            />
            <SummaryCard
              icon="tag"
              iconColor={Colors.error}
              iconBgColor={Colors.red50}
              label="Discounts"
              value={`$${summary.totalDiscount.toFixed(2)}`}
              subtext="given"
            />
          </View>

          {/* Summary Cards */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.infoText}>
              All {mockTransactions.length} transactions will be included in the generated PDF report
            </Text>
          </View>

          {/* Transactions Section with PagerView */}
          <View style={styles.transactionsSection}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.sectionTitle}>Transactions</Text>
              <Text style={styles.pageIndicator}>
                Page {currentPage + 1} of {totalPages}
              </Text>
            </View>

            <Text style={styles.swipeHint}>← Swipe to navigate between pages →</Text>

            <PagerView
              ref={pagerRef}
              style={styles.pagerView}
              initialPage={0}
              onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
              {paginatedData.map((pageTransactions, pageIndex) => (
                <View key={`page-${pageIndex}`} style={styles.pageContainer}>
                  <ScrollView style={styles.transactionsCard} showsVerticalScrollIndicator={false}>
                    {pageTransactions.map((transaction) => (
                      <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                          <Text style={styles.transactionId}>{transaction.id}</Text>
                          <Text style={styles.transactionDate}>{new Date(transaction.createdAt).toLocaleString()}</Text>
                          <Text style={styles.transactionMethod}>{transaction.paymentMethod.toUpperCase()}</Text>
                        </View>
                        <View style={styles.transactionRight}>
                          <Text style={styles.transactionAmount}>${transaction.total.toFixed(2)}</Text>
                          <Text style={styles.transactionItems}>{transaction.items.length} items</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </PagerView>

            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              {paginatedData.map((_, index) => (
                <View key={index} style={[styles.dot, index === currentPage ? styles.activeDot : styles.inactiveDot]} />
              ))}
            </View>

            {/* Pagination Controls */}
            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
                onPress={goToPreviousPage}
                disabled={currentPage === 0}
              >
                <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? Colors.gray400 : Colors.teal} />
                <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pageButton, currentPage === totalPages - 1 && styles.pageButtonDisabled]}
                onPress={goToNextPage}
                disabled={currentPage === totalPages - 1}
              >
                <Text style={[styles.pageButtonText, currentPage === totalPages - 1 && styles.pageButtonTextDisabled]}>
                  Next
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={currentPage === totalPages - 1 ? Colors.gray400 : Colors.teal}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={generatePDFReport}
              disabled={isGenerating}
            >
              <Ionicons name="download-outline" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>{isGenerating ? "Generating..." : "Download PDF"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={shareReport}
              disabled={isGenerating}
            >
              <Ionicons name="share-social-outline" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Share via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <DateRangeModal
          visible={showDatePicker}
          startDate={startDate}
          endDate={endDate}
          onClose={() => setShowDatePicker(false)}
          onStartDateSelect={setStartDate}
          onEndDateSelect={setEndDate}
          onQuickFilter={(filter) => {
            const today = new Date()
            if (filter === "today") {
              setStartDate(today)
              setEndDate(today)
            } else if (filter === "week") {
              const weekStart = new Date(today)
              weekStart.setDate(today.getDate() - today.getDay())
              setStartDate(weekStart)
              setEndDate(today)
            } else if (filter === "month") {
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
              setStartDate(monthStart)
              setEndDate(today)
            }
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },

   sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 12,
  },
  dateRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: 8,
    marginBottom: 16,
  },
  dateRangeText: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 8,
  },
  dateRangeLabel: {
    fontSize: 12,
    color: Colors.gray600,
    marginBottom: 2,
  },
  dateRangeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray900,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue50,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.info,
  },
  transactionsSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pageIndicator: {
    fontSize: 14,
    color: Colors.gray600,
    fontWeight: "500",
  },
  swipeHint: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: "center",
    marginBottom: 12,
  },
  pagerView: {
    height: 500,
    marginBottom: 16,
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  transactionsCard: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.gray600,
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: 11,
    color: Colors.teal,
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray900,
    marginBottom: 4,
  },
  transactionItems: {
    fontSize: 12,
    color: Colors.gray600,
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: Colors.teal,
    width: 24,
  },
  inactiveDot: {
    backgroundColor: Colors.gray300,
  },
  paginationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  pageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    gap: 4,
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.teal,
  },
  pageButtonTextDisabled: {
    color: Colors.gray400,
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: Colors.teal,
  },
  shareButton: {
    backgroundColor: Colors.success,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
})
