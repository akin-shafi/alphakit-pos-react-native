"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { useInventory } from "../../contexts/InventoryContext"
import { ProductTile } from "../../components/ProductTile"
import { Input } from "../../components/Input"
import { StatusBadge } from "../../components/StatusBadge"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const POSHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business, user, logout } = useAuth()
  const { items, addItem } = useCart()
  const { categories, getFilteredProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } =
    useInventory()

  const [connectionStatus] = useState({
    isOnline: true,
    lastSyncTime: new Date(),
    pendingSyncCount: 0,
  })

  const products = getFilteredProducts()
  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>{business?.name}</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <View style={styles.headerRight}>
            <StatusBadge status={connectionStatus} />
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.gray400} />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            containerStyle={styles.searchContainer}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={Colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.id && [styles.categoryChipActive, { backgroundColor: theme.primaryLight }],
              ]}
              onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={selectedCategory === item.id ? theme.primary : Colors.gray600}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.id && [styles.categoryTextActive, { color: theme.primary }],
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      {/* Products Grid */}
      <View style={styles.content}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <ProductTile product={item} onPress={() => addItem(item)} />}
          contentContainerStyle={styles.productsGrid}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={64} color={Colors.gray300} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      </View>

      {/* Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          style={[styles.cartButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Cart")}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>
          <Ionicons name="cart" size={24} color={Colors.white} />
          <Text style={styles.cartButtonText}>View Cart</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("POSHome")}>
          <Ionicons name="home" size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>POS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Inventory")}>
          <Ionicons name="cube-outline" size={24} color={Colors.gray400} />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Reports")}>
          <Ionicons name="bar-chart-outline" size={24} color={Colors.gray400} />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color={Colors.gray400} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
    color: Colors.white,
    marginBottom: 4,
  },
  userName: {
    fontSize: Typography.sm,
    color: Colors.white,
    opacity: 0.9,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutButton: {
    padding: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  categories: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    gap: 6,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.black,
  },
  categoryText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.gray600,
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: Typography.semibold,
  },
  content: {
    flex: 1,
  },
  productsGrid: {
    padding: 16,
  },
  row: {
    gap: 16,
    marginBottom: 16,
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
  cartButton: {
    position: "absolute",
    bottom: 80,
    right: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  cartBadge: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.black,
  },
  cartButtonText: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    gap: 4,
  },
  navText: {
    fontSize: Typography.xs,
    color: Colors.gray600,
  },
})
