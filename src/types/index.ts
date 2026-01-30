import type { UserRole } from "../constants/Roles"

/**
 * ======================
 * CORE DOMAIN ENTITIES
 * ======================
 */

export interface Tenant {
  id: string
  name: string
  createdAt: string
}

export interface Business {
  id: string
  tenantId: string
  name: string
  type:
    | "restaurant"
    | "pharmacy"
    | "gas_station"
    | "boutique"
    | "retail"
    | "bar"
  address?: string
  city?: string
  currency?: string
  createdAt: string
}

export interface User {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}


// Add this near your other interfaces
export interface RegisterBusinessPayload {
  business: {
    name: string
    type: string
    address: string
    city: string
    email?: string
    phone?: string
  }
  user: {
    first_name: string
    last_name: string
    email: string
    password: string
  }
}

export interface RegisterBusinessResponse {
  user: User
  business: Business
  tenant: Tenant
  accessToken: string
  refreshToken: string
}

/**
 * ======================
 * AUTH & SESSION
 * ======================
 */

export interface AuthResponse {
  user: User
  tenant: Tenant
  businesses: Business[]
}

export interface LoginPayload {
  identifier: string // email or phone
  pin: string
}

/**
 * ======================
 * BUSINESS OPERATIONS
 * ======================
 */

export interface Product {
  id: string
  businessId: string
  name: string
  sku: string
  barcode?: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  image?: string
  isActive: boolean
}

export interface Category {
  id: string
  businessId: string
  name: string
  icon: string
  color: string
  sortOrder: number
}

export interface CartItem {
  product: Product
  quantity: number
  discount: number
  note?: string
}

export interface Sale {
  id: string
  businessId: string
  userId: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "card" | "transfer" | "credit" | "external-terminal"
  externalTerminalProvider?: "moniepoint" | "opay" | "other"
  status: "completed" | "pending" | "voided"
  createdAt: string
}

/**
 * ======================
 * SYSTEM & SYNC
 * ======================
 */

export interface ConnectionStatus {
  isOnline: boolean
  lastSyncTime: string | null
  pendingSyncCount: number
}

export interface PaymentConfig {
  defaultMode: "ask-every-time" | "in-app-card" | "external-terminal"
  enabledMethods: {
    cash: boolean
    card: boolean
    transfer: boolean
    credit: boolean
    externalTerminal: boolean
  }
  externalTerminalProviders: Array<"moniepoint" | "opay" | "other">
}
