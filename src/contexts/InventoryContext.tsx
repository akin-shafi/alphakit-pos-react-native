"use client"

import type React from "react"
import { createContext, useState, useContext } from "react"
import type { Product, Category } from "../types"

interface InventoryContextType {
  products: Product[]
  categories: Category[]
  searchQuery: string
  selectedCategory: string | null
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  getFilteredProducts: () => Product[]
  updateProduct: (product: Product) => void
  addProduct: (product: Product) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

// Mock data for MVP
const MOCK_CATEGORIES: Category[] = [
  { id: "1", businessId: "1", name: "All", icon: "apps", color: "#6B7280", sortOrder: 0 },
  { id: "2", businessId: "1", name: "Beverages", icon: "cafe", color: "#059669", sortOrder: 1 },
  { id: "3", businessId: "1", name: "Snacks", icon: "fast-food", color: "#DC2626", sortOrder: 2 },
  { id: "4", businessId: "1", name: "Electronics", icon: "phone-portrait", color: "#2563EB", sortOrder: 3 },
  { id: "5", businessId: "1", name: "Groceries", icon: "cart", color: "#7C3AED", sortOrder: 4 },
]

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    businessId: "1",
    name: "Coca Cola 500ml",
    sku: "BEV001",
    category: "Beverages",
    price: 2.5,
    cost: 1.5,
    stock: 150,
    minStock: 20,
    isActive: true,
  },
  {
    id: "2",
    businessId: "1",
    name: "Pepsi 500ml",
    sku: "BEV002",
    category: "Beverages",
    price: 2.5,
    cost: 1.5,
    stock: 120,
    minStock: 20,
    isActive: true,
  },
  {
    id: "3",
    businessId: "1",
    name: "Lays Chips Original",
    sku: "SNK001",
    category: "Snacks",
    price: 3.99,
    cost: 2.0,
    stock: 85,
    minStock: 15,
    isActive: true,
  },
  {
    id: "4",
    businessId: "1",
    name: "Pringles Sour Cream",
    sku: "SNK002",
    category: "Snacks",
    price: 4.99,
    cost: 2.5,
    stock: 60,
    minStock: 10,
    isActive: true,
  },
  {
    id: "5",
    businessId: "1",
    name: "USB-C Cable",
    sku: "ELC001",
    category: "Electronics",
    price: 12.99,
    cost: 5.0,
    stock: 45,
    minStock: 10,
    isActive: true,
  },
  {
    id: "6",
    businessId: "1",
    name: "Wireless Mouse",
    sku: "ELC002",
    category: "Electronics",
    price: 24.99,
    cost: 12.0,
    stock: 30,
    minStock: 5,
    isActive: true,
  },
  {
    id: "7",
    businessId: "1",
    name: "White Bread",
    sku: "GRC001",
    category: "Groceries",
    price: 2.99,
    cost: 1.2,
    stock: 40,
    minStock: 10,
    isActive: true,
  },
  {
    id: "8",
    businessId: "1",
    name: "Milk 1L",
    sku: "GRC002",
    category: "Groceries",
    price: 3.49,
    cost: 1.8,
    stock: 65,
    minStock: 15,
    isActive: true,
  },
]

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [categories] = useState<Category[]>(MOCK_CATEGORIES)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const getFilteredProducts = () => {
    let filtered = products

    // Filter by category
    if (selectedCategory && selectedCategory !== "1") {
      const category = categories.find((c) => c.id === selectedCategory)
      if (category) {
        filtered = filtered.filter((p) => p.category === category.name)
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query))
    }

    return filtered
  }

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
  }

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product])
  }

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        searchQuery,
        selectedCategory,
        setSearchQuery,
        setSelectedCategory,
        getFilteredProducts,
        updateProduct,
        addProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export const useInventory = () => {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider")
  }
  return context
}
