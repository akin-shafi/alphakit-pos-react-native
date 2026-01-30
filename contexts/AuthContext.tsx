"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { User, Business, Branch } from "../types"
import { UserRole } from "../constants/Roles"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface AuthContextType {
  user: User | null
  business: Business | null
  branch: Branch | null
  isAuthenticated: boolean
  login: (businessId: string, pin: string) => Promise<void>
  logout: () => Promise<void>
  registerBusiness: (businessData: Partial<Business>) => Promise<void>
  setupAdmin: (adminData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data for MVP
const MOCK_BUSINESS: Business = {
  id: "1",
  businessId: "BIZ001",
  name: "Demo Retail Store",
  type: "retail",
  address: "123 Main St, City",
  phone: "+1234567890",
  email: "info@demo.com",
  createdAt: new Date(),
}

const MOCK_BRANCH: Branch = {
  id: "1",
  businessId: "1",
  name: "Main Branch",
  address: "123 Main St, City",
  phone: "+1234567890",
  isActive: true,
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    businessId: "1",
    branchId: "1",
    name: "Admin User",
    email: "admin@demo.com",
    role: UserRole.ADMIN,
    pin: "1234",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    businessId: "1",
    branchId: "1",
    name: "Manager User",
    email: "manager@demo.com",
    role: UserRole.MANAGER,
    pin: "5678",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    businessId: "1",
    branchId: "1",
    name: "Cashier User",
    email: "cashier@demo.com",
    role: UserRole.CASHIER,
    pin: "9999",
    isActive: true,
    createdAt: new Date(),
  },
]

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user")
      const storedBusiness = await AsyncStorage.getItem("business")
      const storedBranch = await AsyncStorage.getItem("branch")

      if (storedUser && storedBusiness && storedBranch) {
        setUser(JSON.parse(storedUser))
        setBusiness(JSON.parse(storedBusiness))
        setBranch(JSON.parse(storedBranch))
      }
    } catch (error) {
      console.error("Error loading stored auth:", error)
    }
  }

  const login = async (businessId: string, pin: string) => {
    // Mock login logic
    if (businessId === MOCK_BUSINESS.businessId) {
      const foundUser = MOCK_USERS.find((u) => u.pin === pin)
      if (foundUser) {
        setUser(foundUser)
        setBusiness(MOCK_BUSINESS)
        setBranch(MOCK_BRANCH)

        await AsyncStorage.setItem("user", JSON.stringify(foundUser))
        await AsyncStorage.setItem("business", JSON.stringify(MOCK_BUSINESS))
        await AsyncStorage.setItem("branch", JSON.stringify(MOCK_BRANCH))
      } else {
        throw new Error("Invalid PIN")
      }
    } else {
      throw new Error("Business not found")
    }
  }

  const logout = async () => {
    setUser(null)
    setBusiness(null)
    setBranch(null)

    await AsyncStorage.removeItem("user")
    await AsyncStorage.removeItem("business")
    await AsyncStorage.removeItem("branch")
  }

  const registerBusiness = async (businessData: Partial<Business>) => {
    // Mock registration
    const newBusiness: Business = {
      ...MOCK_BUSINESS,
      ...businessData,
      id: Date.now().toString(),
      businessId: `BIZ${Date.now()}`,
      createdAt: new Date(),
    }
    setBusiness(newBusiness)
    await AsyncStorage.setItem("business", JSON.stringify(newBusiness))
  }

  const setupAdmin = async (adminData: Partial<User>) => {
    // Mock admin setup
    const newAdmin: User = {
      ...MOCK_USERS[0],
      ...adminData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setUser(newAdmin)
    await AsyncStorage.setItem("user", JSON.stringify(newAdmin))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        branch,
        isAuthenticated: !!user,
        login,
        logout,
        registerBusiness,
        setupAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
