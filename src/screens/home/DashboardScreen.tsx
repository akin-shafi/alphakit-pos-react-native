
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { RolePermissions } from "../../constants/Roles"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { ReportService, type DailyReport } from "../../services/ReportService"
import { formatCurrency } from "../../utils/Formatter"

const { width } = Dimensions.get("window")
const GRID_GAP = 12
const CONTAINER_PADDING = 20
const COLUMN_WIDTH = (width - (CONTAINER_PADDING * 2) - GRID_GAP) / 2

interface ModuleItem {
  id: string
  name: string
  icon: any
  route: string
  params?: any
  permissionKey: keyof typeof RolePermissions.owner
  color: string
}

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user, logout } = useAuth()
  const [reportData, setReportData] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(false)
  
  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default
  const userRole = (user?.role || "cashier").toLowerCase()
  const permissions = RolePermissions[userRole as keyof typeof RolePermissions] || RolePermissions.cashier

  useEffect(() => {
    if (permissions.canViewReports) {
      fetchDailyData()
    }
  }, [business?.id])

  const fetchDailyData = async () => {
    setLoading(true)
    try {
      const data = await ReportService.getDailyReport()
      setReportData(data)
    } catch (e) {
      console.error("Failed to fetch dashboard metrics", e)
    } finally {
      setLoading(false)
    }
  }

  const modules: ModuleItem[] = [
    {
      id: "pos",
      name: "Point of Sale",
      icon: "cart",
      route: "MainTabs",
      params: { screen: "POSHome" },
      permissionKey: "canProcessSales",
      color: "#0D9488",
    },
    {
      id: "inventory",
      name: "Inventory",
      icon: "cube",
      route: "MainTabs",
      params: { screen: "Inventory" },
      permissionKey: "canManageInventory",
      color: "#7C3AED",
    },
    {
      id: "reports",
      name: "Sales Reports",
      icon: "bar-chart",
      route: "MainTabs",
      params: { screen: "Reports" },
      permissionKey: "canViewReports",
      color: "#2563EB",
    },
    {
      id: "staff",
      name: "Staff Management",
      icon: "people",
      route: "StaffManagement",
      permissionKey: "canManageUsers",
      color: "#EA580C",
    },
    {
      id: "shifts",
      name: "Shift Management",
      icon: "time",
      route: "ShiftManagement",
      permissionKey: "canManageShifts",
      color: "#F59E0B",
    },
    {
      id: "settings",
      name: "Settings",
      icon: "settings",
      route: "MainTabs",
      params: { screen: "Settings" },
      permissionKey: "canManageSettings",
      color: "#4B5563",
    },
    {
      id: "subscription",
      name: "Subscription",
      icon: "card",
      route: "SubscriptionPlans",
      permissionKey: "canManageSettings",
      color: "#DB2777",
    },
    
  ]

  const allowedModules = modules.filter(m => permissions && permissions[m.permissionKey])

  const handleModulePress = (module: any) => {
    if (module.params) {
      navigation.navigate(module.route, module.params)
    } else {
      navigation.navigate(module.route)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.businessName}>{business?.name || "Your Business"}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* User Profile Card */}
          <View style={[styles.userCard, { backgroundColor: theme.primary }]}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Text>
              </View>
              <View>
                <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
                <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} opacity={0.5} />
          </View>

          {/* Quick Actions or Summary could go here */}
          {permissions.canViewReports && (
            <View style={styles.quickInfoContainer}>
              <View style={styles.quickInfoCard}>
                <Ionicons name="today" size={24} color={Colors.teal} />
                <View style={styles.quickInfoText}>
                  <Text style={styles.quickInfoLabel}>Transactions Today</Text>
                  <Text style={styles.quickInfoValue}>
                    {loading ? <ActivityIndicator size="small" color={Colors.teal} /> : (reportData?.total_transactions || 0)}
                  </Text>
                </View>
              </View>
              <View style={styles.quickInfoCard}>
                <Ionicons name="trending-up" size={24} color={Colors.success} />
                <View style={styles.quickInfoText}>
                  <Text style={styles.quickInfoLabel}>Total Revenue</Text>
                  <Text style={styles.quickInfoValue}>
                    {loading ? <ActivityIndicator size="small" color={Colors.teal} /> : formatCurrency(reportData?.total_sales || 0, business?.currency)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Main Modules</Text>
          
          <View style={styles.grid}>
            {allowedModules.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => handleModulePress(module)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${module.color}15` }]}>
                  <Ionicons name={module.icon as any} size={32} color={module.color} />
                </View>
                <Text style={styles.moduleName}>{module.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 10,
  },
  greeting: {
    fontSize: Typography.base,
    color: Colors.gray500,
  },
  businessName: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.white,
    fontWeight: Typography.bold,
    fontSize: Typography.lg,
  },
  userName: {
    color: Colors.white,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  userRole: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  moduleCard: {
    width: COLUMN_WIDTH,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  moduleName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray800,
    textAlign: "center",
  },
  quickInfoContainer: {
    marginTop: 24,
    gap: 12,
  },
  quickInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
    gap: 16,
  },
  quickInfoText: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
  quickInfoValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
})
