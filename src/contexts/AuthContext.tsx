"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthService } from "../services/AuthService"
import type { User, Business, Tenant, RegisterBusinessPayload } from "../types"

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  business: Business | null
  isAuthenticated: boolean

  login: (identifier: string, pin: string) => Promise<void>
  logout: () => Promise<void>

  registerBusiness: (payload: {
    business: {
      name: string
      type: string
      address?: string
      email?: string
      phone?: string
    }
    owner: {
      firstName: string
      lastName: string
      email: string
    }
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)

  useEffect(() => {
    restoreSession()
  }, [])

  const restoreSession = async () => {
    try {
      const [user, tenant, business] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("tenant"),
        AsyncStorage.getItem("business"),
      ])

      if (user) setUser(JSON.parse(user))
      if (tenant) setTenant(JSON.parse(tenant))
      if (business) setBusiness(JSON.parse(business))
    } catch (e) {
      console.warn("Failed to restore session")
    }
  }

  const login = async (identifier: string, pin: string) => {
    const res = await AuthService.login(identifier, pin)

    setUser(res.user)
    setTenant(res.tenant)
    setBusiness(res.business)

    await AsyncStorage.multiSet([
      ["user", JSON.stringify(res.user)],
      ["tenant", JSON.stringify(res.tenant)],
      ["business", JSON.stringify(res.business)],
    ])
  }

  const registerBusiness = async (
  payload: RegisterBusinessPayload
): Promise<void> => {
  const res = await AuthService.registerBusiness(payload)

  // Now res has user, business, tenant, tokens
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
}

  const logout = async () => {
    await AuthService.logout()
    await AsyncStorage.multiRemove(["user", "tenant", "business"])
    setUser(null)
    setTenant(null)
    setBusiness(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        business,
        isAuthenticated: !!user,
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
