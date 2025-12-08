"use client"

import type React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { RolePermissions } from "../../constants/Roles"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user, logout } = useAuth()

  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default
  const permissions = user ? RolePermissions[user.role] : null

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

  const getUserInitials = () => {
    if (!user?.name) return "U"
    const names = user.name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.name[0].toUpperCase()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.businessName}>{business?.name || "Standford"}</Text>
        <Text style={styles.businessInfo}>
          {business?.type.charAt(0).toUpperCase() + business?.type.slice(1)} • Business Id:{" "}
          {business?.businessId || "2"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Shafi"}</Text>
            <Text style={styles.profileUsername}>{user?.email?.split("@")[0].toUpperCase() || "AKINROPO"}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role || "Admin"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BUSINESS INFORMATION</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.red50 }]}>
                <Ionicons name="business" size={20} color={Colors.error} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{business?.name || "Standford"}</Text>
                <Text style={styles.infoSubtitle}>
                  {business?.type.charAt(0).toUpperCase() + business?.type.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.teal50 }]}>
                <Ionicons name="location" size={20} color={Colors.teal} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Branch</Text>
                <Text style={styles.infoSubtitle}>Main location</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>POS CONFIGURATION</Text>
          <View style={styles.card}>
            <MenuButton
              icon="print"
              label="Printer Setup"
              subtitle="Configure thermal printer"
              onPress={() => {}}
              iconColor={Colors.teal}
              iconBg={Colors.teal50}
            />
            <MenuButton
              icon="receipt"
              label="Receipt Template"
              subtitle="Customize receipt layout"
              onPress={() => {}}
              iconColor={Colors.teal}
              iconBg={Colors.teal50}
            />
            <MenuButton
              icon="calculator"
              label="Tax Settings"
              subtitle="Manage tax rates"
              rightText="0%"
              onPress={() => {}}
              iconColor={Colors.teal}
              iconBg={Colors.teal50}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>USER MANAGEMENT</Text>
          <View style={styles.card}>
            <MenuButton
              icon="people"
              label="Manage Users"
              subtitle="Add, edit, or remove users"
              onPress={() => {}}
              iconColor={Colors.teal}
              iconBg={Colors.teal50}
            />
            <MenuButton
              icon="shield-checkmark"
              label="User Roles"
              subtitle="Configure permissions"
              onPress={() => {}}
              iconColor={Colors.teal}
              iconBg={Colors.teal50}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHIFT MANAGEMENT</Text>
          <View style={styles.card}>
            <MenuButton
              icon="time"
              label="Current Shift"
              subtitle="No active shift"
              onPress={() => {}}
              iconColor={Colors.teal}
              iconBg={Colors.teal50}
            />
            <MenuButton
              icon="calendar"
              label="Shift History"
              subtitle="View past shifts"
              onPress={() => {}}
              iconColor={Colors.teal}
              iconBg={Colors.teal50}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT & ABOUT</Text>
          <View style={styles.card}>
            <MenuButton
              icon="help-circle"
              label="Help & Support"
              subtitle="Get help with the app"
              onPress={() => {}}
              iconColor={Colors.teal}
              iconBg={Colors.teal50}
            />
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.teal50 }]}>
                  <Ionicons name="information-circle" size={20} color={Colors.teal} />
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
