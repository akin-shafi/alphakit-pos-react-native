import React, { createContext, useState, useContext, useEffect } from "react"
import type { Product, Category } from "../types"
import { InventoryService } from "../services/InventoryService"
import { CategoryService } from "../services/CategoryService"
import { useAuth } from "./AuthContext"

interface InventoryContextType {
  products: Product[]
  categories: Category[]
  loading: boolean
  searchQuery: string
  selectedCategory: string | null
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  getFilteredProducts: () => Product[]
  refreshData: () => Promise<void>
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>
  addProduct: (product: Partial<Product>) => Promise<void>
  deleteProduct: (productId: string) => Promise<void>
  addCategory: (name: string) => Promise<void>
  updateCategory: (id: string, name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { business } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (business) {
        refreshData()
    } else {
        setProducts([])
        setCategories([])
    }
  }, [business?.id])

  // ... (refreshData, getFilteredProducts, updateProduct, addProduct, deleteProduct - omitted for brevity, keeping existing)

  const refreshData = async () => {
    if (!business?.id) return
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        InventoryService.getProducts(business.id.toString()),
        CategoryService.getCategories(),
      ])
      setProducts(p)
      setCategories(c)
    } catch (e) {
      console.error("Failed to fetch inventory data", e)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredProducts = () => {
    let filtered = products

    // Filter by category (using category_id which is a number now)
    if (selectedCategory && selectedCategory !== "All") {
      // Find the category by id or name if selectedCategory is ID
      const cat = categories.find(c => c.id.toString() === selectedCategory || c.name === selectedCategory)
      if (cat) {
        filtered = filtered.filter((p) => p.category_id === cat.id)
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((p) => 
        p.name.toLowerCase().includes(query) || 
        (p.sku && p.sku.toLowerCase().includes(query))
      )
    }

    return filtered
  }

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const updated = await InventoryService.updateProduct(productId, updates)
      setProducts((prev) => prev.map((p) => (p.id.toString() === productId.toString() ? updated : p)))
    } catch (e) {
      console.error("Failed to update product", e)
      throw e
    }
  }

  const addProduct = async (product: Partial<Product>) => {
    try {
      const created = await InventoryService.createProduct(product)
      setProducts((prev) => [...prev, created])
    } catch (e) {
      console.error("Failed to create product", e)
      throw e
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      await InventoryService.deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id.toString() !== productId.toString()))
    } catch (e) {
      console.error("Failed to delete product", e)
      throw e
    }
  }

  const addCategory = async (name: string) => {
    try {
      const created = await CategoryService.createCategory({ name })
      setCategories((prev) => [...prev, created])
    } catch (e) {
      console.error("Failed to create category", e)
      throw e
    }
  }

  const updateCategory = async (id: string, name: string) => {
    try {
      const updated = await CategoryService.updateCategory(id, { name })
      setCategories((prev) => prev.map((c) => (c.id.toString() === id ? updated : c)))
    } catch (e) {
      console.error("Failed to update category", e)
      throw e
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await CategoryService.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id.toString() !== id))
    } catch (e) {
      console.error("Failed to delete category", e)
      throw e
    }
  }

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        loading,
        searchQuery,
        selectedCategory,
        setSearchQuery,
        setSelectedCategory,
        getFilteredProducts,
        refreshData,
        updateProduct,
        addProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
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
