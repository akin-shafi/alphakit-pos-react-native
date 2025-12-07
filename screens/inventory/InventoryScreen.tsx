"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useInventory } from "../../contexts/InventoryContext"
import { RolePermissions } from "../../constants/Roles"
import { Card } from "../../components/Card"
import { Input } from "../../components/Input"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const InventoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user } = useAuth()
  const { products, searchQuery, setSearchQuery, getFilteredProducts } = useInventory()
  const [sortBy, setSortBy] = useState<"name" | "stock">("name")

  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default
  const canManage = user ? RolePermissions[user.role].canManageInventory : false

  const filteredProducts = getFilteredProducts().sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return a.stock - b.stock
  })

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inventory</Text>
          {canManage && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => Alert.alert("Add Product", "Feature coming soon")}
            >
              <Ionicons name="add" size={24} color={Colors.white} />
            </TouchableOpacity>
          )}
          {!canManage && <View style={styles.placeholder} />}
        </View>

        <Input
          placeholder="Search inventory..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
          inputStyle={styles.searchInput}
        />
      </View>

      <View style={styles.stats}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </Card>
        <Card style={[styles.statCard, lowStockCount > 0 && styles.statCardWarning]}>
          <View style={styles.statHeader}>
            <Text style={[styles.statValue, lowStockCount > 0 && styles.statValueWarning]}>{lowStockCount}</Text>
            {lowStockCount > 0 && <Ionicons name="warning" size={20} color={Colors.warning} />}
          </View>
          <Text style={styles.statLabel}>Low Stock</Text>
        </Card>
      </View>

      <View style={styles.controls}>
        <Text style={styles.controlLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === "name" && styles.sortButtonActive]}
          onPress={() => setSortBy("name")}
        >
          <Text style={[styles.sortText, sortBy === "name" && styles.sortTextActive]}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === "stock" && styles.sortButtonActive]}
          onPress={() => setSortBy("stock")}
        >
          <Text style={[styles.sortText, sortBy === "stock" && styles.sortTextActive]}>Stock Level</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productIcon}>
                <Ionicons name="cube-outline" size={24} color={Colors.gray400} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSku}>{item.sku}</Text>
              </View>
              {canManage && (
                <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert("Edit", "Feature coming soon")}>
                  <Ionicons name="create-outline" size={20} color={Colors.gray600} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.productDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price:</Text>
                <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cost:</Text>
                <Text style={styles.detailValue}>${item.cost.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stock:</Text>
                <Text style={[styles.detailValue, item.stock <= item.minStock && styles.detailValueWarning]}>
                  {item.stock}
                  {item.stock <= item.minStock && " ⚠"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{item.category}</Text>
              </View>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={64} color={Colors.gray300} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  addButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    marginTop: 0,
  },
  searchInput: {
    backgroundColor: Colors.white,
  },
  stats: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  statCardWarning: {
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  statValueWarning: {
    color: Colors.warning,
  },
  statLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginTop: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    gap: 12,
  },
  controlLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  sortButtonActive: {
    backgroundColor: Colors.black,
  },
  sortText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  sortTextActive: {
    color: Colors.white,
    fontWeight: Typography.semibold,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    padding: 16,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  productIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  productSku: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  editButton: {
    padding: 8,
  },
  productDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  detailValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  detailValueWarning: {
    color: Colors.warning,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.gray400,
    marginTop: 16,
  },
})
