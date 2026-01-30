"use client"

import type React from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { useInventory } from "../../contexts/InventoryContext"
import { Input } from "../../components/Input"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const POSHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user, logout } = useAuth()
  const { items, addItem } = useCart()
  const { categories, getFilteredProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } =
    useInventory()

  const products = getFilteredProducts()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Assign colors to products based on category
  const getProductColor = (category: string) => {
    const colorMap: Record<string, string> = {
      Bakery: Colors.productRed,
      Snacks: Colors.productGreen,
      Beverages: Colors.productBlue,
      Dairy: Colors.productPurple,
    }
    return colorMap[category] || Colors.productOrange
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.businessName}>{business?.name || "Demo Store"}</Text>
            <Text style={styles.userName}>
              {user?.name} • {user?.role}
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.gray400} style={styles.searchIcon} />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            containerStyle={styles.searchInputContainer}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>
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
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => addItem(item)}>
            <View style={[styles.productImage, { backgroundColor: getProductColor(item.category) }]}>
              <Ionicons name="cube-outline" size={48} color={Colors.white} />
            </View>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.productStock}>Stock: {item.stock}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.productsGrid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={64} color={Colors.gray300} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="cart" size={26} color={Colors.teal} />
          <Text style={[styles.navText, styles.navTextActive]}>POS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Inventory")}>
          <Ionicons name="cube-outline" size={26} color={Colors.gray400} />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Reports")}>
          <Ionicons name="bar-chart-outline" size={26} color={Colors.gray400} />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={26} color={Colors.gray400} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
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
    backgroundColor: Colors.gray50,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
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
    backgroundColor: Colors.gray100,
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
  categoriesContainer: {
    backgroundColor: Colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
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
  },
  productImage: {
    width: "100%",
    aspectRatio: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
  productStock: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    width: "100%",
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.gray400,
    marginTop: 16,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  navText: {
    fontSize: Typography.xs,
    color: Colors.gray600,
  },
  navTextActive: {
    color: Colors.teal,
    fontWeight: Typography.semibold,
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
