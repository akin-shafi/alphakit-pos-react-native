import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { UserRole } from "../../constants/Roles"
import UserService from "../../services/UserService"
import type { User } from "../../types"

export const StaffManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Form State
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<UserRole>(UserRole.CASHIER)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await UserService.getUsers()
      setUsers(data)
    } catch (e) {
      console.error("Failed to fetch users", e)
      Alert.alert("Error", "Failed to load staff members")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingUser(null)
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
    setRole(UserRole.CASHIER)
    setModalVisible(true)
  }

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user)
    setFirstName(user.first_name)
    setLastName(user.last_name)
    setEmail(user.email)
    setPassword("") // Don't show old password
    setRole(user.role.toLowerCase() as UserRole)
    setModalVisible(true)
  }

  const handleSaveUser = async () => {
    if (!firstName || !lastName || !email || (!editingUser && !password)) {
      Alert.alert("Error", "Please fill all required fields")
      return
    }

    setSubmitting(true)
    try {
      if (editingUser) {
        // Update
        const updates: any = {
          first_name: firstName,
          last_name: lastName,
          role: role.toUpperCase(),
        }
        if (password) updates.password = password
        
        await UserService.updateUser(editingUser.id.toString(), updates)
        Alert.alert("Success", "Staff member updated successfully")
      } else {
        // Create
        await UserService.createUser({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          role: role.toUpperCase(),
          active: true,
        })
        Alert.alert("Success", "Staff member added successfully")
      }
      
      setModalVisible(false)
      fetchUsers()
    } catch (e: any) {
      console.error("Failed to save user", e)
      const errorMsg = e.response?.data?.error || e.message || `Failed to ${editingUser ? "update" : "add"} staff member`
      Alert.alert("Error", errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = (userId: number) => {
    Alert.alert("Delete Staff", "Are you sure you want to remove this staff member?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await UserService.deleteUser(userId.toString())
            fetchUsers()
          } catch (e) {
            Alert.alert("Error", "Failed to remove staff member")
          }
        },
      },
    ])
  }

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.first_name[0]}{item.last_name[0]}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: item.role === "OWNER" ? Colors.purple50 : item.role === "MANAGER" ? Colors.blue50 : Colors.gray50 }]}>
            <Text style={[styles.roleBadgeText, { color: item.role === "OWNER" ? Colors.purple : item.role === "MANAGER" ? Colors.info : Colors.gray600 }]}>
              {item.role}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity onPress={() => handleOpenEditModal(item)} style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color={Colors.teal} />
        </TouchableOpacity>
        {item.role !== "OWNER" && (
          <TouchableOpacity onPress={() => handleDeleteUser(item.id)} style={[styles.actionButton, { marginLeft: 12 }]}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Management</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.teal} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={Colors.gray300} />
              <Text style={styles.emptyText}>No staff members found</Text>
            </View>
          }
        />
      )}

      {/* Add User Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? "Edit Staff Member" : "Add Staff Member"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="john.doe@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!editingUser}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Default Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Min 6 characters"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={Colors.gray500} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Role</Text>
                  <View style={styles.roleSelector}>
                    {[UserRole.MANAGER, UserRole.CASHIER].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleOption, role === r && styles.roleOptionActive]}
                        onPress={() => setRole(r)}
                      >
                        <Text style={[styles.roleOptionText, role === r && styles.roleOptionTextActive]}>
                          {r.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSaveUser}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editingUser ? "Update Staff" : "Add Staff Member"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.teal50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.teal,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.gray400,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  input: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 12,
    fontSize: Typography.base,
    color: Colors.gray900,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: Typography.base,
    color: Colors.gray900,
  },
  eyeIcon: {
    padding: 12,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: "center",
    backgroundColor: Colors.gray50,
  },
  roleOptionActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal50,
  },
  roleOptionText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.gray600,
  },
  roleOptionTextActive: {
    color: Colors.teal,
  },
  submitButton: {
    backgroundColor: Colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
})
