import type React from "react"
import { TouchableOpacity, Text, View, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Product } from "../types"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"

interface ProductTileProps {
  product: Product
  onPress: () => void
}

export const ProductTile: React.FC<ProductTileProps> = ({ product, onPress }) => {
  const lowStock = product.stock <= product.minStock

  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Ionicons name="cube-outline" size={32} color={Colors.gray400} />
        {lowStock && (
          <View style={styles.lowStockBadge}>
            <Ionicons name="warning" size={12} color={Colors.white} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.sku}>{product.sku}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <Text style={[styles.stock, lowStock && styles.stockLow]}>Stock: {product.stock}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    minHeight: 180,
  },
  imageContainer: {
    height: 80,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  lowStockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.warning,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  sku: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    marginBottom: 8,
  },
  price: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.black,
    marginBottom: 4,
  },
  stock: {
    fontSize: Typography.xs,
    color: Colors.gray600,
  },
  stockLow: {
    color: Colors.warning,
    fontWeight: Typography.semibold,
  },
})
