

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useInventory } from "../../contexts/InventoryContext"
import { RolePermissions } from "../../constants/Roles"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { ProductDrawer } from "../../components/ProductDrawer"
import { AuthService } from "../../services/AuthService"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"
import type { Product } from "../../types"

export const InventoryScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { business, user } = useAuth()
  const { products, searchQuery, setSearchQuery, getFilteredProducts, addProduct, updateProduct, deleteProduct, refreshData, loading: inventoryLoading } = useInventory()
  const [loading, setLoading] = useState(false)

  const roleKey = (user?.role?.toLowerCase() || "") as any
  const canManage = RolePermissions[roleKey as keyof typeof RolePermissions]?.canManageInventory || false
  const filteredProducts = getFilteredProducts()

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add")
  
  useEffect(() => {
    if (route.params?.action === "add") {
      handleAddProduct()
      // Clear the param after handling it
      navigation.setParams({ action: undefined })
    }
  }, [route.params?.action])

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setDrawerMode("add")
    setDrawerVisible(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setDrawerMode("edit")
    setDrawerVisible(true)
  }

  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      if (drawerMode === "add") {
        await addProduct(product)
        Alert.alert("Success", "Product added successfully!")
      } else if (selectedProduct) {
        await updateProduct(selectedProduct.id.toString(), product)
        Alert.alert("Success", "Product updated successfully!")
      }
      setDrawerVisible(false)
    } catch (e) {
      Alert.alert("Error", "Failed to save product. Please try again.")
      throw e
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId)
      Alert.alert("Success", "Product deleted successfully!")
      setDrawerVisible(false)
    } catch (e) {
      Alert.alert("Error", "Failed to delete product. Please try again.")
      throw e
    }
  }

  const { categories } = useInventory()

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.name || "Unknown"
  }

  // Category colors matching reference design
  const getCategoryColor = (categoryId: number) => {
    const catName = getCategoryName(categoryId)
    const colorMap: Record<string, string> = {
      Bakery: "#FEE2E2",
      Snacks: "#D1FAE5",
      Beverages: "#DBEAFE",
      Dairy: "#FCE7F3",
    }
    return colorMap[catName] || Colors.gray100
  }

  const getCategoryTextColor = (categoryId: number) => {
    const catName = getCategoryName(categoryId)
    const colorMap: Record<string, string> = {
      Bakery: "#991B1B",
      Snacks: "#065F46",
      Beverages: "#1E40AF",
      Dairy: "#831843",
    }
    return colorMap[catName] || Colors.gray700
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>{business?.name || "Demo Store"}</Text>
            <Text style={styles.productCount}>{filteredProducts.length} products</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity 
              style={{ padding: 8, backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray200 }} 
              onPress={() => navigation.navigate("Dashboard")}
            >
              <Ionicons name="apps" size={24} color={Colors.teal} />
            </TouchableOpacity>
            {canManage && (
              <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                <Ionicons name="add" size={24} color={Colors.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.gray400} style={styles.searchIcon} />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            containerStyle={styles.searchInputContainer}
          />
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => canManage && handleEditProduct(item)}
            activeOpacity={canManage ? 0.7 : 1}
          >
            <View style={styles.productHeader}>
              <View>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category_id) }]}>
                  <Text style={[styles.categoryText, { color: getCategoryTextColor(item.category_id) }]}>
                    {getCategoryName(item.category_id)}
                  </Text>
                </View>
              </View>
              <View style={styles.stockSection}>
                <Text style={styles.stockCount}>{item.stock}</Text>
                <Text style={styles.stockLabel}>in stock</Text>
              </View>
            </View>
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>Price: {formatCurrency(item.price, business?.currency)}</Text>
              <Text style={styles.productSku}>SKU: {item.sku}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={inventoryLoading}
            onRefresh={refreshData}
            colors={[Colors.teal]}
            tintColor={Colors.teal}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cube-outline" size={64} color={Colors.gray300} />
            </View>
            <Text style={styles.emptyText}>No products found</Text>
            
            {canManage && !business?.is_seeded && (
              <View style={styles.seedContainer}>
                <Text style={styles.seedText}>
                  Want to start quickly? Populate your inventory with sample {business?.type || "retail"} data.
                </Text>
                <Button
                  title="Populate Sample Data"
                  onPress={async () => {
                    try {
                      setLoading(true)
                      await AuthService.seedSampleData(business?.id || 0, business?.type.toUpperCase() || "RETAIL")
                      await refreshData()
                      alert("Sample data populated successfully!")
                    } catch (e) {
                      alert("Failed to seed data.")
                    } finally {
                      setLoading(false)
                    }
                  }}
                  variant="outline"
                  primaryColor={Colors.teal}
                  loading={loading}
                />
              </View>
            )}
          </View>
        }
      />



      <ProductDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        product={selectedProduct}
        mode={drawerMode}
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
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    minHeight: 160,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  businessName: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  productCount: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    marginTop: 0,
  },
  searchInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productName: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  stockSection: {
    alignItems: "flex-end",
  },
  stockCount: {
    fontSize: 32,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    lineHeight: 36,
  },
  stockLabel: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productPrice: {
    fontSize: Typography.sm,
    color: Colors.gray700,
  },
  productSku: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 16,
  },
  seedContainer: {
    alignItems: "center",
    marginTop: 16,
    padding: 24,
    backgroundColor: Colors.teal + "05",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.teal + "20",
    width: "100%",
  },
  seedText: {
    fontSize: Typography.base,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

})
