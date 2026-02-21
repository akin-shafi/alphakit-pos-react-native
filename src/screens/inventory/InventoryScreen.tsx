

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, ScrollView as RNScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useInventory } from "../../contexts/InventoryContext"
import { RolePermissions } from "../../constants/Roles"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { ProductDrawer } from "../../components/ProductDrawer"
import { AuthService } from "../../services/AuthService"
import apiClient from "../../services/ApiClient"
import { Colors, BusinessThemes, getBusinessTheme } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"
import type { Product } from "../../types"

export const InventoryScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { business, user } = useAuth()
  const { 
    products, 
    categories,
    searchQuery, 
    setSearchQuery, 
    getFilteredProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    refreshData, 
    loading: inventoryLoading,
    addCategory: createCategory,
    updateCategory: editCategoryService,
    deleteCategory: removeCategory
  } = useInventory()
  const [loading, setLoading] = useState(false)

  const roleKey = (user?.role?.toLowerCase() || "") as any
  const canManage = RolePermissions[roleKey as keyof typeof RolePermissions]?.canManageInventory || false
  const filteredProducts = getFilteredProducts()

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add")

  // Bulk Rounds State
  const [activeRounds, setActiveRounds] = useState<any[]>([])
  const isIndustrial = business?.type === 'FUEL_STATION' || business?.type === 'LPG_STATION' || business?.active_modules?.includes('BULK_STOCK_MANAGEMENT')

  useEffect(() => {
    if (isIndustrial) {
      fetchRounds()
    }
  }, [isIndustrial])

  const fetchRounds = async () => {
    try {
      const resp = await apiClient.get('/inventory/rounds/active')
      setActiveRounds(resp.data)
    } catch (e) {
      console.log('Failed to fetch rounds')
    }
  }

  // Category Management State
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState("")

  // Recipe Modal State
  const [recipeModalVisible, setRecipeModalVisible] = useState(false)
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([])
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [selectedIngId, setSelectedIngId] = useState<string>("")
  const [ingQuantity, setIngQuantity] = useState("1")

  // Ingredient Selection Picker State
  const [ingPickerVisible, setIngPickerVisible] = useState(false)
  const [ingSearch, setIngSearch] = useState("")
  
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

  // Category Handlers
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    setLoading(true)
    try {
      await createCategory(newCatName)
      Alert.alert("Success", "Category added")
      setNewCatName("")
    } catch (e) {
      Alert.alert("Error", "Failed to add category")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCatId || !editCatName.trim()) return
    setLoading(true)
    try {
      await editCategoryService(editingCatId, editCatName)
      Alert.alert("Success", "Category updated")
      setEditingCatId(null)
    } catch (e) {
      Alert.alert("Error", "Failed to update category")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    Alert.alert("Delete Category", `Are you sure you want to delete "${name}"?`, [
       { text: "Cancel", style: "cancel" },
       { text: "Delete", style: "destructive", onPress: async () => {
          setLoading(true)
          try {
            await removeCategory(id)
            Alert.alert("Success", "Category deleted")
          } catch(e) {
            Alert.alert("Error", "Failed to delete category")
          } finally {
            setLoading(false)
          }
       }}
    ])
  }

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.name || "Unknown"
  }

  const handleOpenRecipe = async (product: Product) => {
    setSelectedProduct(product)
    setRecipeModalVisible(true)
    setRecipeLoading(true)
    try {
      const resp = await AuthService.getRecipe(product.id.toString())
      setRecipeIngredients(resp.ingredients || resp) // Adjust based on API structure
    } catch (e) {
      Alert.alert("Error", "Failed to load recipe")
    } finally {
      setRecipeLoading(false)
    }
  }

  const handleAddIngredient = async () => {
    if (!selectedIngId || !selectedProduct) return
    setLoading(true)
    try {
      await AuthService.addIngredient({
        product_id: selectedProduct.id,
        ingredient_id: parseInt(selectedIngId),
        quantity: parseFloat(ingQuantity)
      })
      // Refresh
      const resp = await AuthService.getRecipe(selectedProduct.id.toString())
      setRecipeIngredients(resp.ingredients || resp)
      setSelectedIngId("")
      setIngQuantity("1")
    } catch (e) {
      Alert.alert("Error", "Failed to add ingredient")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveIngredient = async (id: string) => {
    if (!selectedProduct) return
    try {
      await AuthService.removeIngredient(id)
      const resp = await AuthService.getRecipe(selectedProduct.id.toString())
      setRecipeIngredients(resp.ingredients || resp)
    } catch (e) {
      Alert.alert("Error", "Failed to remove ingredient")
    }
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

  if (!canManage) {
    const theme = getBusinessTheme(business?.type)
    return (
      <View style={styles.container}>
        <View style={[styles.deniedHeader, { backgroundColor: theme.primary }]}>
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inventory</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.noAccess}>
          <Ionicons name="lock-closed" size={64} color={Colors.gray300} />
          <Text style={styles.noAccessTitle}>Access Denied</Text>
          <Text style={styles.noAccessText}>You don't have permission to manage inventory</Text>
          <Button 
            title="Go to Dashboard" 
            onPress={() => navigation.navigate("Dashboard")}
            style={{ marginTop: 24, paddingHorizontal: 32 }}
            variant="primary"
          />
        </View>
      </View>
    )
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
            {canManage && (
              <TouchableOpacity 
                style={{ padding: 8, backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray200 }} 
                onPress={() => setCategoryModalVisible(true)}
              >
                <Ionicons name="list" size={24} color={Colors.gray700} />
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
        renderItem={({ item }) => {
          const activeRound = activeRounds.find(r => r.product_id === item.id)
          const isTracked = item.track_by_round

          return (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => canManage && handleEditProduct(item)}
              activeOpacity={canManage ? 0.7 : 1}
            >
              <View style={styles.productHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                     <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category_id) }]}>
                        <Text style={[styles.categoryText, { color: getCategoryTextColor(item.category_id) }]}>
                           {getCategoryName(item.category_id)}
                        </Text>
                     </View>
                     {isTracked && (
                        <View style={[styles.categoryBadge, { backgroundColor: Colors.teal + '10' }]}>
                           <Text style={[styles.categoryText, { color: Colors.teal }]}>BULK ROUND</Text>
                        </View>
                     )}
                  </View>
                </View>
                <View style={styles.stockSection}>
                  {isTracked && activeRound ? (
                    <View style={{ alignItems: 'flex-end' }}>
                       <Text style={[styles.stockCount, { color: Colors.teal }]}>
                          {activeRound.remaining_volume.toFixed(2)}
                       </Text>
                       <Text style={styles.stockLabel}>{item.unit_of_measure || 'Units'} Left</Text>
                    </View>
                  ) : (
                    <>
                       <Text style={styles.stockCount}>{item.stock}</Text>
                       <Text style={styles.stockLabel}>in stock</Text>
                    </>
                  )}
                </View>
              </View>
              {isTracked && activeRound && (
                <View style={styles.roundProgressContainer}>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${(activeRound.remaining_volume / activeRound.total_volume) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {((activeRound.remaining_volume / activeRound.total_volume) * 100).toFixed(1)}% of round remaining
                  </Text>
                </View>
              )}
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>Price: {formatCurrency(item.price, business?.currency)}</Text>
                <Text style={styles.productSku}>SKU: {item.sku}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          isIndustrial && activeRounds.length > 0 ? (
            <View style={styles.industrialSummary}>
              <View style={styles.summaryTop}>
                 <Ionicons name="stats-chart" size={18} color={Colors.teal} />
                 <Text style={styles.summaryTitle}>Active Rounds Overview</Text>
              </View>
              <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {activeRounds.map(round => {
                   const prod = products.find(p => p.id === round.product_id)
                   return (
                    <View key={round.id} style={styles.roundMiniCard}>
                      <Text style={styles.miniCardTitle} numberOfLines={1}>{prod?.name || 'Unknown'}</Text>
                      <Text style={styles.miniCardValue}>
                        {round.remaining_volume.toFixed(0)} <Text style={{ fontSize: 10 }}>/ {round.total_volume.toFixed(0)}</Text>
                      </Text>
                      <View style={[styles.miniProgressBar, { backgroundColor: Colors.gray100 }]}>
                         <View style={[styles.miniProgressBar, { backgroundColor: Colors.teal, width: `${(round.remaining_volume / round.total_volume) * 100}%` }]} />
                      </View>
                    </View>
                   )
                })}
              </RNScrollView>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={inventoryLoading}
            onRefresh={() => {
              refreshData()
              if (isIndustrial) fetchRounds()
            }}
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
        onManageRecipe={business?.active_modules?.includes('RECIPE_MANAGEMENT') ? handleOpenRecipe : undefined}
      />

      {/* Recipe Management Modal */}
      <Modal visible={recipeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { height: '80%', padding: 0 }]}>
              <View style={[styles.modalHeader, { padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.gray100 }]}>
                 <View>
                    <Text style={styles.modalTitle}>Recipe / BOM</Text>
                    <Text style={{ fontSize: 14, color: Colors.teal, fontWeight: '500' }}>{selectedProduct?.name}</Text>
                 </View>
                 <TouchableOpacity onPress={() => setRecipeModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.gray500} />
                 </TouchableOpacity>
              </View>

              <View style={{ padding: 20 }}>
                 <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.gray900, marginBottom: 12 }}>Add Ingredient</Text>
                 <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                       <Text style={{ fontSize: 11, color: Colors.gray500, marginBottom: 4 }}>Ingredient</Text>
                       <TouchableOpacity 
                          onPress={() => setIngPickerVisible(true)}
                          style={{ borderWidth: 1, borderColor: Colors.gray200, borderRadius: 8, height: 44, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: Colors.white }}
                       >
                          <Text style={{ color: selectedIngId ? Colors.gray900 : Colors.gray400 }}>
                             {selectedIngId ? products.find(p => p.id.toString() === selectedIngId)?.name : "Select Ingredient..."}
                          </Text>
                       </TouchableOpacity>
                    </View>
                    <View style={{ width: 80 }}>
                        <Text style={{ fontSize: 11, color: Colors.gray500, marginBottom: 4 }}>Qty</Text>
                        <Input 
                            value={ingQuantity}
                            onChangeText={setIngQuantity}
                            keyboardType="decimal-pad"
                            containerStyle={{ marginTop: 0 }}
                            style={{ height: 44 }}
                        />
                    </View>
                    <TouchableOpacity 
                       onPress={handleAddIngredient}
                       style={{ backgroundColor: Colors.teal, width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}
                    >
                       <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                 </View>
              </View>

              <RNScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
                 <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.gray900, marginBottom: 12 }}>BOM Details</Text>
                 {recipeLoading ? (
                    <RefreshControl refreshing />
                 ) : recipeIngredients.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: Colors.gray400, marginVertical: 40 }}>No ingredients set.</Text>
                 ) : (
                    recipeIngredients.map(ing => (
                       <View key={ing.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray50 }}>
                          <View>
                             <Text style={{ fontWeight: '500', color: Colors.gray900 }}>{products.find(p => p.id === ing.ingredient_id)?.name || "Unknown Item"}</Text>
                             <Text style={{ fontSize: 12, color: Colors.gray500 }}>Quantity: {ing.quantity}</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleRemoveIngredient(ing.id)}>
                             <Ionicons name="trash-outline" size={20} color={Colors.error} />
                          </TouchableOpacity>
                       </View>
                    ))
                 )}
              </RNScrollView>
           </View>
        </View>
      </Modal>

      {/* Ingredient Picker Modal */}
      <Modal visible={ingPickerVisible} animationType="fade" transparent>
         <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <View style={[styles.modalContent, { height: '70%', padding: 0 }]}>
               <View style={[styles.modalHeader, { padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.gray100 }]}>
                  <Text style={styles.modalTitle}>Select Ingredient</Text>
                  <TouchableOpacity onPress={() => setIngPickerVisible(false)}>
                     <Ionicons name="close" size={24} color={Colors.gray500} />
                  </TouchableOpacity>
               </View>
               <View style={{ padding: 16 }}>
                 <Input 
                    placeholder="Search products..."
                    value={ingSearch}
                    onChangeText={setIngSearch}
                    containerStyle={{ marginTop: 0 }}
                 />
               </View>
               <FlatList 
                  data={products.filter(p => 
                    p.id !== selectedProduct?.id && 
                    p.name.toLowerCase().includes(ingSearch.toLowerCase())
                  )}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                     <TouchableOpacity 
                        style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray50 }}
                        onPress={() => {
                           setSelectedIngId(item.id.toString())
                           setIngPickerVisible(false)
                           setIngSearch("")
                        }}
                     >
                        <Text style={{ fontSize: 16, color: Colors.gray900, fontWeight: '500' }}>{item.name}</Text>
                        <Text style={{ fontSize: 12, color: Colors.gray500 }}>{formatCurrency(item.price, business?.currency)} • {item.stock} in stock</Text>
                     </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingBottom: 20 }}
               />
            </View>
         </View>
      </Modal>

      {/* Category Management Modal */}
      <Modal visible={categoryModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Manage Categories</Text>
                 <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.gray500} />
                 </TouchableOpacity>
              </View>
              
              <View style={styles.categoryInputContainer}>
                 <Input 
                    placeholder="New Category Name"
                    value={newCatName}
                    onChangeText={setNewCatName}
                    containerStyle={{flex: 1, marginTop: 0}}
                 />
                 <Button 
                    title="Add" 
                    onPress={handleAddCategory} 
                    loading={loading && !editingCatId} 
                    disabled={!newCatName.trim()}
                    style={{width: 80}}
                 />
              </View>

              <RNScrollView style={styles.categoryList}>
                 {categories.map(cat => (
                    <View key={cat.id} style={styles.categoryItem}>
                       {editingCatId === cat.id.toString() ? (
                          <View style={styles.editContainer}>
                             <Input 
                                value={editCatName}
                                onChangeText={setEditCatName}
                                containerStyle={{flex: 1, marginTop: 0}}
                                autoFocus
                             />
                             <TouchableOpacity onPress={handleUpdateCategory} style={styles.iconBtn}>
                                <Ionicons name="checkmark" size={20} color={Colors.teal} />
                             </TouchableOpacity>
                             <TouchableOpacity onPress={() => setEditingCatId(null)} style={styles.iconBtn}>
                                <Ionicons name="close" size={20} color={Colors.gray500} />
                             </TouchableOpacity>
                          </View>
                       ) : (
                          <>
                             <Text style={styles.categoryName}>{cat.name}</Text>
                             <View style={styles.categoryActions}>
                                <TouchableOpacity onPress={() => {
                                   setEditingCatId(cat.id.toString())
                                   setEditCatName(cat.name)
                                }} style={styles.iconBtn}>
                                   <Ionicons name="pencil" size={20} color={Colors.gray500} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteCategory(cat.id.toString(), cat.name)} style={styles.iconBtn}>
                                   <Ionicons name="trash-outline" size={20} color={Colors.error} />
                                </TouchableOpacity>
                             </View>
                          </>
                       )}
                    </View>
                 ))}
                 {categories.length === 0 && (
                    <Text style={styles.emptyText}>No categories found.</Text>
                 )}
              </RNScrollView>
           </View>
        </View>
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
  deniedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.white,
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  noAccess: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  noAccessTitle: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginTop: 24,
    marginBottom: 8,
  },
  noAccessText: {
    fontSize: Typography.base,
    color: Colors.gray500,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  industrialSummary: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.teal + '20',
    backgroundColor: Colors.teal + '05',
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gray900,
    textTransform: 'uppercase',
  },
  roundMiniCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    width: 140,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  miniCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray700,
    marginBottom: 4,
  },
  miniCardValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.teal,
    marginBottom: 8,
  },
  miniProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  roundProgressContainer: {
    marginTop: -8,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.gray100,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.teal,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: Colors.gray500,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray900
  },
  categoryInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 20
  },
  categoryList: {
    maxHeight: 400
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100
  },
  categoryName: {
    fontSize: 16,
    color: Colors.gray900,
    fontWeight: '500'
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBtn: {
    padding: 8
  }
})
