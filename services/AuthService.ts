// Authentication service - Ready for backend integration
import type { User, Business } from "../types"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.yourpos.com"

export const AuthService = {
  /**
   * Login user with business ID and PIN
   * @param businessId - Business identifier
   * @param pin - User PIN
   * @returns User and Business data
   */
  async login(businessId: string, pin: string): Promise<{ user: User; business: Business }> {
    // TODO: Replace with actual API call
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, pin }),
    })

    if (!response.ok) {
      throw new Error("Invalid credentials")
    }

    return response.json()
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // TODO: Clear session on backend
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    })
  },

  /**
   * Register new business
   * @param businessData - Business information
   * @returns Created business
   */
  async registerBusiness(businessData: Partial<Business>): Promise<Business> {
    const response = await fetch(`${API_BASE_URL}/business/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(businessData),
    })

    if (!response.ok) {
      throw new Error("Failed to register business")
    }

    return response.json()
  },
}
