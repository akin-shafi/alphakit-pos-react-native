"use client"

import type React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { RolePermissions } from "../../constants/Roles"
import { Card } from "../../components/Card"
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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={32} color={Colors.white} />
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role.toUpperCase()}</Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <Card style={styles.menuCard}>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color={Colors.gray600} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Business Name</Text>
                <Text style={styles.infoValue}>{business?.name}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={Colors.gray600} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{business?.address}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={Colors.gray600} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{business?.phone}</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          <Card style={styles.menuCard}>
            <PermissionRow icon="business" label="Manage Business" granted={permissions?.canManageBusiness || false} />
            <PermissionRow icon="people" label="Manage Users" granted={permissions?.canManageUsers || false} />
            <PermissionRow icon="cube" label="Manage Inventory" granted={permissions?.canManageInventory || false} />
            <PermissionRow icon="bar-chart" label="View Reports" granted={permissions?.canViewReports || false} />
            <PermissionRow icon="settings" label="Manage Settings" granted={permissions?.canManageSettings || false} />
          </Card>
        </View>

        {permissions?.canManageSettings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Settings</Text>
            <Card style={styles.menuCard}>
              <MenuButton
                icon="card-outline"
                label="Payment & Checkout"
                onPress={() => navigation.navigate("PaymentSettings")}
              />
              <MenuButton
                icon="print-outline"
                label="Printer Setup"
                onPress={() => Alert.alert("Printer Setup", "Configure thermal printer settings")}
              />
              <MenuButton
                icon="sync-outline"
                label="Sync Settings"
                onPress={() => Alert.alert("Sync Settings", "Configure offline sync settings")}
              />
            </Card>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  )
}

const PermissionRow: React.FC<{ icon: string; label: string; granted: boolean }> = ({ icon, label, granted }) => (
  <View style={styles.permissionRow}>
    <View style={styles.permissionLeft}>
      <Ionicons name={icon as any} size={20} color={Colors.gray600} />
      <Text style={styles.permissionLabel}>{label}</Text>
    </View>
    <Ionicons
      name={granted ? "checkmark-circle" : "close-circle"}
      size={20}
      color={granted ? Colors.success : Colors.gray300}
    />
  </View>
)

const MenuButton: React.FC<{ icon: string; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress}>
    <View style={styles.menuLeft}>
      <Ionicons name={icon as any} size={20} color={Colors.gray600} />
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
  </TouchableOpacity>
)

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
  content: {
    padding: 16,
    gap: 24,
  },
  profileCard: {
    padding: 24,
    alignItems: "center",
  },
  profileIcon: {
    width: 80,
    height: 80,
    backgroundColor: Colors.gray900,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileName: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: Colors.gray900,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
    paddingHorizontal: 4,
  },
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.gray900,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  permissionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  permissionLabel: {
    fontSize: Typography.base,
    color: Colors.gray700,
  },
  menuButton: {
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
    gap: 12,
  },
  menuLabel: {
    fontSize: Typography.base,
    color: Colors.gray700,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.error,
  },
  version: {
    fontSize: Typography.sm,
    color: Colors.gray400,
    textAlign: "center",
    paddingVertical: 16,
  },
})
