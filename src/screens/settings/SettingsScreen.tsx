import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useSettings } from "../../contexts/SettingsContext"

import { RolePermissions, UserRole } from "../../constants/Roles"
import { Colors, BusinessThemes, getBusinessTheme } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { AuthService } from "../../services/AuthService"

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user, logout, setBusiness } = useAuth()
  const { enableTables, enableDrafts, toggleTables, toggleDrafts, taxRate } = useSettings()
  const [loading, setLoading] = useState(false)



  const theme = getBusinessTheme(business?.type)
  const role =
  user?.role?.toLowerCase() as UserRole | undefined;

  const permissions = role ? RolePermissions[role] : null;
  const isManager = role === UserRole.OWNER || role === UserRole.ADMIN || role === UserRole.MANAGER
  const isCashier = role === UserRole.CASHIER

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ])
  }

  const handleChangeCurrency = () => {
    const currencies = [
      { label: "Nigerian Naira (₦)", value: "NGN" },
      { label: "US Dollar ($)", value: "USD" },
      { label: "British Pound (£)", value: "GBP" },
      { label: "Euro (€)", value: "EUR" },
    ]

    Alert.alert(
      "Change Currency",
      "Select your business currency",
      [
        ...currencies.map((c) => ({
          text: c.label,
          onPress: async () => {
            if (!business?.id) return
            setLoading(true)
            try {
              const updated = await AuthService.updateBusiness(business.id, { currency: c.value })
              setBusiness(updated)
              Alert.alert("Success", `Currency updated to ${c.value}`)
            } catch (error) {
              Alert.alert("Error", "Failed to update currency. Please try again.")
            } finally {
              setLoading(false)
            }
          },
        })),
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    )
  }

  const getUserInitials = () => {
    if (!user?.first_name) return "U"
    const names = user.first_name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.first_name[0].toUpperCase()
  }



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.businessName}>{business?.name || "Fiber"}</Text>
            <Text style={styles.businessInfo}>
              {business?.type ? (business.type.charAt(0).toUpperCase() + business.type.slice(1)) : "Business"} 
              {/* • Business Id:{" "} {business?.id || "2"} */}
            </Text>
          </View>
          <TouchableOpacity 
            style={{ padding: 8, backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray200 }} 
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Ionicons name="apps" size={24} color={Colors.teal} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate("Profile")}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.first_name + ' ' + user?.last_name || "John"}</Text>
            <Text style={styles.profileUsername}>{user?.email || "DOE"}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role || "Admin"}</Text>
            </View>
          </View>
        </TouchableOpacity>

        { (permissions?.canManageSettings || permissions?.canManageBusiness) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BUSINESS INFORMATION</Text>
            <View style={styles.card}>
              <View style={styles.infoItem}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="business" size={20} color={theme.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{business?.name || "Standford"}</Text>
                  <Text style={styles.infoSubtitle}>
                    {business?.type ? (business.type.charAt(0).toUpperCase() + business.type.slice(1)) : "Business"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="location" size={20} color={theme.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Branch</Text>
                  <Text style={styles.infoSubtitle}>Main location</Text>
                </View>
              </View>

              {isManager && (
                <>
                  <MenuButton
                    icon="cash"
                    label="Default Currency"
                    subtitle={`Current: ${business?.currency || "NGN"}`}
                    onPress={handleChangeCurrency}
                    iconColor={theme.primary}
                    iconBg={theme.primaryLight}
                    rightText={business?.currency}
                  />
                  <MenuButton
                    icon="card"
                    label="Subscription"
                    subtitle="Manage plans & billing"
                    onPress={() => navigation.navigate("SubscriptionPlans")}
                    iconColor={theme.primary}
                    iconBg={theme.primaryLight}
                  />
                </>
              )}
            </View>
          </View>
        )}

        { permissions?.canManageSettings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>POS CONFIGURATION</Text>
            <View style={styles.card}>
              {isManager && (
                <>
                  <View style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                          <Ionicons name="layers" size={20} color={theme.primary} />
                        </View>
                        <View style={styles.menuContent}>
                          <Text style={styles.menuLabel}>Draft & Held Orders</Text>
                          <Text style={styles.menuSubtitle}>Allow saving orders for later</Text>
                        </View>
                    </View>
                    <Switch
                        value={enableDrafts}
                        onValueChange={toggleDrafts}
                        trackColor={{ false: Colors.gray200, true: theme.primary }}
                        thumbColor={Colors.white}
                    />
                  </View>

                  <View style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                          <Ionicons name="restaurant" size={20} color={theme.primary} />
                        </View>
                        <View style={styles.menuContent}>
                          <Text style={styles.menuLabel}>Table Management</Text>
                          <Text style={styles.menuSubtitle}>Assign orders to tables</Text>
                        </View>
                    </View>
                    <Switch
                        value={enableTables}
                        onValueChange={toggleTables}
                        trackColor={{ false: Colors.gray200, true: theme.primary }}
                        thumbColor={Colors.white}
                    />
                  </View>

                  {enableTables && (
                    <MenuButton
                      icon="grid"
                      label="Manage Tables"
                      subtitle="Configure floor plan & tables"
                      onPress={() => navigation.navigate("TableManagement")}
                      iconColor={theme.primary}
                      iconBg={theme.primaryLight}
                    />
                  )}
                </>
              )}

              <MenuButton
                icon="print"
                label="Printer Setup"
                subtitle="Configure thermal printer"
                onPress={() => navigation.navigate("PrinterSettings")}
                iconColor={theme.primary}
                iconBg={theme.primaryLight}
              />
              <MenuButton
                icon="receipt"
                label="Receipt Template"
                subtitle="Customize receipt layout"
                onPress={() => navigation.navigate("ReceiptSettings")}
                iconColor={theme.primary}
                iconBg={theme.primaryLight}
              />
              {isManager && (
                <MenuButton
                  icon="calculator"
                  label="Tax Settings"
                  subtitle="Manage tax rates"
                  rightText={`${taxRate}%`}
                  onPress={() => navigation.navigate("TaxSettings")}
                  iconColor={theme.primary}
                  iconBg={theme.primaryLight}
                />
              )}
            </View>
          </View>
        )}

        { permissions?.canManageUsers && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>USER MANAGEMENT</Text>
            <View style={styles.card}>
              <MenuButton
                icon="people"
                label="Staff Management"
                subtitle="Add, edit, or remove staff members"
                onPress={() => navigation.navigate("StaffManagement")}
                iconColor={theme.primary}
                iconBg={theme.primaryLight}
              />
              <MenuButton
                icon="shield-checkmark"
                label="User Roles"
                subtitle="Configure permissions"
                onPress={() => navigation.navigate("RoleManagement")}
                iconColor={theme.primary}
                iconBg={theme.primaryLight}
              />
            </View>
          </View>
        )}

        { permissions?.canManageShifts && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SHIFT MANAGEMENT</Text>
            <View style={styles.card}>
              <MenuButton
                icon="time"
                label="Current Shift"
                subtitle="No active shift"
                onPress={() => navigation.navigate("ShiftManagement")}
                iconColor={theme.primary}
                iconBg={theme.primaryLight}
              />
              <MenuButton
                icon="calendar"
                label="Shift History"
                subtitle="View past shifts"
                onPress={() => navigation.navigate("ShiftManagement")}
                iconColor={theme.primary}
                iconBg={theme.primaryLight}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT & ABOUT</Text>
          <View style={styles.card}>
            <MenuButton
              icon="help-circle"
              label="Help & Support"
              subtitle="Get help with the app"
              onPress={() => {}}
              iconColor={theme.primary}
              iconBg={theme.primaryLight}
            />
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="information-circle" size={20} color={theme.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>About</Text>
                  <Text style={styles.menuSubtitle}>Version 1.0.0</Text>
                </View>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>MVP</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const MenuButton: React.FC<{
  icon: string
  label: string
  subtitle: string
  onPress: () => void
  rightText?: string
  iconColor?: string
  iconBg?: string
}> = ({ icon, label, subtitle, onPress, rightText, iconColor, iconBg }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg || Colors.teal50 }]}>
        <Ionicons name={icon as any} size={20} color={iconColor || Colors.teal} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <View style={styles.menuRight}>
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  businessName: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  businessInfo: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.red50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.error,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.gray500,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rightText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  badge: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.error,
  },
})
