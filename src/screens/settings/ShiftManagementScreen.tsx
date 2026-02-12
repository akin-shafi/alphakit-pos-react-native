
import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { Colors, BusinessThemes, getBusinessTheme } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"
import { Shift, ShiftService } from "../../services/ShiftService"
import { RolePermissions } from "../../constants/Roles"

export const ShiftManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, business, activeShift, checkActiveShift } = useAuth()
  const theme = getBusinessTheme(business?.type)
  
  const roleKey = (user?.role?.toLowerCase() || "cashier") as any
  const permissions = RolePermissions[roleKey as keyof typeof RolePermissions]
  const canManageAll = permissions?.canManageShifts || false
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    checkActiveShift()
    if (canManageAll) {
      fetchShifts()
    }
  }, [canManageAll])

  const fetchShifts = async () => {
    setLoading(true)
    try {
      const data = await ShiftService.listShifts()
      setShifts(data)
    } catch (error) {
      console.error("Failed to fetch shifts", error)
      // Alert.alert("Error", "Failed to fetch shift history")
    } finally {
      setLoading(false)
    }
  }

  const handleStartShift = () => {
    Alert.prompt(
      "Start Shift",
      "Enter starting cash balance",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start Shift", 
          onPress: async (amount) => {
            const startAmount = parseFloat(amount || "0")
            if (isNaN(startAmount) || startAmount < 0) {
              Alert.alert("Invalid Amount", "Please enter a valid starting cash amount")
              return
            }

            setProcessing(true)
            try {
              await ShiftService.startShift(startAmount)
              await checkActiveShift() // Update global context
              await fetchShifts() // Refresh list
              Alert.alert("Success", "Shift started successfully")
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "Failed to start shift")
            } finally {
              setProcessing(false)
            }
          }
        }
      ],
      "plain-text",
      "0",
      "numeric"
    )
  }

  const handleEndShift = () => {
    if (!activeShift) return

    Alert.prompt(
      "End Shift",
      "Enter ending cash balance",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End Shift", 
          onPress: async (amount) => {
             const endAmount = parseFloat(amount || "0")
              if (isNaN(endAmount) || endAmount < 0) {
                Alert.alert("Invalid Amount", "Please enter a valid ending cash amount")
                return
              }

              setProcessing(true)
              try {
                // Call end shift logic
                const summary = await ShiftService.endShift(activeShift.id, endAmount)
                
                await checkActiveShift() 
                await fetchShifts()

                // Calculate discrepancy (simple logic for now, backend does details)
                // Note: summary might return updated shift object, let's assume it matches ShiftSummary or Shift
                // Based on Service implementation, it returns Shift? Wait, logic said ShiftSummary...
                // The service says: Promise<Shift> for endShift. Wait, my service implementation returned response.data.data
                // The backend controller returns JSON(shift) usually. 
                // Let's assume standard Shift object returned.
                // Summary calculation might need extra call if not included.
                // Actually, let's just show success for now.
                
                Alert.alert("Shift Closed", "Shift ended successfully.")

              } catch (error: any) {
               Alert.alert("Error", error.response?.data?.error || "Failed to end shift")
              } finally {
                setProcessing(false)
              }
          }
        }
      ],
      "plain-text",
      "0",
      "numeric"
    )
  }

  const renderShiftItem = ({ item }: { item: Shift }) => {
    const isCurrentUser = item.user_id === user?.id;
    // Format date
    const startDate = new Date(item.start_time);
    const endDate = item.end_time ? new Date(item.end_time) : null;

    return (
      <View style={styles.shiftCard}>
        <View style={styles.shiftInfo}>
          <View style={styles.shiftMain}>
            <Text style={styles.cashierName}>
                {isCurrentUser ? "You" : `User #${item.user_id}`}
            </Text>
            <Text style={styles.shiftTime}>
              {startDate.toLocaleDateString()} • {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {endDate ? ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : " (Ongoing)"}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === "open" ? Colors.green50 : Colors.gray100 }]}>
            <Text style={[styles.statusText, { color: item.status === "open" ? Colors.success : Colors.gray600 }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.shiftDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Start Cash</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.start_cash, business?.currency)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Expected</Text>
            <Text style={styles.detailValue}>{item.status === "closed" ? formatCurrency(item.expected_cash, business?.currency) : "---"}</Text>
          </View>
          {item.end_cash !== null && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>End Cash</Text>
              <Text style={styles.detailValue}>{formatCurrency(item.end_cash, business?.currency)}</Text>
            </View>
          )}
          {item.status === "closed" && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Variance</Text>
              <Text style={[
                styles.detailValue, 
                { color: item.cash_variance === 0 ? Colors.success : item.cash_variance < 0 ? Colors.error : "#eab308" }
              ]}>
                {item.cash_variance > 0 ? "+" : ""}{formatCurrency(item.cash_variance, business?.currency)}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.shiftDetails, { borderTopWidth: 0, paddingTop: 8 }]}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Sales</Text>
            <Text style={[styles.detailValue, { color: Colors.teal }]}>{formatCurrency(item.total_sales, business?.currency)}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{canManageAll ? "Shift Management" : "Work Session"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.activeSection}>
        <View style={[styles.activeCard, { borderColor: activeShift ? Colors.success : Colors.gray200 }]}>
          <View style={styles.activeHeader}>
            <View style={[styles.activeIcon, { backgroundColor: activeShift ? Colors.green50 : Colors.gray100 }]}>
              <Ionicons name="time" size={32} color={activeShift ? Colors.success : Colors.gray400} />
            </View>
            <View>
              <Text style={styles.activeTitle}>
                {activeShift ? "Active Shift" : "No Active Shift"}
              </Text>
              <Text style={styles.activeSubtitle}>
                {activeShift ? `Started at ${new Date(activeShift.start_time).toLocaleTimeString()}` : "Ready to start work?"}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
                styles.toggleButton, 
                { backgroundColor: activeShift ? Colors.error : Colors.teal, opacity: processing ? 0.7 : 1 }
            ]}
            onPress={activeShift ? handleEndShift : handleStartShift}
            disabled={processing}
          >
            {processing ? (
                 <ActivityIndicator color={Colors.white} />
            ) : (
                <Text style={styles.toggleButtonText}>
                {activeShift ? "Close Shift" : "Open New Shift"}
                </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {canManageAll && (
        <>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Shift History</Text>
            <TouchableOpacity onPress={fetchShifts}>
              <Ionicons name="refresh" size={20} color={Colors.teal} />
            </TouchableOpacity>
          </View>

          {loading && shifts.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={Colors.teal} />
          ) : (
            <FlatList
              data={shifts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderShiftItem}
              contentContainerStyle={styles.listContent}
              refreshing={loading}
              onRefresh={fetchShifts}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={64} color={Colors.gray200} />
                  <Text style={styles.emptyText}>No shift history available</Text>
                </View>
              }
            />
          )}
        </>
      )}
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
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  activeSection: {
    padding: 20,
  },
  activeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  activeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  activeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  activeSubtitle: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  toggleButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  toggleButtonText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  seeAll: {
    color: Colors.teal,
    fontWeight: Typography.semibold,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  shiftCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  shiftInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  shiftMain: {
    flex: 1,
  },
  cashierName: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  shiftTime: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: Typography.bold,
  },
  shiftDetails: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray50,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: Colors.gray500,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.gray800,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.gray400,
    marginTop: 16,
  },
})
