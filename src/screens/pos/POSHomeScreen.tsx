
import React, { useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { useInventory } from "../../contexts/InventoryContext"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"
import { SubscriptionBanner } from "../../components/SubscriptionBanner"
import { useSettings } from "../../contexts/SettingsContext"

export const POSHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user, logout, activeShift, checkActiveShift } = useAuth()
  const { items, addItem } = useCart()

  useEffect(() => {
    checkActiveShift()
  }, [])
  const { enableDrafts } = useSettings()
  const { categories, getFilteredProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, loading, refreshData } =
    useInventory()

  const products = getFilteredProducts()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Assign colors to products based on category
  const getProductColor = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId)
    const catName = cat?.name || "Unknown"
    const colorMap: Record<string, string> = {
      Bakery: Colors.productRed,
      Snacks: Colors.productGreen,
      Beverages: Colors.productBlue,
      Dairy: Colors.productPurple,
    }
    return colorMap[catName] || Colors.productOrange
  }

  const handleActionWithShiftCheck = (action: () => void) => {
    if (!activeShift) {
      Alert.alert(
        "No Active Shift",
        "You must start a shift before performing sales operations.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Start Shift", 
            onPress: () => navigation.navigate("ShiftManagement")
          }
        ]
      )
      return
    }
    action()
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.businessName}>{business?.name || "Demo Store"}</Text>
            <Text style={styles.userName}>
              {user?.first_name} {user?.last_name} • {user?.role}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={styles.logoutButton}>
              <Ionicons name="apps" size={24} color={Colors.teal} />
            </TouchableOpacity>
            {enableDrafts && (
                <TouchableOpacity onPress={() => navigation.navigate("DraftOrders")} style={styles.logoutButton}>
                    <Ionicons name="documents-outline" size={24} color={Colors.teal} />
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.gray400} style={styles.searchIcon} />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            inputStyle={styles.searchInput}
            containerStyle={styles.searchInputContainer}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item.id.toString() && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item.id.toString())}
            >
              <Text style={[styles.categoryText, selectedCategory === item.id.toString() && styles.categoryTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isLowStock = item.stock <= 7 && item.stock > 0
          const isOutOfStock = item.stock <= 0
          
          return (
            <TouchableOpacity 
              style={[
                styles.productCard,
                isOutOfStock && styles.productCardDisabled
              ]} 
              onPress={() => {
                if (!isOutOfStock) {
                  handleActionWithShiftCheck(() => addItem(item))
                }
              }}
              disabled={isOutOfStock}
            >
              <View style={[styles.productImage, { backgroundColor: getProductColor(item.category_id) }]}>
                <Ionicons name="cube-outline" size={48} color={Colors.white} />
                {isOutOfStock && (
                  <View style={styles.outOfStockOverlay}>
                    <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                  </View>
                )}
              </View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{formatCurrency(item.price, business?.currency)}</Text>
              <View style={styles.stockContainer}>
                <Text style={[
                  styles.productStock,
                  isLowStock && styles.productStockLow,
                  isOutOfStock && styles.productStockOut
                ]}>
                  Stock: {item.stock}
                </Text>
                {isLowStock && !isOutOfStock && (
                  <Ionicons name="warning" size={14} color={Colors.error} />
                )}
              </View>
            </TouchableOpacity>
          )
        }}
        contentContainerStyle={styles.productsGrid}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshData}
            colors={[Colors.teal]}
            tintColor={Colors.teal}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.teal} />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={64} color={Colors.gray300} />
              </View>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Start by adding products to your inventory</Text>
              <Button
                title="Add Product"
                onPress={() => navigation.navigate("Inventory", { action: "add" })}
                variant="primary"
                primaryColor={Colors.teal}
                style={styles.emptyButton}
              />
            </View>
          )
        }
      />



      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity style={styles.cartButton} onPress={() => handleActionWithShiftCheck(() => navigation.navigate("Cart"))}>
          <Ionicons name="cart" size={28} color={Colors.white} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.tealLight,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  businessName: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  userName: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tealLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.gray300,
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
  categoriesContainer: {
    backgroundColor: Colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  categoryChipActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  categoryText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.gray700,
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: Typography.semibold,
  },
  productsGrid: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    overflow: "hidden",
  },
  productCardDisabled: {
    opacity: 0.6,
    backgroundColor: Colors.gray100,
  },
  productImage: {
    width: "100%",
    aspectRatio: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  outOfStockText: {
    color: Colors.white,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    textAlign: "center",
  },
  productName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productStock: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
  productStockLow: {
    color: Colors.error,
    fontWeight: Typography.semibold,
  },
  productStockOut: {
    color: Colors.gray400,
    fontWeight: Typography.semibold,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
    width: "100%",
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: Typography.base,
    color: Colors.gray500,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    width: "100%",
  },
  loadingText: {
    marginTop: 16,
    fontSize: Typography.base,
    color: Colors.gray600,
  },

  cartButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: Colors.teal,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
})
