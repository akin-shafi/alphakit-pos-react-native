

import React, { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { DeviceEventEmitter, Alert } from "react-native"
import { AuthService } from "../services/AuthService"
import { Shift, ShiftService } from "../services/ShiftService"
import { SESSION_EXPIRED_EVENT } from "../services/ApiClient"
import type { User, Business, Tenant, RegisterBusinessPayload } from "../types"

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  business: Business | null
  lastLoggedUser: { name: string; email: string } | null
  isAuthenticated: boolean
  loading: boolean

  login: (email: string, password: string) => Promise<void>
  loginSuccess: (data: any) => Promise<void> // Helper for OTP flow
  logout: () => Promise<void>
  registerBusiness: (payload: RegisterBusinessPayload) => Promise<void>
  setBusiness: (business: Business) => Promise<void>
  resetInactivityTimer: () => void
  activeShift: Shift | null
  checkActiveShift: () => Promise<void>
}



// ... existing code ...



const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [lastLoggedUser, setLastLoggedUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null)
  const [activeShift, setActiveShift] = useState<Shift | null>(null)

  const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  useEffect(() => {
    restoreSession()
    
    // Listen for session expired events from API client
    const subscription = DeviceEventEmitter.addListener(SESSION_EXPIRED_EVENT, () => {
      console.log("[AuthContext] Session expired event received, logging out...")
      handleSessionExpired()
    })
    
    return () => {
      subscription.remove()
    }
  }, [])

  const restoreSession = async () => {
    try {
      const [userStr, tenantStr, businessStr, lastUserStr] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("tenant"),
        AsyncStorage.getItem("business"),
        AsyncStorage.getItem("lastLoggedUser"),
      ])

      if (userStr) setUser(JSON.parse(userStr))
      if (tenantStr) setTenant(JSON.parse(tenantStr))
      if (businessStr) setBusiness(JSON.parse(businessStr))
      if (lastUserStr) setLastLoggedUser(JSON.parse(lastUserStr))
      
      if (userStr) {
        startInactivityTimer()
        // Check for active shift and profile in background
        checkActiveShift()
        checkProfile()
      }
    } catch (e) {
      console.warn("Failed to restore session", e)
    }
  }

  const startInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    const timer = setTimeout(() => {
      logout()
    }, INACTIVITY_TIMEOUT)
    setInactivityTimer(timer)
  }

  const resetInactivityTimer = () => {
    if (user) {
      // Don't auto-logout kitchen staff during busy shifts
      const isKitchen = user.role === "KITCHEN" || user.role === "CHEF" || user.role === "BARTENDER";
      if (!isKitchen) {
        startInactivityTimer()
      }
    }
  }

  const checkActiveShift = async () => {
    try {
      const shift = await ShiftService.getActiveShift()
      setActiveShift(shift)
    } catch (e) {
      console.log("Failed to check active shift", e)
      // Don't fail the whole app for this
    }
  }

  const checkProfile = async () => {
    try {
      const res = await AuthService.getProfile()
      
      setUser(res.user)
      setTenant(res.tenant)
      setBusiness(res.business) // This will trigger SettingsContext to update!

      // Update storage silently
      await AsyncStorage.multiSet([
        ["user", JSON.stringify(res.user)],
        ["tenant", JSON.stringify(res.tenant)],
        ["business", JSON.stringify(res.business)],
      ])
    } catch (e) {
      console.log("Failed to refresh profile in background", e)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await AuthService.login(email, password)

      setUser(res.user)
      setTenant(res.tenant)
      setBusiness(res.business)

      const lastUser = {
        name: `${res.user.first_name} ${res.user.last_name}`,
        email: res.user.email,
      }
      setLastLoggedUser(lastUser)

      await AsyncStorage.multiSet([
        ["user", JSON.stringify(res.user)],
        ["tenant", JSON.stringify(res.tenant)],
        ["business", JSON.stringify(res.business)],
        ["lastLoggedUser", JSON.stringify(lastUser)],
        ["tenantId", res.tenant.id.toString()],
        ["currentBusinessId", res.business.id.toString()],
      ])
      
      startInactivityTimer()
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
        ["tenantId", res.tenant?.id?.toString() || ""],
        ["currentBusinessId", res.business?.id?.toString() || ""],
      ])
    } finally {
      setLoading(false)
    }
  }

  const loginSuccess = async (data: any) => {
    setUser(data.user)
    setTenant(data.tenant)
    setBusiness(data.business)

    const lastUser = {
      name: `${data.user.first_name} ${data.user.last_name}`,
      email: data.user.email,
    }
    setLastLoggedUser(lastUser)

    const tenantId = (data.tenant?.id || data.tenant_id || data.user?.tenant_id || "").toString()

    const storageData: [string, string][] = [
      ["user", JSON.stringify(data.user)],
      ["tenant", JSON.stringify(data.tenant)],
      ["business", JSON.stringify(data.business)],
      ["lastLoggedUser", JSON.stringify(lastUser)],
      ["tenantId", tenantId],
      ["currentBusinessId", data.business.id.toString()],
    ]

    if (data.accessToken) storageData.push(["accessToken", data.accessToken])
    if (data.refreshToken) storageData.push(["refreshToken", data.refreshToken])

    await AsyncStorage.multiSet(storageData)
    startInactivityTimer()
    await checkActiveShift()
  }

  const setBusinessData = async (newBusiness: Business) => {
    setBusiness(newBusiness)
    await AsyncStorage.setItem("business", JSON.stringify(newBusiness))
  }

  const logout = async () => {
    setLoading(true)
    if (inactivityTimer) clearTimeout(inactivityTimer)
    try {
      await AuthService.logout()
    } catch (e) {
      console.warn("Logout error", e)
    } finally {
      await AsyncStorage.multiRemove(["user", "tenant", "business", "accessToken", "refreshToken", "tenantId", "currentBusinessId"])
      setUser(null)
      setTenant(null)
      setBusiness(null)
      setActiveShift(null)
      setLoading(false)
    }
  }

  const handleSessionExpired = async () => {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    
    // Clear state immediately
    await AsyncStorage.multiRemove(["user", "tenant", "business", "accessToken", "refreshToken", "tenantId", "currentBusinessId"])
    setUser(null)
    setTenant(null)
    setBusiness(null)
    setActiveShift(null)
    
    // Show alert to user
    // Alert.alert(
    //   "Session Expired",
    //   "Your session has expired. Please log in again.",
    //   [{ text: "OK" }]
    // )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        business,
        lastLoggedUser,
        isAuthenticated: !!user,
        loading,
        login,
        loginSuccess,
        logout,
        registerBusiness,
        setBusiness: setBusinessData,
        resetInactivityTimer,
        activeShift,
        checkActiveShift,
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
