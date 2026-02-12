
import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import apiClient from "../../services/ApiClient"
import { formatCurrency } from "../../utils/Formatter"

export const AuditLogScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useAuth()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get("/activities")
      setActivities(res.data)
    } catch (e) {
      console.error("Failed to fetch activities", e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const renderActivityItem = ({ item }: { item: any }) => {
    const details = typeof item.details === 'string' ? JSON.parse(item.details || '{}') : (item.details || {})
    const timestamp = new Date(item.created_at)
    
    let icon = "information-circle"
    let iconColor = Colors.info
    let bgColor = Colors.blue50

    if (item.action_type === 'completed') {
      icon = "checkmark-circle"
      iconColor = Colors.success
      bgColor = Colors.green50
    } else if (item.action_type === 'voided') {
      icon = "alert-circle"
      iconColor = Colors.error
      bgColor = "#fee2e2"
    }

    return (
      <View style={styles.activityCard}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={icon as any} size={24} color={iconColor} />
        </View>
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.actionType}>{item.action_type.toUpperCase()}</Text>
            <Text style={styles.timestamp}>{timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <Text style={styles.staffName}>Staff: {item.user_name}</Text>
          <Text style={styles.detailsText}>
            {item.action_type === 'completed' && `Sale #${item.sale_id} - ${formatCurrency(details.amount_paid, business?.currency)} (${details.payment_method})`}
            {item.action_type === 'voided' && `Voided Sale #${item.sale_id}. Reason: ${details.reason}`}
            {item.action_type !== 'completed' && item.action_type !== 'voided' && `Sale #${item.sale_id}`}
          </Text>
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
        <Text style={styles.headerTitle}>System Audit Log</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.teal} />
          <Text style={styles.loadingText}>Fetching audit logs...</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivityItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchActivities(); }} colors={[Colors.teal]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="lock-open-outline" size={64} color={Colors.gray200} />
              <Text style={styles.emptyText}>No activity logs found</Text>
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  actionType: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.gray500,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.gray400,
  },
  staffName: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.gray500,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.gray400,
    marginTop: 16,
  },
})
