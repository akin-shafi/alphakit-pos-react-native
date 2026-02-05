
import React, { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface SettingsContextType {
  enableTables: boolean
  enableDrafts: boolean
  enableTax: boolean
  taxRate: number
  toggleTables: () => Promise<void>
  toggleDrafts: () => Promise<void>
  toggleTax: () => Promise<void>
  updateTaxRate: (rate: number) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enableTables, setEnableTables] = useState(false)
  const [enableDrafts, setEnableDrafts] = useState(false)
  const [enableTax, setEnableTax] = useState(false)
  const [taxRate, setTaxRate] = useState(0)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const tables = await AsyncStorage.getItem("enableTables")
      const drafts = await AsyncStorage.getItem("enableDrafts")
      const tax = await AsyncStorage.getItem("enableTax")
      const rate = await AsyncStorage.getItem("taxRate")
      
      setEnableTables(tables === "true")
      setEnableDrafts(drafts === "true")
      setEnableTax(tax === "true")
      setTaxRate(rate ? parseFloat(rate) : 0)
    } catch (e) {
      console.warn("Failed to load settings", e)
    }
  }

  const toggleTables = async () => {
    const newValue = !enableTables
    setEnableTables(newValue)
    await AsyncStorage.setItem("enableTables", String(newValue))
  }

  const toggleDrafts = async () => {
    const newValue = !enableDrafts
    setEnableDrafts(newValue)
    await AsyncStorage.setItem("enableDrafts", String(newValue))
  }

  const toggleTax = async () => {
    const newValue = !enableTax
    setEnableTax(newValue)
    await AsyncStorage.setItem("enableTax", String(newValue))
  }

  const updateTaxRate = async (rate: number) => {
    setTaxRate(rate)
    await AsyncStorage.setItem("taxRate", String(rate))
  }

  return (
    <SettingsContext.Provider
      value={{
        enableTables,
        enableDrafts,
        enableTax,
        taxRate,
        toggleTables,
        toggleDrafts,
        toggleTax,
        updateTaxRate,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
