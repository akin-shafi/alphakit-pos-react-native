

import React, { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthService } from "../services/AuthService"
import type { User, Business, Tenant, RegisterBusinessPayload } from "../types"

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  business: Business | null
  isAuthenticated: boolean
  loading: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>

  registerBusiness: (payload: RegisterBusinessPayload) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    restoreSession()
  }, [])

  const restoreSession = async () => {
    try {
      const [userStr, tenantStr, businessStr] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("tenant"),
        AsyncStorage.getItem("business"),
      ])

      if (userStr) setUser(JSON.parse(userStr))
      if (tenantStr) setTenant(JSON.parse(tenantStr))
      if (businessStr) setBusiness(JSON.parse(businessStr))
    } catch (e) {
      console.warn("Failed to restore session", e)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await AuthService.login(email, password)

      setUser(res.user)
      setTenant(res.tenant)
      setBusiness(res.business)

      await AsyncStorage.multiSet([
        ["user", JSON.stringify(res.user)],
        ["tenant", JSON.stringify(res.tenant)],
        ["business", JSON.stringify(res.business)],
      ])
    } finally {
      setLoading(false)
    }
  }

  const registerBusiness = async (payload: RegisterBusinessPayload): Promise<void> => {
    setLoading(true)
    try {
      const res = await AuthService.registerBusiness(payload)

      setUser(res.user)
      setTenant(res.tenant)
      setBusiness(res.business)

      await AsyncStorage.multiSet([
        ["user", JSON.stringify(res.user)],
        ["tenant", JSON.stringify(res.tenant)],
        ["business", JSON.stringify(res.business)],
        ["accessToken", res.accessToken],
        ["refreshToken", res.refreshToken],
      ])
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await AuthService.logout()
    } catch (e) {
      console.warn("Logout error", e)
    } finally {
      await AsyncStorage.multiRemove(["user", "tenant", "business", "accessToken", "refreshToken"])
      setUser(null)
      setTenant(null)
      setBusiness(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        business,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        registerBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
