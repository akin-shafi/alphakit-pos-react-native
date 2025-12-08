"use client"

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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Input } from "./Input"
import { Button } from "./Button"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"
import type { Product } from "../types"

const CATEGORIES = ["Bakery", "Beverages", "Dairy", "Snacks"]

interface ProductDrawerProps {
  visible: boolean
  onClose: () => void
  onSave: (product: Partial<Product>) => void
  product?: Product | null
  mode: "add" | "edit"
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({ visible, onClose, onSave, product, mode }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost: "",
    stock: "",
    category: "Bakery",
    sku: "",
    barcode: "",
  })

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        category: product.category,
        sku: product.sku,
        barcode: product.barcode || "",
      })
    } else {
      setFormData({
        name: "",
        price: "",
        cost: "",
        stock: "",
        category: "Bakery",
        sku: "",
        barcode: "",
      })
    }
  }, [product, mode, visible])

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      alert("Please fill required fields")
      return
    }

    onSave({
      ...product,
      name: formData.name,
      price: Number.parseFloat(formData.price) || 0,
      cost: Number.parseFloat(formData.cost) || 0,
      stock: Number.parseInt(formData.stock) || 0,
      category: formData.category,
      sku: formData.sku,
      barcode: formData.barcode,
    })
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.drawer}>
          <View style={styles.header}>
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

              <Input
                label="Stock Quantity"
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                keyboardType="number-pad"
              />

              <View>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, formData.category === cat && styles.categoryChipActive]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text style={[styles.categoryText, formData.category === cat && styles.categoryTextActive]}>
                        {cat}
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
            <Button
              title={mode === "add" ? "Add Product" : "Update Product"}
              onPress={handleSave}
              fullWidth
              size="lg"
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
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  closeButton: {
    padding: 4,
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
  },
})
