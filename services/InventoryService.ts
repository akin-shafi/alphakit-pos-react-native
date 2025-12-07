// Inventory service - Ready for backend integration
import type { Product } from "../types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.yourpos.com"

export const InventoryService = {
  /**
   * Fetch all products for a business
   * @param businessId - Business identifier
   * @returns List of products
   */
  async getProducts(businessId: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products?businessId=${businessId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }

    return response.json()
  },

  /**
   * Create new product
   * @param product - Product data
   * @returns Created product
   */
  async createProduct(product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })

    if (!response.ok) {
      throw new Error("Failed to create product")
    }

    return response.json()
  },

  /**
   * Update existing product
   * @param productId - Product ID
   * @param updates - Product updates
   * @returns Updated product
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error("Failed to update product")
    }

    return response.json()
  },

  /**
   * Delete product
   * @param productId - Product ID
   */
  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete product")
    }
  },
}
