
import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"

interface Shift {
  id: string
  userId: number
  userName: string
  startTime: string
  endTime: string | null
  startCash: number
  endCash: number | null
  status: "active" | "closed"
}

export const ShiftManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, business } = useAuth()
  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default
  
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)
  const [activeShift, setActiveShift] = useState<Shift | null>(null)

  useEffect(() => {
    // Simulate fetching shifts
    fetchShifts()
  }, [])

  const fetchShifts = () => {
    setLoading(true)
    // Mock data
    setTimeout(() => {
      const mockShifts: Shift[] = [
        {
          id: "1",
          userId: user!.id,
          userName: `${user!.first_name} ${user!.last_name}`,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: null,
          startCash: 5000,
          endCash: null,
          status: "active"
        }
      ]
      setShifts(mockShifts)
      setActiveShift(mockShifts.find(s => s.status === "active") || null)
      setLoading(false)
    }, 1000)
  }

  const handleToggleShift = () => {
    if (activeShift) {
      Alert.alert("End Shift", "Are you sure you want to close your current shift?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End Shift", 
          onPress: () => {
            // Logic to end shift
            setActiveShift(null)
            Alert.alert("Success", "Shift closed successfully")
          }
        }
      ])
    } else {
      Alert.prompt(
        "Start Shift",
        "Enter starting cash balance",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Start Shift", 
            onPress: (amount) => {
              const startAmount = parseFloat(amount || "0")
              const newShift: Shift = {
                id: Date.now().toString(),
                userId: user!.id,
                userName: `${user!.first_name} ${user!.last_name}`,
                startTime: new Date().toISOString(),
                endTime: null,
                startCash: startAmount,
                endCash: null,
                status: "active"
              }
              setActiveShift(newShift)
              setShifts([newShift, ...shifts])
            }
          }
        ],
        "plain-text",
        "0"
      )
    }
  }

  const renderShiftItem = ({ item }: { item: Shift }) => (
    <View style={styles.shiftCard}>
      <View style={styles.shiftInfo}>
        <View style={styles.shiftMain}>
          <Text style={styles.cashierName}>{item.userName}</Text>
          <Text style={styles.shiftTime}>
            {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {item.endTime ? ` - ${new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : " (Ongoing)"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === "active" ? Colors.green50 : Colors.gray100 }]}>
          <Text style={[styles.statusText, { color: item.status === "active" ? Colors.success : Colors.gray600 }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.shiftDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Start Cash</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.startCash, business?.currency)}</Text>
        </View>
        {item.endCash !== null && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>End Cash</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.endCash, business?.currency)}</Text>
          </View>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shift Management</Text>
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
                {activeShift ? `Started at ${new Date(activeShift.startTime).toLocaleTimeString()}` : "Ready to start work?"}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.toggleButton, { backgroundColor: activeShift ? Colors.error : Colors.teal }]}
            onPress={handleToggleShift}
          >
            <Text style={styles.toggleButtonText}>
              {activeShift ? "Close Shift" : "Open New Shift"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Shift History</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.teal} />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item) => item.id}
          renderItem={renderShiftItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Colors.gray200} />
              <Text style={styles.emptyText}>No shift history available</Text>
            </View>
          }
        />
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
