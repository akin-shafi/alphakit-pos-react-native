
import type React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { RolePermissions, UserRole } from "../../constants/Roles"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const RoleManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const roles = Object.keys(RolePermissions) as UserRole[]

  const getPermissionLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^can /, "")
      .replace(/^\w/, (c) => c.toUpperCase())
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Roles & Permissions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.teal} />
          <Text style={styles.infoText}>
            Permissions are predefined for each role to ensure maximum security and operational efficiency.
          </Text>
        </View>

        {roles.map((role) => (
          <View key={role} style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View style={[styles.roleIcon, { backgroundColor: role === UserRole.OWNER ? Colors.purple50 : role === UserRole.MANAGER ? Colors.blue50 : Colors.gray50 }]}>
                <Ionicons 
                  name={role === UserRole.OWNER ? "rocket" : role === UserRole.MANAGER ? "briefcase" : "person"} 
                  size={24} 
                  color={role === UserRole.OWNER ? Colors.purple : role === UserRole.MANAGER ? Colors.info : Colors.gray600} 
                />
              </View>
              <View>
                <Text style={styles.roleName}>{role.toUpperCase()}</Text>
                <Text style={styles.roleDescription}>
                  {role === UserRole.OWNER ? "Full business control" : 
                   role === UserRole.MANAGER ? "Operational management" : 
                   "Sales & basic operations"}
                </Text>
              </View>
            </View>

            <View style={styles.permissionsGrid}>
              {Object.entries(RolePermissions[role]).map(([key, value]) => (
                <View key={key} style={styles.permissionItem}>
                  <Ionicons 
                    name={value ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={value ? Colors.success : Colors.gray300} 
                  />
                  <Text style={[styles.permissionLabel, !value && styles.permissionDisabled]}>
                    {getPermissionLabel(key)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
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
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.teal50,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.teal,
    lineHeight: 20,
  },
  roleCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleName: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  roleDescription: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
  permissionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    width: "48%",
  },
  permissionLabel: {
    fontSize: 11,
    fontWeight: Typography.medium,
    color: Colors.gray700,
  },
  permissionDisabled: {
    color: Colors.gray400,
    textDecorationLine: "line-through",
  },
})
