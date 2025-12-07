// Sales service - Ready for backend integration
import type { Sale } from "../types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.yourpos.com"

export const SalesService = {
  /**
   * Create new sale transaction
   * @param sale - Sale data
   * @returns Created sale with ID
   */
  async createSale(sale: Partial<Sale>): Promise<Sale> {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sale),
    })

    if (!response.ok) {
      throw new Error("Failed to create sale")
    }

    return response.json()
  },

  /**
   * Get sales for a date range
   * @param businessId - Business identifier
   * @param startDate - Start date
   * @param endDate - End date
   * @returns List of sales
   */
  async getSales(businessId: string, startDate: Date, endDate: Date): Promise<Sale[]> {
    const params = new URLSearchParams({
      businessId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })

    const response = await fetch(`${API_BASE_URL}/sales?${params}`)

    if (!response.ok) {
      throw new Error("Failed to fetch sales")
    }

    return response.json()
  },

  /**
   * Void a sale transaction
   * @param saleId - Sale ID
   * @returns Updated sale
   */
  async voidSale(saleId: string): Promise<Sale> {
    const response = await fetch(`${API_BASE_URL}/sales/${saleId}/void`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to void sale")
    }

    return response.json()
  },
}
