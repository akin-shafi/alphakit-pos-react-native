import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, RefreshControl, KeyboardAvoidingView, ScrollView, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { TableService, Table } from "../../services/TableService"
import { Colors, BusinessThemes, getBusinessTheme } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"

export const TableManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useAuth()
  const theme = getBusinessTheme(business?.type)
  
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentTable, setCurrentTable] = useState<Partial<Table>>({
    table_number: "",
    section: "Main Hall",
    capacity: 4
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    setLoading(true)
    try {
      const data = await TableService.listTables()
      setTables(data || [])
    } catch (error) {
      console.error(error)
      Alert.alert("Error", "Failed to fetch tables")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentTable.table_number) {
      Alert.alert("Error", "Table number is required")
      return
    }

    setLoading(true)
    try {
      if (isEditing && currentTable.id) {
        await TableService.updateTable(currentTable.id, currentTable)
      } else {
        await TableService.createTable(currentTable)
      }
      setModalVisible(false)
      fetchTables()
    } catch (error) {
      Alert.alert("Error", "Failed to save table")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    Alert.alert("Delete Table", "Are you sure you want to delete this table?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await TableService.deleteTable(id)
            fetchTables()
          } catch (error) {
            Alert.alert("Error", "Failed to delete table")
          }
        }
      }
    ])
  }

  const openAddModal = () => {
    setCurrentTable({ table_number: "", section: "Main Hall", capacity: 4 })
    setIsEditing(false)
    setModalVisible(true)
  }

  const openEditModal = (table: Table) => {
    setCurrentTable(table)
    setIsEditing(true)
    setModalVisible(true)
  }

  const renderTableCard = ({ item }: { item: Table }) => (
    <Card style={styles.tableCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.tableIcon, { backgroundColor: item.status === 'available' ? Colors.green50 : Colors.red50 }]}>
          <Ionicons name="restaurant" size={24} color={item.status === 'available' ? Colors.success : Colors.error} />
        </View>
        <View style={styles.tableInfo}>
          <Text style={styles.tableNumber}>{item.table_number}</Text>
          <Text style={styles.tableSection}>{item.section || "General"}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
            <Ionicons name="pencil" size={20} color={Colors.gray600} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
         <View style={styles.footerItem}>
            <Ionicons name="people-outline" size={16} color={Colors.gray500} />
            <Text style={styles.footerText}>{item.capacity} Seats</Text>
         </View>
         <View style={[styles.statusBadge, { backgroundColor: item.status === 'available' ? Colors.green50 : Colors.red50 }]}>
            <Text style={[styles.statusText, { color: item.status === 'available' ? Colors.success : Colors.error }]}>
                {item.status.toUpperCase()}
            </Text>
         </View>
      </View>
    </Card>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Table Management</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tables}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTableCard}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTables} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={80} color={Colors.gray300} />
              <Text style={styles.emptyText}>No tables configured yet</Text>
              <Button 
                title="Add Your First Table" 
                onPress={openAddModal}
                style={styles.emptyBtn}
                primaryColor={theme.primary}
              />
            </View>
          ) : null
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{isEditing ? "Edit Table" : "Add New Table"}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.gray600} />
                </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Table Number / Name</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="e.g. T-1 or VIP-1"
                            value={currentTable.table_number}
                            onChangeText={(text) => setCurrentTable({...currentTable, table_number: text})}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Section</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="e.g. Main Hall"
                            value={currentTable.section}
                            onChangeText={(text) => setCurrentTable({...currentTable, section: text})}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Capacity (Seats)</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="4"
                            keyboardType="numeric"
                            value={currentTable.capacity?.toString()}
                            onChangeText={(text) => setCurrentTable({...currentTable, capacity: parseInt(text) || 0})}
                        />
                    </View>
                    
                    <Button 
                        title={isEditing ? "Update Table" : "Create Table"} 
                        onPress={handleSave} 
                        loading={loading}
                        primaryColor={theme.primary}
                        style={styles.saveBtn}
                    />
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
    padding: 8,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  addButton: {
    padding: 8,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  tableCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tableIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  tableInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  tableSection: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray50,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: Typography.xs,
    color: Colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: Typography.base,
    color: Colors.gray500,
    marginBottom: 24,
  },
  emptyBtn: {
    paddingHorizontal: 32,
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: Typography.medium,
    color: Colors.gray700,
  },
  input: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    fontSize: Typography.base,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  saveBtn: {
    marginTop: 12,
  }
})
