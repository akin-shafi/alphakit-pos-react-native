import type { UserRole } from "../constants/Roles"

export interface Business {
  id: string
  businessId: string
  name: string
  type: "retail" | "restaurant" | "pharmacy" | "grocery" | "default"
  address: string
  phone: string
  email: string
  logo?: string
  createdAt: Date
}

export interface Branch {
  id: string
  businessId: string
  name: string
  address: string
  phone: string
  isActive: boolean
}

export interface User {
  id: string
  businessId: string
  branchId: string
  name: string
  email: string
  role: UserRole
  pin: string
  isActive: boolean
  createdAt: Date
}

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
  branchId: string
  userId: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "card" | "transfer" | "credit" | "external-terminal"
  externalTerminalProvider?: "moniepoint" | "opay" | "other"
  status: "completed" | "pending" | "voided"
  createdAt: Date
  syncStatus: "synced" | "pending" | "failed"
}

export interface ConnectionStatus {
  isOnline: boolean
  lastSyncTime: Date | null
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
