

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Input } from "./Input"
import { Button } from "./Button"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"
import type { Product } from "../types"
import { useInventory } from "../contexts/InventoryContext"

interface ProductDrawerProps {
  visible: boolean
  onClose: () => void
  onSave: (product: Partial<Product>) => Promise<void>
  onDelete?: (productId: string) => Promise<void>
  product?: Product | null
  mode: "add" | "edit"
  onManageRecipe?: (product: Product) => void
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({ visible, onClose, onSave, onDelete, product, mode, onManageRecipe }) => {
  const { categories } = useInventory()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost: "",
    stock: "",
    min_stock: "",
    category_id: 0,
    sku: "",
    barcode: "",
  })

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        cost: (product.cost || 0).toString(),
        stock: product.stock.toString(),
        min_stock: (product.min_stock || 0).toString(),
        category_id: product.category_id,
        sku: product.sku,
        barcode: product.barcode || "",
      })
    } else {
      setFormData({
        name: "",
        price: "",
        cost: "",
        stock: "",
        min_stock: "",
        category_id: categories[0]?.id || 0,
        sku: "",
        barcode: "",
      })
    }
  }, [product, mode, visible, categories])

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      Alert.alert("Validation Error", "Please fill all required fields (Name, Price, Stock)")
      return
    }

    setSaving(true)
    try {
      await onSave({
        ...product,
        name: formData.name,
        price: Number.parseFloat(formData.price) || 0,
        cost: Number.parseFloat(formData.cost) || 0,
        stock: Number.parseInt(formData.stock) || 0,
        min_stock: Number.parseInt(formData.min_stock) || 0,
        category_id: formData.category_id,
        sku: formData.sku,
        barcode: formData.barcode,
        active: true,
      })
      onClose()
    } catch (e) {
      // Error is handled in parent
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!product || !onDelete) return

    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true)
            try {
              await onDelete(product.id.toString())
              onClose()
            } catch (e) {
              // Error is handled in parent
            } finally {
              setDeleting(false)
            }
          },
        },
      ]
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.drawer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {mode === "edit" && onDelete && (
                <TouchableOpacity 
                  onPress={handleDelete} 
                  style={styles.deleteIconButton}
                  disabled={deleting}
                >
                  <Ionicons name="trash-outline" size={22} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.title}>{mode === "add" ? "Add Product" : "Edit Product"}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.gray700} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <Input
                label="Product Name *"
                placeholder="Enter product name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label="Price *"
                    placeholder="0.00"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="Cost"
                    placeholder="0.00"
                    value={formData.cost}
                    onChangeText={(text) => setFormData({ ...formData, cost: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label="Stock Quantity *"
                    placeholder="0"
                    value={formData.stock}
                    onChangeText={(text) => setFormData({ ...formData, stock: text })}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="Min. Stock"
                    placeholder="0"
                    value={formData.min_stock}
                    onChangeText={(text) => setFormData({ ...formData, min_stock: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, formData.category_id === cat.id && styles.categoryChipActive]}
                      onPress={() => setFormData({ ...formData, category_id: cat.id })}
                    >
                      <Text style={[styles.categoryText, formData.category_id === cat.id && styles.categoryTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label="SKU"
                    placeholder="SKU-001"
                    value={formData.sku}
                    onChangeText={(text) => setFormData({ ...formData, sku: text })}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="Barcode"
                    placeholder="123456789"
                    value={formData.barcode}
                    onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {mode === "edit" && onManageRecipe && product && (
              <Button
                title="Manage Recipe (BOM)"
                onPress={() => onManageRecipe(product)}
                fullWidth
                variant="outline"
                size="lg"
                style={{ marginBottom: 12 }}
                primaryColor={Colors.teal}
              />
            )}
            <Button
              title={mode === "add" ? "Add Product" : "Update Product"}
              onPress={handleSave}
              fullWidth
              size="lg"
              loading={saving}
              disabled={saving || deleting}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  deleteIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.red50 || "#FEE2E2",
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 4,
    width: 40,
    alignItems: "flex-end",
  },
  content: {
    maxHeight: 500,
  },
  form: {
    padding: 24,
    gap: 20,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.gray700,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    gap: 12,
  },
  deleteButton: {
    marginBottom: 0,
  },
})
