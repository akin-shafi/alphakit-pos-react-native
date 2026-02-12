import type { UserRole } from "../constants/Roles"

/**
 * ======================
 * CORE DOMAIN ENTITIES
 * ======================
 */

export interface Tenant {
  id: string
  name: string
  owner_id: number
  created_at?: string
  updated_at?: string
}

export interface Business {
  id: number
  tenant_id: string
  name: string
  type:
    | "restaurant"
    | "pharmacy"
    | "gas_station"
    | "boutique"
    | "retail"
    | "bar"
    | "supermarket"
    | "other"
    | "SERVICE"
  address?: string
  city?: string
  phone?: string
  currency?: string
  is_seeded?: boolean
  subscription_status?: string
  active_modules?: string[]
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  tenant_id: string
  first_name: string
  last_name: string
  email: string
  password: string
  role: string
  active: boolean
  is_verified: boolean
  outlet_id?: number | null
  created_at?: string
  updated_at?: string
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
    currency: string
    modules?: string[]
    bundle_code?: string
    skip_trial?: boolean
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
  id: number
  business_id: number
  category_id: number
  name: string
  sku: string
  description?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  image_url?: string
  barcode?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: number
  business_id: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
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
  status: "completed" | "pending" | "voided" | "DRAFT" | "HELD"
  preparation_status?: PrepStatus
  createdAt: string
  syncStatus: "synced" | "pending" | "failed"
  cashierName?: string
  receiptNo?: string
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

export type PrepStatus = "PENDING" | "PREPARING" | "READY" | "SERVED";

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  preparation_status: PrepStatus;
}
