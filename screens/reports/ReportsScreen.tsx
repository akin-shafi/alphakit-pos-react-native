"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { RolePermissions } from "../../constants/Roles"
import { Card } from "../../components/Card"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const ReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today")

  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default
  const canView = user ? RolePermissions[user.role].canViewReports : false

  // Mock data
  const salesData = {
    today: { sales: 45, revenue: 1250.75, items: 132 },
    week: { sales: 312, revenue: 8945.5, items: 876 },
    month: { sales: 1245, revenue: 35678.25, items: 3421 },
  }

  const data = salesData[selectedPeriod]

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
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === "today" && [styles.periodButtonActive, { backgroundColor: theme.primaryLight }],
          ]}
          onPress={() => setSelectedPeriod("today")}
        >
          <Text
            style={[
              styles.periodText,
              selectedPeriod === "today" && [styles.periodTextActive, { color: theme.primary }],
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === "week" && [styles.periodButtonActive, { backgroundColor: theme.primaryLight }],
          ]}
          onPress={() => setSelectedPeriod("week")}
        >
          <Text
            style={[
              styles.periodText,
              selectedPeriod === "week" && [styles.periodTextActive, { color: theme.primary }],
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === "month" && [styles.periodButtonActive, { backgroundColor: theme.primaryLight }],
          ]}
          onPress={() => setSelectedPeriod("month")}
        >
          <Text
            style={[
              styles.periodText,
              selectedPeriod === "month" && [styles.periodTextActive, { color: theme.primary }],
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="trending-up" size={32} color={theme.primary} />
            <Text style={styles.summaryTitle}>Sales Summary</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.primary }]}>${data.revenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.sales}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.items}</Text>
              <Text style={styles.statLabel}>Items Sold</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={24} color={Colors.gray700} />
            <Text style={styles.cardTitle}>Average Transaction</Text>
          </View>
          <Text style={styles.cardValue}>${(data.revenue / data.sales).toFixed(2)}</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cart-outline" size={24} color={Colors.gray700} />
            <Text style={styles.cardTitle}>Items Per Transaction</Text>
          </View>
          <Text style={styles.cardValue}>{(data.items / data.sales).toFixed(1)}</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color={Colors.gray700} />
            <Text style={styles.cardTitle}>Best Selling Hour</Text>
          </View>
          <Text style={styles.cardValue}>2:00 PM - 3:00 PM</Text>
          <Text style={styles.cardSubtext}>Peak sales time</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="star-outline" size={24} color={Colors.gray700} />
            <Text style={styles.cardTitle}>Top Product</Text>
          </View>
          <Text style={styles.cardValue}>Coca Cola 500ml</Text>
          <Text style={styles.cardSubtext}>45 units sold</Text>
        </Card>
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
  periodSelector: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: Colors.black,
  },
  periodText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.gray600,
  },
  periodTextActive: {
    color: Colors.white,
    fontWeight: Typography.semibold,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    padding: 24,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray200,
  },
  card: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  cardValue: {
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: Typography.sm,
    color: Colors.gray500,
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
})
