"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import { useAuth } from "../../contexts/AuthContext"
import type { Sale } from "../../types"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const DetailedReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user } = useAuth()
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Mock transactions data - in production this would come from API/database
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
      paymentMethod: "cash",
      status: "completed",
      createdAt: new Date(Date.now() - 7200000),
      syncStatus: "synced",
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
      paymentMethod: i % 2 === 0 ? "cash" : "card",
      status: "completed",
      createdAt: new Date(Date.now() - i * 3600000),
      syncStatus: "synced",
    })),
  ]

  const totalPages = Math.ceil(mockTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return mockTransactions.slice(startIndex, endIndex)
  }, [currentPage])

  const totalSales = mockTransactions.reduce((sum, t) => sum + t.total, 0)
  const totalTax = mockTransactions.reduce((sum, t) => sum + t.tax, 0)
  const totalDiscount = mockTransactions.reduce((sum, t) => sum + t.discount, 0)

  const generatePDFContent = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #1f2937;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #0d5963;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #0d5963;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0;
          }
          .summary {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .summary-value {
            color: #0d5963;
            font-size: 24px;
            font-weight: bold;
          }
          .transactions {
            margin-top: 30px;
          }
          .transactions h2 {
            color: #1f2937;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: #0d5963;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${business?.name || "Demo Store"}</h1>
          <p>Sales Report</p>
          <p>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
        </div>

        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Sales</div>
              <div class="summary-value">$${totalSales.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Tax</div>
              <div class="summary-value">$${totalTax.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Transactions</div>
              <div class="summary-value">${mockTransactions.length}</div>
            </div>
          </div>
        </div>

        <div class="transactions">
          <h2>All Transaction Details (${mockTransactions.length} transactions)</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Date & Time</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${mockTransactions
                .map(
                  (txn, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${txn.id}</td>
                  <td>${new Date(txn.createdAt).toLocaleString()}</td>
                  <td>${txn.items.length} items</td>
                  <td style="text-transform: capitalize;">${txn.paymentMethod}</td>
                  <td><strong>$${txn.total.toFixed(2)}</strong></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated by ${user?.name || "User"} on ${new Date().toLocaleString()}</p>
          <p>Powered by POS Terminal</p>
        </div>
      </body>
      </html>
    `
  }

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true)
      const html = generatePDFContent()
      const { uri } = await Print.printToFileAsync({ html })

      Alert.alert("Success", `Report with all ${mockTransactions.length} transactions downloaded successfully`, [
        { text: "OK" },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF")
      console.error("[v0] PDF generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSharePDF = async () => {
    try {
      setIsGenerating(true)
      const html = generatePDFContent()
      const { uri } = await Print.printToFileAsync({ html })

      const canShare = await Sharing.isAvailableAsync()
      if (!canShare) {
        Alert.alert("Error", "Sharing is not available on this device")
        return
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Share Sales Report (${mockTransactions.length} transactions)`,
        UTI: "com.adobe.pdf",
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share PDF")
      console.error("[v0] Share error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detailed Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Date Range Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filter by Date Range</Text>
          <View style={styles.dateRange}>
            <TouchableOpacity style={styles.dateButton}>
              <Ionicons name="calendar-outline" size={20} color={Colors.teal} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <Text style={styles.dateValue}>{startDate.toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
            <Ionicons name="arrow-forward" size={20} color={Colors.gray400} />
            <TouchableOpacity style={styles.dateButton}>
              <Ionicons name="calendar-outline" size={20} color={Colors.teal} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{endDate.toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Sales</Text>
            <Text style={styles.summaryValue}>${totalSales.toFixed(2)}</Text>
            <Text style={styles.summarySubtext}>{mockTransactions.length} transactions</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Tax</Text>
            <Text style={styles.summaryValue}>${totalTax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Discounts</Text>
            <Text style={styles.summaryValue}>${totalDiscount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Transactions List with Pagination */}
        <View style={styles.transactionsCard}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>All Transactions ({mockTransactions.length} total)</Text>
            <Text style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </Text>
          </View>

          <View style={styles.transactionsList}>
            {paginatedTransactions.map((transaction, index) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionHeader}>
                    <Text style={styles.transactionNumber}>#{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Text>
                    <Text style={styles.transactionId}>{transaction.id}</Text>
                  </View>
                  <Text style={styles.transactionTime}>{new Date(transaction.createdAt).toLocaleString()}</Text>
                  <Text style={styles.transactionItems}>{transaction.items.length} items</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>${transaction.total.toFixed(2)}</Text>
                  <View style={[styles.paymentBadge, styles[`payment${transaction.paymentMethod}`]]}>
                    <Text style={styles.paymentText}>{transaction.paymentMethod}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              onPress={goToPrevPage}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? Colors.gray400 : Colors.teal} />
              <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, mockTransactions.length)} of {mockTransactions.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
              onPress={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <Text
                style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}
              >
                Next
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentPage === totalPages ? Colors.gray400 : Colors.teal}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <View style={styles.actionInfo}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.teal} />
            <Text style={styles.actionInfoText}>
              PDF will include all {mockTransactions.length} transactions, not just the current page
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleDownloadPDF}
            disabled={isGenerating}
          >
            <Ionicons name="download-outline" size={24} color={Colors.white} />
            <Text style={styles.actionButtonText}>{isGenerating ? "Generating..." : "Download PDF"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleSharePDF}
            disabled={isGenerating}
          >
            <Ionicons name="share-social-outline" size={24} color={Colors.white} />
            <Text style={styles.actionButtonText}>{isGenerating ? "Generating..." : "Share via WhatsApp"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  filterCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  filterTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 16,
  },
  dateRange: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  summaryLabel: {
    fontSize: Typography.xs,
    color: Colors.gray600,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.teal,
    marginBottom: 4,
  },
  summarySubtext: {
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
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  pageInfo: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transactionsList: {
    gap: 12,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  transactionNumber: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.white,
    backgroundColor: Colors.teal,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionId: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  transactionTime: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    marginBottom: 2,
  },
  transactionItems: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  transactionAmount: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paymentcash: {
    backgroundColor: Colors.green50,
  },
  paymentcard: {
    backgroundColor: Colors.blue50,
  },
  paymentText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    textTransform: "capitalize",
    color: Colors.gray700,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.teal50,
  },
  paginationButtonDisabled: {
    backgroundColor: Colors.gray50,
  },
  paginationButtonText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.teal,
  },
  paginationButtonTextDisabled: {
    color: Colors.gray400,
  },
  pageIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
  },
  pageIndicatorText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  actionsCard: {
    gap: 12,
    marginTop: 8,
  },
  actionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.teal50,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.teal200,
  },
  actionInfoText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.tealDark,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  downloadButton: {
    backgroundColor: Colors.teal,
  },
  shareButton: {
    backgroundColor: Colors.success,
  },
  actionButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
})
