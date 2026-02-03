import React, { createContext, useState, useContext } from "react"
import { Alert } from "react-native"
import type { CartItem, Product } from "../types"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  updateDiscount: (productId: number, discount: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const TAX_RATE = 0 // 0% tax by default accuracy

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: Product, quantity = 1) => {
    // Check if product is out of stock
    if (product.stock <= 0) {
      Alert.alert("Out of Stock", `${product.name} is currently out of stock.`)
      return
    }

    setItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id)
      const currentQuantity = existingItem ? existingItem.quantity : 0
      const newQuantity = currentQuantity + quantity

      // Check if new quantity exceeds available stock
      if (newQuantity > product.stock) {
        Alert.alert(
          "Insufficient Stock",
          `Only ${product.stock} units of ${product.name} available. You already have ${currentQuantity} in cart.`
        )
        return prev
      }

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQuantity } : item,
        )
      }
      return [...prev, { product, quantity, discount: 0 }]
    })
  }

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId)
      if (!item) return prev

      // Check if quantity exceeds available stock
      if (quantity > item.product.stock) {
        Alert.alert(
          "Insufficient Stock",
          `Only ${item.product.stock} units of ${item.product.name} available.`
        )
        return prev
      }

      return prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    })
  }

  const updateDiscount = (productId: number, discount: number) => {
    setItems((prev) => prev.map((item) => (item.product.id === productId ? { ...item, discount } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const itemTotal = item.product.price * item.quantity
      return total + itemTotal - item.discount
    }, 0)
  }

  const getTax = () => {
    return getSubtotal() * TAX_RATE
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateDiscount,
        clearCart,
        getSubtotal,
        getTax,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
